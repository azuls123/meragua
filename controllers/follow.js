'use strict'

//var path = require('path');
//var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');

function prueba(req,res){
    res.status(200).send({Message: 'Dentro del Controllador de Follows'});
}
function saveFollow(req,res){
    var params = req.body;

    var follow = new Follow();

    follow.user = req.user.sub;
    follow.followed = params.followed;
    follow.save((err, followStored) => {
        if (err) return res.status(500).send({Message: 'error al guardar el seguimiento'});
        if (!followStored) return res.status(404).send({Message:'No se guardo el seguimiento'});
        return res.status(200).send({follow: followStored});
    })
}
function deleteFollow(req, res) {
    var userId = req.user.sub;
    var followId = req.params.id;
    Follow.find({'user': userId, 'followed': followId}).remove(err => {
        console.log('user:' + userId + '. id seguimiento:' + followId, );
        if (err) return res.status(500).send({Message: 'error al dejar de seguir'});
        return res.status(200).send({Message: 'se ha eliminado el follow'});
    })
}
function getFollowingUsers(req, res) {
    var userId = req.user.sub;
    var page = 1;
    if (req.params.page){
        page = req.params.page;
        // console.log('asignacion de pagina: ' + req.params.page);
    }
    if (req.params.id) {
        userId = req.params.id;
    }
    var itemsPerPage = 4;
    Follow.find({user: userId}).populate('followed user').paginate(page, itemsPerPage, (err, follows, total) => {
        if (err) return res.status(500).send({Message: 'error al mostrar los follows'+err});
        if (!follows) return  res.status(404).send({Message: 'no se esta siguiendo a ningun usuario'});
        if (follows) {
            followUsersIds(req.user.sub).then((value) => {
                return res.status(200).send({
                    total: total,
                    pages: Math.ceil(total/itemsPerPage),
                    following: value.following,
                    followed: value.followed,
                    follows: follows
                });
            })
        };
    })
}
function getFollowedUsers(req, res) {
    var userId = req.user.sub;
    var page = 1;

    if (req.params.page){
        page = req.params.page;
        // console.log('asignacion de pagina: ' + req.params.page);
    }
    if (req.params.id) {
        userId = req.params.id;
    }
    var itemsPerPage = 4;
    Follow.find({followed: userId}).populate('user followed').paginate(page, itemsPerPage, (err, follows, total) => {
        if (err) return res.status(500).send({Message: 'error al mostrar los follows... '+ err});
        if (!follows) return  res.status(404).send({Message: 'no te sigue ningun usuario'});
        if (follows) {
            followUsersIds(req.user.sub).then((value) => {
            return res.status(200).send({
                total: total,
                pages: Math.ceil(total/itemsPerPage),
                following: value.following,
                followed: value.followed,
                follows: follows
            });
        })
       };
    })
}
// devolver usuarios que sigo (logeado)
// si ingresa el parametro followed devuelve los usuarios que siguen al usuario ingresado(params followed)
function getMyFollows(req,res){
    var userId = req.user.sub;

    var find = Follow.find({user: userId});

    if (req.params.followed) {
        find = Follow.find({followed: userId});
    }
    // return res.status(200).send({Message: 'getmyfollows listo'});
    find.populate('user followed').exec((err, follows) => {
        if (err) return res.status(500).send({Message: 'error al mostrar los follows'+err});
        if (!follows) return res.status(404).send({Message: 'no sigues a ningun usuario'});
        if (follows) {
            return res.status(200).send({follows: follows});
       };
    })
}

// funcion complementaria asincrona para devolver los datos de usuarios siguiendo
async function followUsersIds(userId) {
    var following = await Follow.find({ "user": userId }).select({ '_id': 0, '__v': 0, 'user': 0 }).populate('followed').exec().then((follows) => {
        var follows_clean = [];
        follows.forEach((follow) => {
            follows_clean.push({user: follow.followed});
        });
        return follows_clean;
    });
    var followed = await Follow.find({ "followed": userId }).select({ '_id': 0, '__v': 0, 'followed': 0 }).populate('user').exec().then((follows) => {
        var follows_clean = [];
        follows.forEach((follow) => {
            follows_clean.push({user: follow.user});
        });
        return follows_clean;
    });
    return { following, followed };
}
module.exports = {
    prueba,
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getFollowedUsers,
    getMyFollows
}