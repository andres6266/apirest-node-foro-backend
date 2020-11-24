'use strict'
//Cargar dependencia de validacion 
var validator = require('validator');

//Cargar modelo
var User = require('../models/user');

//Cargar cifrado de contrasena
var bcrypt = require('bcrypt-node');

//Cargar el servicio de JWT para generar el token
var jwt = require('../services/jwt');

//Dependencia para borrar archivos
var fs = require('fs');

//Trabajon con ficheros(interna)
var path = require('path');
const user = require('../models/user');


var controller = {
    probando: function (req, res) {
        return res.status(200).send({
            message: 'Metodo probando'
        });
    },
    testeando: function (req, res) {
        return res.status(200).send({
            message: 'Metodo testeando'
        });

    },

    save: function (req, res) {
        //Recoger Parametros de la peticion
        var params = req.body;
        //Validar los datos

        try {

            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = validator.isEmail(params.email) && !validator.isEmpty(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch (error) {
            return res.status(404).send({
                //Crear middleware para comprobar el jwt token 
                message: 'Faltan datos por enviar',
                params
            });
        }

        if (validate_name && validate_surname && validate_email && validate_password) {


            //Crear objeto de usuario
            var user = new User();

            //Asignar valores al ubjeto de usuario
            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email.toLowerCase();
            user.role = 'ROLE_USER';
            user.image = null;

            //Comprobar si ya existe
            User.findOne({ email: user.email }, (err, issetUser) => {
                if (err) {
                    return res.status(500).send({
                        message: "Error al comprobar en duplicidad de usuario"
                    });
                }

                if (!issetUser) {

                    //Si no existe 
                    //cifrar la contrasena 
                    bcrypt.hash(params.password, null, null, (err, hash) => {
                        user.password = hash;
                        // guardar
                        user.save((err, userStored) => {
                            if (err) {

                                return res.status(500).send({
                                    message: "Error al guardar usuario"
                                });
                            }
                            if (!userStored) {
                                return res.status(400).send({
                                    message: "El usuario no se ha guardado"
                                });

                            }

                            //Usario guardado con exito
                            //Devolver respuesta 
                            return res.status(200).send({
                                status: 'success',
                                user: userStored
                            });



                        });//Guardar usuario


                    });//Encriptacion de contrasena


                } else {
                    return res.status(500).send({
                        message: "El usario ya esta registrado"
                    });

                }
            });

        } else {

            return res.status(200).send({
                message: 'Los datos no son validos'
            });
        }


    },

    login: (req, res) => {
        //Recoger parametros
        var params = req.body;


        //Validacion
        var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        var validate_password = !validator.isEmpty(params.password);



        //Si los datos ingresados no son validos
        if (!validate_email || !validate_password) {

            return res.status(200).send({
                message: 'Datos de inicio de sesion incorrectos'
            });
        }


        //Buscar usuarios que coincidan con mail
        User.findOne({ email: params.email }, (err, user) => {

            if (err) {
                return res.status(500).send({
                    message: 'Error al identifcarse'
                });
            }

            if (!user) {
                return res.status(404).send({
                    message: 'El usuario no existe'
                });
            }

            //Si encuentra el usuario comprobar contrasena 
            bcrypt.compare(params.password, user.password, (err, check) => {
                if (check) {




                    //Generar token de JWT y devolverlos mas tarde

                    //Se agrega un campo mas del token que es true si 
                    if (params.gettoken) {

                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });

                    } else {

                        //Limpiar objeto es decir no recibir informacion que puede comprometer la seguridad del usuario
                        user.password = undefined;
                        //Devolver datos

                        return res.status(200).send({
                            status: 'success',
                            user
                        });
                    }

                } else {
                    return res.status(200).send({
                        status: 'error',
                        message: 'Datos incorrectos de inicio de sesion'

                    });

                }
            });

        });
    },

    update: (req, res) => {

        //Recoger los datos del usuario
        var params = req.body;

        //Validar los datos
        try {

            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = validator.isEmail(params.email) && !validator.isEmpty(params.email);
        } catch (error) {

            return res.status(404).send({
                //Crear middleware para comprobar el jwt token 
                message: 'Faltan datos por enviar',
                params
            });
        }


        //Quitar propiedades innesearias
        delete params.password;


        //Buscar y actualizar documento en la BD
        var userId = req.user.sub;

        //Comprobar si el email es unico
        if (req.user.email != params.email) {
            User.findOne({ email: params.email }, (err, user) => {
                if (err) {
                    return res.status(500).send({
                        message: 'Error al intentar identificarse'
                    });
                }

                if (user && user.email == params.email) {
                    return res.status(200).send({
                        message: 'El email no puede ser modificado'
                    });

                }
            })
        } else {


            //(condicion,datos a actualizar, opciones que devuelva el nuevo objeto, callback)
            User.findOneAndUpdate({ _id: userId }, params, { new: true }, (err, userUpdated) => {

                if (err) {

                    return res.status(200).send({

                        status: 'error',
                        message: 'Error al actualizar usuario'
                    });
                }

                if (!userUpdated) {
                    return res.status.send({
                        status: 'error',
                        message: 'No se a actualizado el usuario'
                    })
                }

                return res.status(200).send({

                    status: 'success',
                    user: userUpdated
                });
            })

        }
    },


    uploadAvatar: function (req, res) {


        //configurar modulo multiparty para subida de ficheros- routes/user.js

        //Recoger el fichero de peticion 
        var file_name = 'Avatar no subido';


        if (!req.files) {


            return res.status(404).send({
                status: 'error',
                message: file_name
            });
        }

        //Conseguir el nombre y extension de archivo subido
        var file_path = req.files.file0.path;

        //Dividir un string mediante separador en este caso \\
        var file_split = file_path.split('\\');

        //en linux o mac va "/"
        //nombre de archivo
        file_name = file_split[2];

        //obtener extension de archivo
        var exp_split = file_name.split('\.');
        //extension de archivo
        var file_ext = exp_split[1];


        //Comprobar extension(imagen), si no es valida la extension borrar fichero

        if (file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif') {
            fs.unlink(file_path, (err) => {
                return res.status(403).send({
                    status: 'error',
                    message: 'La extension del archivo no esta valida'
                });
            });
        } else {

            //Sacar id de usuario identificado
            var userId = req.user.sub;


            //Reemplazar la imagen actual de perfil por una nueva eliminando la actual
            /* User.findOne({ _id: userId }, function (err, result) {

                if (result.image != null) {

                    var original_path = './uploads/users/' + result.image;

                    fs.unlink(original_path, (err) => {
                        if (err) throw err;
                        console.log(original_path);
                    });
                }


            }); */

            //Buscar y actualizar documento BD
            User.findOneAndUpdate({ _id: userId }, { image: file_name }, { new: true }, (err, userUpdated) => {
                if (err || !userUpdated) {

                    //Respueta
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al guardar el usuario'
                    });
                }

                //Respueta
                return res.status(200).send({
                    status: 'success',
                    user: userUpdated
                });
            });



        }


    },

    //devolver foto de usuario

    avatar: (req, res) => {
        var fileName = req.params.fileName;
        var pathFile = './uploads/users/' + fileName;
        //Comprobar si existe el fichero
        fs.exists(pathFile, (exists) => {
            if (exists) {
                return res.sendFile(path.resolve(pathFile));
            } else {
                res.status(404).send({
                    message: 'La imagen no existe'
                });
            }
        });
    },

    getUsers: function (req, res) {

        User.find().exec((err, users) => {
            if (err || !users) {
                return res.status(404).send({

                    status: 'error',
                    message: 'No hay usuarios para mostrar'
                });
            }

            return res.status(200).send({
                status: 'success',
                users
            });

        });
    },

    getUser: function (req, res) {
        var userId = req.params.userId;
        User.findById(userId).exec((err, user) => {
            if (err || !user) {
                return res.status(404).send({

                    status: 'error',
                    message: 'No existe el usuario'
                });
            }
            return res.status(200).send({

                status: 'success',
                user
            });

        });
    }



};

module.exports = controller;