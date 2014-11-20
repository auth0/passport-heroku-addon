Passport Heroku Addon strategy for SSO with heroku addons.

This is not Heroku OAuth.

## Installation

	npm install passport-heroku-addon

## Usage

~~~javascript
var passport = require('passport');
var PassportHerokuAddon = require('passport-heroku-addon');


passport.use(new PassportHerokuAddon({
  sso_salt: process.env.SSO_SALT
}));

app.get('/heroku/resources/:id', 
  passport.authenticate('heroku-addon'),
  function(request, response) {
    response.redirect("/");
  });
~~~


## License

MIT 2013-2014 Auth0 Inc
