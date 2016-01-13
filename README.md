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

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
