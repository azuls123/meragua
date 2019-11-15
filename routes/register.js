'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// libreria para la conexion y manipulacion de datos en nodejs //
var express = require('express');
// controlador que se usara en esta ruta //
var RegisterController = require('../controllers/register');
// declaracion del uso de rutas //
var api = express.Router();
// importacion ed middleware de autenticacion //
var md_auth = require('../middleware/authenticate');

//=================Rutas //
//========Post //
api.post('/save', md_auth.ensureAuth, RegisterController.save);
//========Get //
api.get('/show/:id',md_auth.ensureAuth, RegisterController.show);
api.get('/get-one/:id',md_auth.ensureAuth, RegisterController.getOne);
api.get('/show-all',md_auth.ensureAuth, RegisterController.showAll);
api.get('/showbymonth/:mes?',md_auth.ensureAuth, RegisterController.showByMonth);
api.get('/showbymeter/:meter?',md_auth.ensureAuth, RegisterController.showByMeter);
//========Put //
api.put('/update/:id',md_auth.ensureAuth, RegisterController.update);
//========Delete //
api.delete('/delete/:id', md_auth.ensureAuth, RegisterController.remove);
module.exports = api;