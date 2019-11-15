'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// libreria para la conexion y manipulacion de datos en nodejs //
var express = require('express');
// controlador que se usara en esta ruta //
var RateController = require('../controllers/rate');
// declaracion del uso de rutas //
var api = express.Router();
// controlador de autenticacion //
var md_auth = require('../middleware/authenticate');
//=================Rutas //
//========Gets //
api.get('/show', md_auth.ensureAuth, RateController.show);
api.get('/show-rate/:id', md_auth.ensureAuth, RateController.rateLimits);
api.get('/get-one/:id', md_auth.ensureAuth, RateController.findRate);
//========Post //
api.post('/save', md_auth.ensureAuth, RateController.save);
//========Put //
api.put('/update/:id', md_auth.ensureAuth, RateController.update);
//========Delete //
api.delete('/delete/:id',md_auth.ensureAuth, RateController.deleteRate);
module.exports = api;