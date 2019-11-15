'use strict'

var express = require('express');
var ErasedDataController=require('../controllers/erasedData');
var api = express.Router();
var md_auth = require('../middleware/authenticate');

//=================Rutas //
//========Post //
api.post('/save', md_auth.ensureAuth, ErasedDataController.save);
//========Get //
api.get('/show', md_auth.ensureAuth, ErasedDataController.get);
module.exports = api;