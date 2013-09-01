var express = require('express');
var passport = require('passport');
var BasicStrategy       = require('passport-http').BasicStrategy;
var PassportHerokuAddon = require('../');
var resources = [];

function get_resource(id) {
 id = parseInt(id, 10);
 for (var i in resources) {
   if(resources[i].id == id){
     return resources[i];
   }
 }
}

function destroy_resource(id) {
 id = parseInt(id, 10);
 for (var i in resources) {
   if(resources[i].id == id){
     delete resources[i];
   }
 }
}

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new BasicStrategy(
  function(username, password, done) {
    if (username !== process.env.HEROKU_USERNAME || password !== process.env.HEROKU_PASSWORD) {
      return done(null, false);
    }
    return done(null, {
      user: username
    });
  }
));

passport.use(new PassportHerokuAddon({
  sso_salt: process.env.SSO_SALT
}));

var app = express();

app.configure(function(){
  this.set("view engine", "ejs");
  this.set("views", __dirname + "/views");
  app.use(express.cookieParser());
  app.use(express.session({ secret: process.env.SSO_SALT }));
  app.use(passport.initialize());
  app.use(passport.session());
});

//Provision
app.post('/heroku/resources', 
  express.bodyParser(), 
  passport.authenticate('basic', { session: false }), 
  function(request, response) {
    console.log(request.body);
    var resource =  {id : resources.length + 1, plan : request.body.plan };
    resources.push(resource);
    response.send(resource);
  });

//Plan Change
app.put('/heroku/resources/:id', 
  express.bodyParser(), 
  passport.authenticate('basic', { session: false }), 
  function(request, response) {
    var resource =  get_resource(request.params.id);
    if(!resource){
      response.send("Not found", 404);
      return;
    }
    resource.plan = request.body.plan;
    response.send("ok");
  });

//Deprovision
app.delete('/heroku/resources/:id', 
  passport.authenticate('basic', { session: false }), 
  function(request, response) {
    console.log(request.params)
    if(!get_resource(request.params.id)){
      response.send("Not found", 404);
      return;
    }
    destroy_resource(request.params.id);
    response.send("ok");
  });

//GET SSO
app.get('/heroku/resources/:id', 
  function (req, res, next) {
    passport.authenticate('heroku-addon', function (err, user, fail) {
      if (!user && ~['Timestamp Expired', 'Token Mismatch'].indexOf(fail)) {
        return res.send(403, fail);
      }
      req.session.passport.user = user;
      next();
    })(req, res, next);
  }, 
  function(request, response) {
    response.redirect("/");
  });

//POST SSO
app.post('/sso/login', express.bodyParser(), 
  function (req, res, next) {
    passport.authenticate('heroku-addon', function (err, user, fail) {
      if (!user && ~['Timestamp Expired', 'Token Mismatch'].indexOf(fail)) {
        return res.send(403, fail.toString());
      }
      req.session.passport.user = user;
      next();
    })(req, res, next);
  }, function(request, response){
    response.redirect("/");
  });

//SSO LANDING PAGE
app.get('/', function(request, response) {
  console.log('user is ', request.user);
  if(request.user){
    console.log(resources);
    response.render('index.ejs', {
      layout: false, 
      resource: get_resource(parseInt(request.user.resource_id, 10)), 
      email: request.user.email 
    });
  }else{
    response.send("Not found", 404);
  }
});

var http = require('http');
var port = process.env.PORT || 4567;
http.createServer(app).listen(port, function() {
  console.log("Listening on " + port);
});
