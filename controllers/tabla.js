'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// Variable del esquema del modelo //
var Tabla = require('../models/tabla');
var moment = require('moment');
//=================Declaracion de Funciones //
// Funcion de register de de datos //
function save(req, res) {
    // variable para la recoleccion de datos del formulario //
    var params = req.body;
    // variable para la definicion del objeto con respecto al modelo //
    var tabla = new Tabla;
    // Log de Comprobacion //
    console.log("Dentro de save");
    // comprobacion de los valores obligatorios enviados desde el formulario //
    if (params.nombre) {
        // Asignacion de los parametros al modelo del Controlador //
        tabla.nombre = params.nombre;
        // Logs de Comprobacion //
        console.log("Dentro del traspaso de Parametros");
        console.log(tabla);
        tabla.updated_at = moment().unix();
        tabla.edited_by = req.user.sub;
        tabla.activa = true;
        Tabla.find({ nombre: tabla.nombre }).exec((err, tablas) => {
            if (err) {
                return res.status(500).send({
                    Message: 'Error al Guardar'
                },
                    console.log(err))
            }
            if (tablas && tablas.length >= 1) {
                return res.status(500).send({ Message: 'duplicado' })
            } else {
                // Instruccion Save de Mongoose para Guardar los Parametros en MongoDB //
                // usando un callback para el 'Catcheo' de Errores //
                tabla.save((err, tablaStored) => {
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
                    if (tablaStored) {
                        // Se envian los datos del objeto mediante un send con el objeto mismo y un codigo 200 //
                        res.status(200).send({ tabla: tablaStored });
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
        })
    }
    // en caso de que los datos esten incompletos o dañados se envia un mensaje de error //
    else {
        res.status(200).send({
            Message: 'Datos faltantes o erroneos'
        })
    }
}

function show(req, res){
    Tabla.find().populate('edited_by').exec((err, resp)=>{
        if (err) return res.status(500).send({ Message: 'error al procesar la peticion' , Error: err});
        if (!resp) return res.status(404).send({ Message: 'no se pudo procesar la peticion, vacia' });
        return res.status(200).send({
            Tabla: resp
        })
    })
}

function update(req,res) {
    var id = req.params.id;
    var tablaUpdate = req.body;
    tablaUpdate.updated_at = moment().unix();
    tablaUpdate.edited_by = req.user.sub;
    Tabla.findByIdAndUpdate(id, tablaUpdate, {new : true}, (err, updated) => {
        if (err) return res.status(500).send({ Message: 'error al ejecutar la peticion... ', Error: err });
        if (!updated) return res.status(404).send({ Message: 'Error al editar, no se encontro la tabla' });
        return res.status(200).send({ Message: 'la tabla: ' + updated.nombre + ' ha sido editado', updated });
    })
}
function removeCompletly(req,res) {
    var id = req.params.id;
    Tabla.findByIdAndRemove(id, (err, deleted) => {
        if (err) return res.status(500).send({ Message: 'Error al ejecutar la peticion' });
        if (!deleted) return res.status(404).send({ Message: 'No se pudo borrar el perfil de Tabla' });
        return res.status(200).send({ Message: 'El perfil de tabla: ' + deleted.nombre + ', ha sido borrado con exito!.' });
    })
}
function remove(req, res) {
    var id = req.params.id;
    var activa = false;
    Tabla.findByIdAndUpdate(id, activa, (err, resp)=>{
        if (err) return res.status(500).send({Message: 'error al ejecutar la peticion. . . Error: ' + err});
        if (!resp) return res.status(404).send({Message: 'la peticion no ha devuelto ningun valor . . . '});
        return res.status(200).send({Message: 'La tabla se ha borrado correctamente . . . '});
    })
}
module.exports = {
    save,
    show,
    update,
    remove,
    removeCompletly
}