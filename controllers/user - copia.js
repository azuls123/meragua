'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// Variable para encriptar la contraseña //
var bcrypt = require('bcrypt-nodejs');
// Variable del esquema del modelo user //
var User = require('../models/user');
// Variable del esquema del modelo follow //
var Follow = require('../models/follow');
// Variable de las publicaciones //
var Publications = require('../models/publication');
// Variable token //
var jwt = require('../services/jwt');
// Variable de Paginacion de Datos
var mongoosePaginate = require('mongoose-pagination');
// Variable para el sistema de archivos
var fs = require('fs');
// variable para rutas del sistema de archivos
var moment = require('moment');
var path = require('path');

var morgan = require('morgan');
//=================Declaracion de Funciones //

function addAdmin(req, res) {
    var params = req.body;
    var user = new User;

    
}

// >> Ingresar Usuario-Simple
function saveUser(req, res) {
    // recolectar los parametros enviados
    var params = req.body;
    // iniciar una nueva variable con el modelo User
    var user = new User;
    // comprobar si hay un logeo previo
    if (!req.user.sub) {
        // enviar error Forbiden [prohibido] en caso de que se intente ingresar un usuario sin antes haber iniciado sesion en el sistema
        return res.status(403).send({
            Message: 'Solo los Empleados pueden ingresar usuarios '
        });
        // comprobar que el usuario que inicio sesion no se aun usuario normal [ propietario de medidor ]
    } else if (req.user.sub && req.user.role_user.toLowerCase() != 'Common') {
        // comprobar que existen los datos minimos para un usuario simple [ nombre, apellido, cedula {direccion opcional} ]
        if (params.nombre && params.cedula && params.apellido) {
            // >> aqui se rellenan las variables que por defecto se quedaran vacias pero se asigna null para evitar fallos en el sistema
            user.cuenta = null;
            user.contrase = null;
            user.correo = null;
            // << fin del relleno

            // >> se ingresan o dan valor a los campos del modelo de usuario [User]
            user.nombre = params.nombre;
            user.apellido = params.apellido;
            user.cedula = params.cedula;
            // >>> Comprobacion si existe direccion ingresada
            if (params.direccion) {
                // >>>> Si se ingreso direccion se la asigna al modelo del usuario a ingresar
                user.direccion = params.direccion;
            } else {
                // >>>> En caso de que no haya ingresado una direccion se le asigna por defecto como [Sin Direccion]
                user.direccion = 'Sin Dirección';
            }
            user.sexo = params.sexo;
            if (user.sexo.toLowerCase() == 'femenino' || user.sexo.toLowerCase() == 'f') {
                user.image = 'avatarF.png';
            } else if (user.sexo.toLowerCase() == 'masculino' || user.sexo.toLowerCase() == 'm') {
                user.image = 'avatarM.png';
            } else {
                user.image = 'avatarI.png';
            }
            user.activa = true;
            user.updated_at = moment().unix();
            // >>> Se asigna el rol de usuario de forma automatica en Usuario //
            user.role_user = 'Common';
            // >>> Asignacion del usuario que inicio sesion en el campo que registra quien creo al usuario a ingresar
            user.edited_by = req.user.sub;
            console.log('dentro de save user');

            console.log(user);
            // >>> revision en el sistema si la cedula ingresada en el sistema no es repetida
            User.find({
                "cedula": params.cedula
            }, (err, resp) => {
                // >>>> revision de errores en la peticion a la base de datos
                if (err) return res.status(500).send({
                    Message: 'Error... No se ha podido realizar la peticion',
                    Error: err
                });
                // >>>> comprobacion si existe o no la cedula, en caso de que exista se envia un estado 401 [sin autorizacion] y un mensaje de duplicado
                if (resp.length >= 1) return res.status(401).send({
                    Message: 'Usuario Duplicado, revise la cedula'
                });
                else {
                    // >>> en caso de que la cedula ingresada se a unica se envia el usuario a la base de datos
                    user.save((err, userStored) => {
                        // >>>> Retorno de un error 500: no se pudo realizar la accion
                        if (err) return res.status(500).send({
                            Message: 'Error al ejectuar la peticion',
                            Error: err
                        });
                        // >>>> en caso de que el SGBD responda con el valor [usuarioStored] se envia un mensaje 201 de confirmacion de ingreso en la base de datos
                        if (userStored) {
                            res.status(200).send({
                                Message: 'Usuario guardado Exitosamente!!',
                                user: userStored
                            });
                        }
                        // >>>> si el SGBD no responde o responde algun valor diferente se estima que no se pudo ingresar el usuario
                        else {
                            // Se devuelve un error 404 al servidor para advertir que no se pudo registrar el usuario
                            res.status(404).send({
                                Message: 'No se pudo Registrar el usuario'
                            })
                        }
                    });
                };

            })
        }
        // >> Comprobacion en caso de que no llegasen los campos requeridos
    } else {
        // >>> se devuelve un error con estado 500 indicando que hay un error en la peticion
        return res.status(500).send({
            Message: 'error, debe llenar todos los campos..',
            usuario: params
        });
    }
}
// << Ingresar Usuario-Simple


// >> Ingresar Usuario-Usuario //
function save(req, res) {
    // variable para la recoleccion de datos del formulario //
    var params = req.body;
    // variable para la definicion del objeto con respecto al modelo //
    var user = new User;
    // >>> comprobacion de los valores obligatorios enviados desde el formulario  //
    if (params.cuenta && params.contrase && params.correo && params.cedula) {
        // Asignacion de los parametros al modelo del Controlador //
        user.cuenta = params.cuenta;
        user.contrase = params.contrase;
        user.correo = params.correo;
        user.nombre = params.nombre;
        user.apellido = params.apellido;
        user.cedula = params.cedula;
        user.telefono = params.telefono;
        user.direccion = params.direccion;
        user.fecha_nacimiento = params.fecha_nacimiento;
        user.sexo = params.sexo;
        if (user.sexo.toLowerCase() == 'femenino' || user.sexo.toLowerCase() == 'f') {
            user.image = 'avatarF.png';
        } else if (user.sexo.toLowerCase() == 'masculino' || user.sexo.toLowerCase() == 'm') {
            user.image = 'avatarM.png';
        } else {
            user.image = 'avatarI.png';
        }
        user.activa = true;
        user.role_user = params.role_user;
        user.edited_by = null;
        // Comprobacion de datos Unicos //
        User.find({
            $or: [{
                    "correo": user.correo
                },
                {
                    "cuenta": user.cuenta
                },
                {
                    "cedula": user.cedula
                }
            ]
        }).exec((err, users) => {
            if (err) return res.status(500).send({
                Message: 'Error al ejecutar la peticion'
            })

            if (users && users.length >= 1) return res.status(500).send({
                Message: 'Duplicado',
                contenido: users,
                cantidad: users.length,
                usuario: user
            });
            else {
                console.log(users);
                // Logs de Comprobacion //
                console.log("Dentro del traspaso de Parametros");
                console.log(user);
                // Uso de la libreria bcrypt para encriptar la contraseña //
                bcrypt.hash(params.contrase, null, null, (error, hash) => {
                    user.contrase = hash;
                    // Instruccion Save de Mongoose para Guardar los Parametros en MongoDB //
                    // usando un callback para el 'Catcheo' de Errores //
                    user.save((err, userStored) => {
                        // Log de Error mostrado en la Consola //
                        console.log(err);
                        // Retorno de un error 500: no se pudo realizar la accion //
                        if (err) return res.status(500).send({
                            Message: 'Error al guardar el User'
                        });
                        // Sentencia 'Si' para comprobar la existencia de valores dentro del Objeto //
                        if (userStored) {
                            // Se envian los datos del objeto mediante un send con el objeto mismo y un codigo 200 //
                            res.status(200).send({
                                User: userStored,
                                Message: 'Fin del Save'
                            });
                        }
                        // Sentencia 'Entonces' complementaria al 'Si' para identificar un objeto vacio //
                        else {
                            // Se devuelve un error 404 al cliente indicando que el objeto se encuentra vacio //
                            res.status(404).send({
                                Message: 'No se pudo Registrar el usuario'
                            })
                        }
                    });
                })
            }
        });
    }
    // en caso de que los datos esten incompletos o dañados se envia un mensaje de error //
    else {
        res.status(500).send({
            Message: 'Datos faltantes o erroneos'
        })
    }
}
// << Ingreso Usuario-Usuario

// >> Funcion para ingreso al sistema mediante un login //
function login(req, res) {
    // >>> se reciben los datos [parametros] enviados en la peticion
    var params = req.body;
    // >>> se hace una busqueda en la base de datos con el nombre de la cuenta
    User.findOne({
        $and: [{
            cuenta: params.cuenta
        }]
    }, (err, user) => {
        // >>>> en caso de que la peticion al servidor falle se envia un estado 500 y el error
        if (err) return res.status(500).send({
            Message: 'error en la peticion... Error: ' + err
        });
        // >>>> si no se produce ningun fallo y tampoco devuelve respuesta quiere decir que no hay un usuario con esa cuenta
        if (!user) return res.status(404).send({
            Message: 'el usuario no existe . . . '
        });
        // >>>> si encuentra una cuent, pero esta no tiene el campo de activa o lo tiene desactivado se envia el mensaje de cuenta desactivada
        if (user.activa = false || !user.activa) return res.status(401).send({
            Message: 'la cuenta ha sido desactivada . . . '
        });
        // >>>> en caso de que tenga el campo activa en verdadero [true] se procede a comparar la contraseña
        if (user) {
            // >>>>> debido a que se utiliza una encriptacion en las contraseñas se encripta la contraseña ingresada y se compara con la almacenada
            bcrypt.compare(params.contrase, user.contrase, (err, check) => {
                // >>>>>> en caso de que se de un error en la peticion se envia un estado 500 y el mensaje de error
                if (err) return res.status(500).send({
                    Message: 'error al ejecutar la peticion...',
                    Error: err
                });
                // >>>>>> en caso de que la comparacion de falsa o no de resultado se estima que la comparacion dio falso y se envia el mensaje de contraseña incorrecta
                if (!check) return res.status(403).send({
                    Message: 'Contraseña incorrecta!...'
                });
                if (check) {
                    // >>>>>> en caso de que devuelva la comparacion en positivo se revisa si dentro de los parametros existe el campo GetToken para generar el token correspondiente
                    if (params.gettoken) {
                        // >>>>>>> se eliminan los valores del objeto usuario para evitar que si se llegase a robar el token no puedan obtener la contraseña, el estado deactiva y __v
                        user.contrase = undefined;
                        user.activa = undefined;
                        user.__v = undefined;
                        // >>>>>>> despues de borrar los campos se devuelve un estado 200
                        return res.status(200).send({
                            // >>>>>>>> se envia el objeto usuario
                            user: user,
                            // >>>>>>>> se envia el token despues de generar el token
                            token: jwt.createToken(user),
                            // >>>>>>>> se envia un mensaje de confirmacion
                            Message: 'Fin del Login con token'
                        })
                        // >>>>>>> en caso de que no llegase el campo GetToken
                    } else {
                        // >>>>>>> se eliminan los valores del objeto usuario para evitar que si se llegase a robar el token no puedan obtener la contraseña, el estado deactiva y __v
                        user.contrase = undefined;
                        user.activa = undefined;
                        user.__v = undefined;
                        // >>>>>>> se devuelve un estado 200 con el mensaje de confirmacion y el objeto usuario
                        return res.status(200).send({
                            Message: 'Login Realizado',
                            user: user
                        })
                    }
                    // >>>>>> en caso de que se produzca un error se envia el error y un mensaje
                } else if (err) {
                    return res.status(500).send({
                        Message: 'Nombre de Cuenta o Contraseña incorrecta!',
                        Error: err
                    })
                }
            })
            // >>>> en caso de que no haya respuesta se asume que el usuario no existe y se envia el estado 404 y un mensaje
        } else {
            return res.status(404).send({
                Message: 'No se Encuentra al user'
            })
        }
    })
}
// << Funcion para ingreso al sistema mediante un login

// >> Devolver Usuario [logeado o buscado]
function show(req, res) {
    // >>> se establece la variable userId como el usuario logeado
    var userId = req.user.sub;
    // >>> en caso de que dentro de la URL llegue un id de usuario se substituye userId con el id enviado
    if (req.params.id) {
        userId = req.params.id;
    }

    // >>> se hace una busqueda de usuarios con el usuario enviado y que tenga el campo activa en verdadero [true]
    User.findOne({
        $and: [{
            "activa": true
        }, {
            "_id": userId
        }]
    }, (err, user) => {
        // >>>> en caso de error se envia un estado 500 y el mensaje de error
        if (err) return res.status(500).send({
            Message: 'Error en la peticion. ',
            err
        });
        // >>>> si no hay respuesta se envia un estado 404 y el mensaje de que no existe el usuario
        if (!user) return res.status(404).send({
            Message: 'El usuario no existe'
        });
        // >>>> se hace un llamado a la funcion followThisUser [siguiendo a este usuario] para saber si el usuario logeado esta siguiendo al usuario buscado
        followThisUser(req.user.sub, userId).then((value) => {
            // >>>>> se devuelve un estado 200, el usuario buscado y los resultados de la funcion followThisUser
            return res.status(200).send({
                user,
                value
            });
        });
    });
}
// << Devolver Usuario [logeado o buscado]

// >> funcion asíncrona para comprobar los seguimientos
async function followThisUser(identity_user_id, user_id) {
    // >>> busqueda de siguiendo entre el usuario logeado [user] y buscado [followed], luego se devuelve el resultado
    var following = await Follow.findOne({
        "user": identity_user_id,
        "followed": user_id
    }).exec().then((follow) => {
        return follow
    });
    // >>> busqueda de seguidor entre el usuario logeado [followed] y buscado [user], luego se devuelve el resultado
    var followed = await Follow.findOne({
        "user": user_id,
        "followed": identity_user_id
    }).exec().then((follow) => {
        return follow
    });
    // >>> se devuelven los valores following y followed
    return await {
        following,
        followed
    };
}
// << funcion asíncrona para comprobar los seguimientos

// >> Mostrar usuarios(paginado)
function showUsers(req, res) {
    var userId = req.user.sub;
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    var itemsPerPage = 5;
    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
        if (err) return res.status(500).send({
            Message: 'Error en la peticion'
        });
        if (!users) return res.status(404).send({
            Message: 'No Hay Users'
        });
        followUsersIds(userId).then((value) => {
            return res.status(200).send({
                users,
                following: value.following,
                followed: value.followed,
                total,
                pages: Math.ceil(total / itemsPerPage)
            });
        });
    })
}
// << Mostrar usuarios (paginado)

// >> Mostrar Usuarios [crudo]
function showRaw(req, res) {
    // >>> Asignacion de variables
    var userId = req.user.sub;
    // >>> comprobacion de usuario logeado
    if (!req.user.sub) {
        // >>>> en caso de que no haya un usuario logeado se devuelve un error 401 y un mensaje
        return res.status(401).send({
            Message: 'No se puede Obtener Acceso a Los Registros Sin antes Ingresar al Sistema...'
        })
    } else {
        /// >>>> en caso de que exista un usuario logeado se hace una peticion de la lista de usuarios logueados
        User.find().sort([
            ['apellido', 'asc']
        ]).select({
            'contrase': 0
        }).exec((err, resp) => {
            // >>>>> en caso de que se produzca un error se envia un estado 500 y un mensaje
            if (err) return res.status(500).send({
                Message: 'no se pudo obtener la lista de usuarios...',
                Error: err
            });
            // >>>>> en caso de que no se devuelva ningun conjunto de objetos se devuelve un estado 404 y un mensaje
            if (!resp) return res.status(404).send({
                Message: 'no se obtuvo ningun usuario'
            });
            // >>>>> en caso de que exista un conjunto de objetos se hace una bisuqeda del usuario en el registro de seguidores
            followUsersIds(userId).then((value) => {
                // >>>>>> se devuelve un estado 200 y se envia el cojunto de usuarios y el conjunto de seguidores
                return res.status(200).send({
                    Usuarios: resp,
                    following: value.following,
                    followed: value.followed
                });
            });
        })
    }
}
// << Mostrar Usuarios [crudo]
// >> listado de follows
async function followUsersIds(userId) {
    // >>> se realiza una busqueda del usuario igual a [user] en el registro de seguidores
    var following = await Follow.find({
        "user": userId
    }).select({
        '_id': 0,
        '__v': 0,
        'user': 0
    }).exec().then((follows) => {
        var follows_clean = [];
        follows.forEach((follow) => {
            follows_clean.push(follow.followed);
        });
        // >>>> se devuelve un conjunto de objetos con los usuarios seguidos
        return follows_clean;
    });
    // >>> se realiza una busqueda del usuario igual a [followed] en el registro de seguidores
    var followed = await Follow.find({
        "followed": userId
    }).select({
        '_id': 0,
        '__v': 0,
        'followed': 0
    }).exec().then((follows) => {
        var follows_clean = [];
        follows.forEach((follow) => {
            follows_clean.push(follow.user);
        });
        // >>>> se devuelve un conjunto de objetos con los usuarios que lo siguen
        return follows_clean;
    });
    // >>> se devuelven los conjuntos de objetos
    return {
        following,
        followed
    };
}
// << listado de follows

// >> Obtener contadores
function showCounters(req, res) {
    // >>> se asigna el id del usuario logeado a la variable [userId]
    var userId = req.user.sub || '1';
    // >>> se hace una comprobacion por si se envio un id de usuario dentro de la URL
    if (req.params.id) {
        // >>>> en caso de que exista el id enviado se lo asigna a la variable [userId]
        userId = req.params.id;
    };

    // >>> se llama a la funcion getCountFollow enviando la variable [userId]
    getCountFollow(userId).then((counters) => {
        // >>>> se devuelve el valor retornado por la funcion
        return res.status(200).send({
            counters: counters
        });
    });
}
// << Obtener contadores

// >> funcion asíncrona para obtener los contadores de follow
async function getCountFollow(user_id) {
    // >>> se ejecuta un conteo de registros en la tabla follow buscando el valor de [user_id] en el campo [user]
    var following = await Follow.countDocuments({
        "user": user_id
    }).exec().then((count) => {
        // >>>> se retorna el valor obtenido
        return count;
    });
    // >>> se ejecuta un conteo de registros en la tabla follow buscando el valor de [user_id] en el campo [followed]
    var followed = await Follow.countDocuments({
        "followed": user_id
    }).exec().then((count) => {
        // >>>> se retorna el valor obtenido
        return count;
    });
    // >>> se ejecuta un conteo de registros en la tabla Publication buscando el valor de [user_id] en el campo [user]
    var publications = await Publications.countDocuments({
        "user": user_id
    }).exec().then((count) => {
        // >>>> se retorna el valor obtenido
        return count
    })
    // >>> se devuelven los conjutos de objetos obtenidos
    return {
        following,
        followed,
        publications
    }
}
// << funcion asíncrona para obtener los contadores de follow

function updateCommons(req, res) {
    var userId = req.params.id;
    var update = req.body;

    User.find({
        'cedula': update.cedula
    }, (err, resp) => {
        let count = 0;

        if (err) return res.status(500).send({
            Message: 'Error al comprobar la Unicidad de la Cédula',
            Error: err
        });
        if (resp.length >= 1) {
            for (let index = 0; index < resp.length; index++) {
                const user = resp[index];
                if (user._id == userId) {
                    count = 1;
                }
            }
            if (count === 0) {
                return res.status(304).send({
                    Message: 'Cedula Duplicada'
                })
            } else if (count === 1) {
                console.log('Cedula Unica');
                User.findByIdAndUpdate(userId, update, {
                    new: true
                }, (err, Updated) => {
                    if (err) return res.status(500).send({
                        Message: 'Error al Ejecutar la peticion de Edicion, estado: [500 - Internal Server Error]',
                        Error: err
                    })
                    if (!Updated) return res.status(404).send({
                        Message: 'El servidor no devolvio ninguna respuesta, estado: [404 - not found]'
                    });
                    return res.status(200).send({
                        Message: 'El usuario: ' + update.nombre + ' ' + update.apellido + ', se edito correctamente.',
                        User: Updated
                    })
                })
            }
        }
        if (!resp || resp.length <= 0) {
            User.findByIdAndUpdate(userId, update, {
                new: true
            }, (err, Updated) => {
                if (err) return res.status(500).send({
                    Message: 'Error al Ejecutar la peticion de Edicion, estado: [500 - Internal Server Error]',
                    Error: err
                })
                if (!Updated) return res.status(404).send({
                    Message: 'El servidor no devolvio ninguna respuesta, estado: [404 - not found]'
                });
                return res.status(200).send({
                    Message: 'El usuario: ' + update.nombre + ' ' + update.apellido + ', se editó correctamente.',
                    User: Updated
                })
            })
        }
    })
}

// >> Editar usuario
function update(req, res) {
    // >>> asignacion de variables
    var userId = req.params.id;
    var update = req.body;
    // >>>> se elimina el campo contraseña
    delete update.contrase;
    // >>> se determina si el usuario editado es el mismo que el logeado
    if (userId != req.user.sub) {
        // >>>> en caso de que no sean los mismos se retorna un estado 401 y el mensaje de sin acceso
        return res.status(401).send({
            Message: 'Sin Acceso a Edicion de Datos'
        })
        // >>> si el usuario a editar es el mismo que el logeado
    } else {
        // >>>> se envian los datos unicos a la funcion unico para comprobar que los datos ingresados no se hayan repetido en otro usuario
        unico(userId, update.cuenta, update.correo, update.cedula).then((repetido) => {
            // >>>>> se revisa si alguno de los valores dio como resultado alguna repeticion dentro de la base de datos
            if (repetido.Correo == 0 || repetido.Cuenta == 0 || repetido.Cedula == 0) {
                // >>>>>> en caso de que se hayan repetido se devuelve un estado 401 y el mensaje de datos repetidos
                return res.status(401).send({
                    Message: 'datos repetidos....'
                });
                // >>>>> en caso de que todos los valores ingresados sean unicos
            } else if (repetido.Correo == 1 && repetido.Cuenta == 1 && repetido.Cedula == 1) {
                // >>>>>> se realiza una peticion de actualizacion de los datos del usuario
                User.findByIdAndUpdate(userId, update, {
                    new: true
                }, (err, userUpdated) => {
                    // >>>>>>> en caso de que la peticion falle se devuelve un estado 500, un mensaje y el error
                    if (err) return res.status(500).send({
                        Message: 'Error en la peticion',
                        Error: err
                    });
                    // >>>>>>> en caso de que no se reciba respuesta se devuelve un estado 500 y el mensaje de no actualizado
                    if (!userUpdated) res.status(500).send({
                        Message: 'No se actualizo el usuario'
                    });
                    // >>>>>>> si se recibe el usuario actualizado se devuelve un estado 200 y el conjunto de objetos
                    return res.status(200).send({
                        user: userUpdated
                    });
                })
                // >>>>> en caso de que no se reciba respuesta por parte del SGBD
            } else if (!repetido || repetido == null) {
                // >>>>>> se envia un estado 500 y el mensaje de que no hubo respuesta
                return res.status(500).send({
                    Message: 'no se obtuvo respuesta de la comprobacion de datos repetidos . . . . . ' + repetido
                })
            }
        })

    }
}
// << Editar usuario

// >> funcion asíncrona para comprobar la unicidad del usuario a editar
async function unico(id, cuenta, correo, cedula) {
    // >>> se ejecuta una busqueda con el campo correo para comprobar unicidad
    var Correo = await User.find({
        'correo': correo
    }).exec().then((resp) => {
        // >>>> se inicializa el conteo de repeticiones en 0
        var count = 0;
        // >>>> en caso de que el SGBD responda
        if (resp) {
            // >>>>> si la respuesta contiene menos de 0 objetos
            if (resp.length <= 0) {
                // >>>>>> se asigna el valor de 1 a la variable de conteo
                return count = 1;
                // >>>>> en caso de que la respuesta contenga un conjunto objetos de 1 o mas
            } else {
                // >>>>>> se revisa en cada elemento del conjunto de objetos
                resp.forEach(element => {
                    // >>>>>>> se verifica si el elemento en el que se encuentra es el mismo del usuario que se va a editar
                    if (element.id == id) {
                        // >>>>>>>> en caso de que sea el mismo usuario se aumenta en 1 el valor de count
                        return count = count + 1;
                        // >>>>>> en caso de que no concuerden los usuarios
                    } else {
                        // >>>>>>>> se devuelve el valor actual de count
                        return count;
                    }
                });
            }
        };
        // >>>> una vez finaliza todas las comparaciones se devuelve el valor actual de count
        return count;
    });
    var Cedula = await User.find({
        'cedula': cedula
    }).exec().then((resp) => {
        var count = 0;
        if (resp) {
            console.log('entrando en comprobacion de cedula...' + resp.cuenta);
            if (resp.length <= 0) {
                console.log('solo un registro... o ninguno?');
                return count = 1;
            } else {
                resp.forEach(element => {
                    if (element.id == id) {
                        return count = count + 1;
                    } else {
                        console.log('cedula Repetida');
                        return count;
                    }
                });
            }
        };
        return count;
    });
    var Cuenta = await User.find({
        'cuenta': cuenta
    }).exec().then((resp) => {
        var count = 0;
        if (resp) {
            console.log('entrando en comprobacion de cuenta...' + resp);
            if (resp.length <= 0) {
                console.log('solo un registro... o ninguno?');
                return Cuenta = 1;
            } else {
                resp.forEach(element => {
                    if (element.id == id) {
                        return count = count + 1;
                    } else {
                        console.log('cuenta Repetida');
                        return count;
                    }
                });
            }
        };
        return count;
    });
    return {
        Correo,
        Cuenta,
        Cedula
    };
}
// subir archivos de imagen

function UploadImageUser(req, res) {
    var UserId = req.params.id;
    try {
        if (req.files) {
            var file_path = req.files.image.path;
            var file_split = file_path.split('\\');
            var file_name = file_split[2];
            var ext_split = file_name.split('\.');
            var file_ext = ext_split[1];
            if (UserId != req.user.sub) {
                return removeFilesOfUpload(res, file_path, 'No tienes permiso para editar la imagen de este User');
            }
            if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
                // actualizar documento del user
                User.findByIdAndUpdate(UserId, {
                    image: file_name
                }, {
                    new: true
                }, (err, userUpdated) => {
                    if (err) return res.status(500).send({
                        Message: 'Error en la peticion'
                    });
                    if (!userUpdated) res.status(500).send({
                        Message: 'No se actualizo el usuario'
                    });
                    return res.status(200).send({
                        user: userUpdated
                    });
                });
            } else {
                return removeFilesOfUpload(res, file_path, 'Ups!, Algo va mal, no se ha podido subir el archivo. Extension no valida.');
            }
        } else {
            return res.status(404).send({
                Message: 'No se encuentra una imagen'
            });
        }
    } catch (error) {
        console.log(error);
    }
}
// funcion interna que remueve los archivos del servidor cuando exista algun error
function removeFilesOfUpload(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        console.log(err);
        return res.status(200).send({
            message
        });
    });

}

function getImageFile(req, res) {
    var image_File = req.params.imageFile;
    var path_file = './uploads/users/' + image_File;

    fs.exists(path_file, (exist) => {
        if (exist) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({
                Message: 'Ups, no encontramos la imagen dentro del servidor'
            });
        };
    });
}

function showByData(req, res) {
    var Show = [];
    var params = req.body;
    if (params.nombre) Show = {
        nombre: params.nombre
    };
    if (params.apellido) Show = {
        apellido: params.apellido
    };
    if (params.cedula) Show = {
        cedula: params.cedula
    };
    User.find(Show, (err, resp) => {
        console.log(Show);

        if (err) return res.status(500).send({
            Message: 'Error al ejecutar la peticion... Error: ' + err
        });
        if (!resp) return res.status(404).send({
            Message: 'La peticion no ha devuelto ningun valor...'
        });

        return res.status(200).send({
            resp
        });
    })
}

function removeCompletly(req, res) {
    var id = req.params.id;
    User.findByIdAndRemove(id, (err, resp) => {
        if (err) return res.status(500).send({
            Message: 'Error al ejecutar la peticion . . .' + err
        });
        if (!resp) return res.status(404).send({
            Message: 'la peticion no ha devuelto ningun valor'
        });
        return res.status(200).send({
            Message: 'El usuario ha sido borrado con exito'
        });
    });
}

function remove(req, res) {
    var id = req.params.id;
    var activa = false;

    User.findByIdAndUpdate(id, activa, (err, resp) => {
        if (err) return res.status(500).send({
            Message: 'Error al ejecutar la peticion'
        });
        if (!resp) return res.status(404).send({
            Message: 'La peticion no ha devuelto ningun valor'
        });
        return res.status(200).send({
            Message: 'El usuario ha sido borrado con exito . . . '
        });
    })

}
module.exports = {
    save,
    login,
    show,
    showUsers,
    showCounters,
    update,
    UploadImageUser,
    getImageFile,
    showByData,
    remove,
    removeCompletly,
    showRaw,
    saveUser,
    updateCommons
}