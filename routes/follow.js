'use strict'

var express = require('express');
var FollowController = require('../controllers/follow');
var api = express.Router();
var md_auth =  require('../middleware/authenticate');
//=================Rutas //
//========Gets //
api.get('/pruebas', md_auth.ensureAuth, FollowController.prueba);
api.get('/following/:id/:page?', md_auth.ensureAuth, FollowController.getFollowingUsers);
api.get('/followed/:id/:page?', md_auth.ensureAuth, FollowController.getFollowedUsers);
api.get('/follows/:followed?', md_auth.ensureAuth, FollowController.getMyFollows);
//========Post //
api.post('/savefollow', md_auth.ensureAuth, FollowController.saveFollow);
//========Delete //
api.delete('/deletefollow/:id', md_auth.ensureAuth, FollowController.deleteFollow);
module.exports = api;