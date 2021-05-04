/**
 * Module dependencies.
 */
var Strategy = require('passport-strategy');
var crypto   = require('crypto');
var util     = require('util');

/**
 * `HerokuAddonStrategy` constructor.
 *
 * The Heroku Addon authentication strategy authenticates requests based on
 * request id and timestamp parameters.
 *
 * Applications must supply a `sso_salt` secret to validate requests.
 *
 * Examples:
 *
 *     passport.use(new HerokuAddonStrategy({
 *       sso_salt: 'secret'
 *     }));
 *
 * @param {Object} options
 * @api public
 */
function HerokuAddonStrategy(options) {

  if (!options || !options.sso_salt) throw new Error('Passport Heroku Addon strategy requires a sso_salt');

  Strategy.call(this);
  this.name = 'heroku-addon';
  this._sso_salt = options.sso_salt;
  this._passReqToCallback = options.passReqToCallback;
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(HerokuAddonStrategy, Strategy);

/**
 * Authenticate request based on id and timestamp params.
 *
 * @param {Object} req
 * @api protected
 */
HerokuAddonStrategy.prototype.authenticate = function(req) {
  var id = req.body.id;
  var pre_token = id + ':' + this._sso_salt + ':' + req.body.timestamp;

  var shasum = crypto.createHash('sha1');
  shasum.update(pre_token);
  var token = shasum.digest('hex');

  if( req.body.token !== token){
    this.fail('Token Mismatch');
    return;
  }

  var time = (new Date().getTime() / 1000) - (2 * 60);
  if( parseInt(req.body.timestamp, 10) < time ){
    this.fail('Timestamp Expired');
    return;
  }

  this.success({
    email:       req.body.email,
    resource_id: id
  });
};

/**
 * Expose `HerokuAddonStrategy`.
 */
module.exports = HerokuAddonStrategy;
