'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// libreria para la conexion y manipulacion de datos en nodejs //
var express = require('express');
// controlador que se usara en esta ruta //
var MeterController = require('../controllers/meter');
// declaracion del uso de rutas //
var api = express.Router();
// importacion ed middleware de autenticacion //
var md_auth = require('../middleware/authenticate');
// Variables de Subida de Archivos...
var multiparty = require('connect-multiparty');
var md_upload = multiparty({uploadDir: './uploads/meters'})
//=================Rutas //
//========Post //
api.post('/save', md_auth.ensureAuth, MeterController.save);
api.post('/image/:id', [md_auth.ensureAuth, md_upload], MeterController.UploadImage);
//========Get //
api.get('/show',md_auth.ensureAuth, MeterController.show);
api.get('/get-meter/:id', md_auth.ensureAuth, MeterController.getMeter);
api.get('/users-meters/:id',md_auth.ensureAuth, MeterController.showByUser);
api.get('/rate-meters/:rate?',md_auth.ensureAuth, MeterController.showByRate);
api.get('/get-image/:imageFile', MeterController.getImage);
api.get('/showbyclave/:clave?',md_auth.ensureAuth, MeterController.showByClave);
//========Put //
api.put('/update/:id',md_auth.ensureAuth, MeterController.update);
//========Delete //
api.delete('/delete/:id', md_auth.ensureAuth, MeterController.remove);

module.exports = api;