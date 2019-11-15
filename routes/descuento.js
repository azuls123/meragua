'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// libreria para la conexion y manipulacion de datos en nodejs //
var express = require('express');
// controlador que se usara en esta ruta //
var DescuentoController = require('../controllers/descuento');
// declaracion del uso de rutas //
var api = express.Router();
// importacion ed middleware de autenticacion //
var md_auth = require('../middleware/authenticate');

//=================Rutas //
//========Post //
api.post('/save', md_auth.ensureAuth, DescuentoController.save);
api.post('/savedescusu', md_auth.ensureAuth, DescuentoController.saveDescUsu);
//========Get //
api.get('/show/:page?',md_auth.ensureAuth, DescuentoController.show);
api.get('/showdescusu/:page?',md_auth.ensureAuth, DescuentoController.showDescUsu);
//========Put //
api.put('/update/:id',md_auth.ensureAuth, DescuentoController.update);
api.put('/updatedescusu/:id',md_auth.ensureAuth, DescuentoController.updateDescUsu);
//========Delete //
api.delete('/delete/:id', md_auth.ensureAuth, DescuentoController.remove);
api.delete('/deletedescusu/:id', md_auth.ensureAuth, DescuentoController.removeDescUsu);
module.exports = api;