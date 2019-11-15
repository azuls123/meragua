'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// libreria para la conexion y manipulacion de datos en nodejs //
var express = require('express');
// controlador que se usara en esta ruta //
var PublicationController = require('../controllers/publication');
// declaracion del uso de rutas //
var api = express.Router();
// importacion ed middleware de autenticacion //
var md_auth = require('../middleware/authenticate');
// modulo de multipart //
var multipart = require('connect-multiparty');
// direccion de archivos guardados //
var md_upload = multipart({uploadDir : './uploads/publications'});
//=================Rutas //
//========Gets //
api.get('/prueba', md_auth.ensureAuth, PublicationController.prueba);
api.get('/paginate/:page?', md_auth.ensureAuth, PublicationController.getPublications);
api.get('/get-image/:image', PublicationController.getImageFile);
api.get('/show-raw', PublicationController.showRaw);
api.get('/show/:id/:page?', md_auth.ensureAuth, PublicationController.getPublicationsUser);
//========Post //
api.post('/save', md_auth.ensureAuth, PublicationController.savePublication);
api.post('/save-noticia', md_auth.ensureAuth, PublicationController.saveNoticia);
api.post('/upload-image/:id', [md_auth.ensureAuth, md_upload], PublicationController.UploadImage);
//========Delete //
api.delete('/delete/:id?', md_auth.ensureAuth, PublicationController.deletePublications);
module.exports = api;