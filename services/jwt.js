'use strict'

// libreria de jwt //
var jwt = require('jwt-simple');
// obtencion de fechas //
var moment = require('moment');
// clave de reconocimiento interna //
var secret = 'clave_token_agua_potable';
exports.createToken = function(user) {
    var payload = {
        sub:        user._id,
        cuenta:     user.cuenta,
        contrase:   user.contrase,
        correo:     user.correo,
        activa:     user.activa,
        role_user:  user.role_user,
        iat:        moment().unix(),
        exp:        moment().add(30,'days').unix()
    };
    return jwt.encode(payload, secret)
};
