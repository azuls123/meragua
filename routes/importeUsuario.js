'use strict'

var express = require('express');
var ImporteUsuarioController = require('../controllers/importeUsuario');
var api = express.Router();
var md_auth = require('../middleware/authenticate');
//=================Rutas //
//========Get //
api.get('/show', md_auth.ensureAuth, ImporteUsuarioController.show);
//========Put //
api.put('/update/:id', md_auth.ensureAuth, ImporteUsuarioController.update);
//========Delete //
api.delete('/delete/:id', md_auth.ensureAuth, ImporteUsuarioController.deletes);
//========Post //
api.post('/save',md_auth.ensureAuth, ImporteUsuarioController.save);

module.exports = api;