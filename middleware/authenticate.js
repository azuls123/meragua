'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_token_agua_potable';

exports.ensureAuth = function(req, res, next){
    if (!req.headers.authorization) {
        console.log("La Peticion Analizada no presenta la Cabecera Correspondiente...");
        return res.status(403).send({
            Message: 'Peticion sin Cabecera de Autenticacion'
        })
    }
    var token = req.headers.authorization.replace(/['"]+/g, '');
    try {
        var payload = jwt.decode(token, secret);
        if (payload.exp <= moment().unix()){
            console.log("Expiracion: " + payload.exp);
            return res.status(401).send({
                Message: 'Token Expirado'
            })
        }
    } catch (error) {
        console.log("Token Fatal Error!..... " + error);
        return res.status(404).send({
            Message: 'Ups!, Algo salio Mal! :c, Token Invalido'
        })
    }
    console.log('auth log \n'+payload.sub+'\nauth log end');
    req.user = payload;
    next();
}