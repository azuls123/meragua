'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// Variable del esquema del modelo //
var Publication = require('../models/publication');
// Variable para manejar rutas de ficheros //
var path = require('path');
// Variable para manejar archivos //
var fs = require('fs');
// Variable para manejar Momentos o tiempos //
var moment = require('moment');
// Variable para manejar paginaciones //
var moongosePagination = require('mongoose-pagination');
// Variable de Usuario //
var User = require('../models/user');
// Variable de Seguimiento //
var Follow = require('../models/follow');
//=================Declaracion de Funciones //
function prueba(req, res) {
    return res.status(200).send({
        Message: 'Todo correcto desde funcion prueba en publicacion'
    });
}
// funcion de guardar publicaciones
function savePublication(req, res) {
    // Recoleccion de parametros recibidos //
    var params = req.body;
    // Creacion del Objeto Publication //
    var publication = new Publication();

    // Comprobacion de parametrso obligatorios //
    if (!params.text) {
        return res.status(200).send({ Message: 'debes escribir un texto' });
    }

    // Asignacion de datos al objeto de publication //
    publication.title = params.title;
    publication.file = null;
    publication.type = params.type;
    publication.text = params.text;
    publication.created_at = moment().unix();
    publication.user = req.user.sub;

    // Consulta de guardado del objeto dentro de la base de datos //
    publication.save((err, publicationStored) => {
        if (err) return res.status(500).send({ Message: 'no se pudo guardar la publicacion... ', err });

        if (!publicationStored) return res.status(404).send({ Message: 'la publicacion esta vacia?' });

        return res.status(200).send({ Message: 'la publicacion ha sido guardada..', publication: publicationStored });
    });
}
// funcion de guardar Noticias
function saveNoticia(req, res) {
    // Recoleccion de parametros recibidos //
    var params = req.body;
    // Creacion del Objeto Publication //
    var publication = new Publication();

    // Comprobacion de parametrso obligatorios //
    if (!params.text) {
        return res.status(200).send({ Message: 'debes escribir un texto' });
    }

    // Asignacion de datos al objeto de publication //
    publication.title = params.title;
    publication.file = null;
    publication.type = params.type;
    publication.publico = params.publico;
    publication.place = params.place;
    publication.text = params.text;
    publication.created_at = moment().unix();
    publication.user = req.user.sub;

    // Consulta de guardado del objeto dentro de la base de datos //
    publication.save((err, publicationStored) => {
        if (err) return res.status(200).send({ Message: 'no se pudo guardar la publicacion... ', err });

        if (!publicationStored) return res.status(404).send({ Message: 'la publicacion esta vacia?' });

        return res.status(200).send({ Message: 'la publicacion ha sido guardada..', publication: publicationStored });
    });
}

function showRaw(req, res) {
    Follow.find((err, resp) => {
        if (err) return res.status(500).send({ Message: 'Error al ejecutar la peticion al servidor...', Error: err });
        if (!resp) return res.status(404).send({ Message: 'No existen publicaciones' });
        return res.status(200).send({ Publications: resp });
    });
}
// funcion para devolver el total de publicaciones //
function getPublications(req, res) {
    // variable de indice de pagina //
    var page = 1;
    // comprobacion de pagina enviada por request //
    if (req.params.page) page = req.params.page;
    // cantidad de publicaciones que se mostraran por pagina //
    var itemsPerpage = 4;
    // Buscar todas las publicaciones hechas por los usuarios seguidos //
    Follow.find({ user: req.user.sub }).populate('followed').exec((err, follows) => {
        if (err) return res.status(200).send({ Message: 'error al cargar los seguimientos (follows)... ', err });
        if (!follows) return res.status(404).send({ Message: 'no existen publicaciones...' });
        // definicion de array follows_clean //
        var follows_clean = [];
        // recorrido de seguidores //
        follows.forEach((follow) => {
            follows_clean.push(follow.followed);
        });
        follows_clean.push(req.user.sub);
        Publication.find({ user: { '$in': follows_clean } }).sort([['created_at', 'desc']]).populate('user').paginate(page, itemsPerpage, (err, publications, total) => {
            if (err) return res.status(200).send({ Message: 'error al devolver publicaciones... ', err });
            if (!publications) return res.status(494).send({ Message: 'no hay publicaciones' });
            return res.status(200).send({
                total_items: total,
                total_pages: Math.ceil(total / itemsPerpage),
                items_per_Page: itemsPerpage,
                page: page,
                publications
            })
        });
        // return res.status(200).send({Message: 'hasta aqui todo bien', follows_clean});
    });
}

// funcion para devolver el total de publicaciones //
function getPublicationsUser(req, res) {
    // variable de indice de pagina //
    var page = 1;
    // comprobacion de pagina enviada por request //
    if (req.params.page) page = req.params.page;
    // cantidad de publicaciones que se mostraran por pagina //
    var itemsPerpage = 4;
    var user = req.user.sub;
    if (req.params.id) {
        user = req.params.id;
    }
    // definicion de array follows_clean //
    //----------Sort tambien funciona de forma decendente con -created_at
    Publication.find({ user: user }).sort([['created_at', 'desc']]).populate('user').paginate(page, itemsPerpage, (err, publications, total) => {
        if (err) return res.status(200).send({ Message: 'error al devolver publicaciones... ', err });
        if (!publications) return res.status(494).send({ Message: 'no hay publicaciones' });
        return res.status(200).send({
            total_items: total,
            total_pages: Math.ceil(total / itemsPerpage),
            items_per_Page: itemsPerpage,
            page: page,
            publications
        })
    });
}
// eliminar una publicacion //
function deletePublications(req, res) {
    var publicationId = req.params.id;
    if (!req.params.id) return res.status(404).send({ Message: 'No se ingreso ninguna publicacion para borrar' });

    // Remove de publicaciones del usuario logueado
    Publication.findOneAndDelete({ 'user': req.user.sub, '_id': publicationId }, (err, publicationRemoved) => {
        console.log('usuario: ' + req.user.sub + '. publicacion: ' + publicationId);

        if (err) return res.status(200).send({ Message: 'error al borrar la publicacion' });
        if (!publicationRemoved) return res.status(404).send({ Message: 'no se pudo borrar la publicacion' });
        console.log('Conteo: '+publicationRemoved);

        if (publicationRemoved.text) {
            return res.status(200).send({ Message: 'se ha borrado la publicacion', id: req.params.id, publicationRemoved });
        } else if( !publicationRemoved ) {
            return res.status(500).send({ Message: 'no tienes permiso para borrar esta publicacion' })
        }
    })

    // Admin Remove, borrar cualquier publicacion
    // Publication.findByIdAndRemove(publicationId, (err, publicationRemoved) =>{
    //     if (err) return res.status(200).send({Message: 'error al borrar la publicacion'});
    //     if (!publicationRemoved) return res.status(404).send({Message: 'no se pudo borrar la publicacion'});
    //     return res.status(200).send({Message: 'se ha borrado la publicacion', id: req.params.id});
    // });
}
// subir imagen de publicacion //
function UploadImage(req, res) {
    var publicationId = req.params.id;
    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];
        if (req.files.document) {
            var document_path = req.files.document;
            var document_split = document_path.split('\\');
            var document_name = document_split[2];
            var doc_ext_split = document_name.split('\.');
            var document_ext = doc_ext_split.split[1];
        }
        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
            // actualizar documento de la publicacion
            var message_file;
            var message_document;
            var message;
            Publication.findByIdAndUpdate(publicationId, { image: file_name }, { new: true }, (err, Updated) => {
                message = message_file + message_document;
                if (err)
                    if (!Updated) res.status(500).send({ Message: 'No se actualizo la imagen de publicacion' });
                return res.status(200).send({ Publicacion: Updated });
            });
        } else {
            return removeFilesOfUpload(res, file_path, 'Ups!, no se ha podido subir el archivo. Extension no valida.');
        }
    } else {
        return res.status(404).send({ Message: 'No se encuentra una imagen' });
    }

}
// quitar la imagen subida
function removeFilesOfUpload(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        console.log(err);
        return res.status(200).send({ message });
    });

}
// Obtener la imagen subida
function getImageFile(req, res) {
    var image_File = req.params.image;
    var path_file = './uploads/publications/' + image_File;

    fs.exists(path_file, (exist) => {
        if (exist) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({ Message: 'Ups, no encontramos la imagen dentro del servidor' });
        };
    });
}
module.exports = {
    prueba,
    savePublication,
    getPublications,
    deletePublications,
    UploadImage,
    removeFilesOfUpload,
    getImageFile,
    showRaw,
    getPublicationsUser,
    saveNoticia
}