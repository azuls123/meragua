'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// libreria para la conexion y manipulacion de datos en nodejs //
var express = require('express');
// controlador que se usara en esta ruta //
var BillController = require('../controllers/bill');
// declaracion del uso de rutas //
var api = express.Router();
// Variable de Autenticacion //
var md_auth = require('../middleware/authenticate');

//=================Rutas //
//========Post //
api.post('/save', md_auth.ensureAuth, BillController.save);
//========Put //
api.put('/pay/:id', md_auth.ensureAuth, BillController.pagoFactura);
//========Get //
api.get('/get-all', md_auth.ensureAuth, BillController.show);
api.get('/get-conteo', md_auth.ensureAuth, BillController.getConteo);
api.get('/show/:id', md_auth.ensureAuth, BillController.getFactura)

module.exports = api;