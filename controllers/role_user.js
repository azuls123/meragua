'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// Variable del esquema del modelo //
var Role_User = require('../models/role_user');
// Variable de Paginacion //
var moment = require('moment');
var moongosePagination = require('mongoose-pagination');
//=================Declaracion de Funciones //
// Funcion de register de datos //
function save(req, res) {
    // variable para la recoleccion de datos del formulario //
    var params = req.body;
    // variable para la definicion del objeto con respecto al modelo //
    var role_user = new Role_User;
    // variable de fecha //
    var today = new Date();
    var currDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    // Log de Comprobacion //
    console.log("Dentro de save");
    // comprobacion de los valores obligatorios enviados desde el formulario //
    if (params.perfil) {
        // Asignacion de los parametros al modelo del Controlador //
        role_user.perfil = params.perfil;
        // Logs de Comprobacion //
        console.log("Dentro del traspaso de Parametros");
        console.log(role_user);
        role_user.tabla = params.tabla;
        role_user.updated_at = moment().unix();
        role_user.edited_by = req.user.sub;
        // Instruccion Save de Mongoose para Guardar los Parametros en MongoDB //
        // usando un callback para el 'Catcheo' de Errores //
        role_user.save((err, role_userStored) => {
            // Sentencia 'Si' para comprobar la existencia de errores //
            if (err) {
                // Log de Error mostrado en la Consola //
                console.log(err);
                // Retorno de un error 500: no se pudo realizar la accion //
                return res.status(500).send({
                    Message: 'Error al Guardar',
                    message2: err
                });
            }
            // Sentencia 'Si' para comprobar la existencia de valores dentro del Objeto //
            if (role_userStored) {
                // Se envian los datos del objeto mediante un send con el objeto mismo y un codigo 200 //
                res.status(200).send({ role_user: role_userStored });
            }
            // Sentencia 'Entonces' complementaria al 'Si' para identificar un objeto vacio //
            else {
                // Se devuelve un error 404 al cliente indicando que el objeto se encuentra vacio //
                res.status(404).send({
                    Message: 'Objeto Vacio o Incompleto'
                })
            }
        })
    }
    // en caso de que los datos esten incompletos o dañados se envia un mensaje de error //
    else {
        res.status(200).send({
            Message: 'Datos faltantes o erroneos'
        })
    }
}

function show(req, res) {
    Role_User.find().populate('tabla edited_by').exec((err, resp) => {
        if (err) return res.status(500).send({Message: 'Error al ejectuar la peticion al servidor', Error: err});
        if (!resp) return res.status(404).send({Message: 'Al parecer no hay roles de usuarios'});
        return res.status(200).send({Message: 'Roles listos!', Role_Users: resp});
    })

}

function update(req, res) {
    var id = req.params.id;
    var updatePefil = req.body;

    updatePefil.updated_at = moment().unix();
    updatePefil.edited_by = req.user.sub;
    Role_User.findByIdAndUpdate(id, updatePefil, { new: true }, (err, resp) => {
        if (err) return res.status(500).send({Message: 'Error al ejecutar la peticion... Error: ' + err});
        if (!resp) return res.status(404).send({Message: 'La peticion no ha devuelto ningun valor...'});
        return res.status(200).send({Message: 'El role_user de la Tabla: ' + resp.tabla + ', ha sido editado'});
    })
}

function remove (req, res) {
    var id = req.params.id;
    Role_User.findByIdAndRemove(id, (err, resp) => {
        if (err) return res.status(500).send({Message: 'Error al ejecutar la peticion... Error: ' + err});
        if (!resp) return res.status(404).send({Message: 'La peticion no ha devuelto ningun valor...'});
        return res.status(200).send({Message: 'El role_user de la Tabla: ' + resp.tabla + ', ha sido eliminado'});
    } )
}
module.exports = {
    save,
    show,
    update,
    remove
}