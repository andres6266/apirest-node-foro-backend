'use strict'

var validator = require('validator');
//Modelo
var Topic = require('../models/topic');

var controller = {


    save: function (req, res) {

        //Recoger parametros
        var params = req.body;
        //Validar los datos
        try {

            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);

        } catch (error) {
            return res.status(200).send({
                message: 'Faltan dantos'
            });
        }

        if (validate_title && validate_content && validate_lang) {

            //Crear ubjeto a guaradr
            var topic = new Topic();
            //Asigar nvalores
            topic.title = params.title;
            topic.content = params.content;
            topic.code = params.code;
            topic.lang = params.lang;
            //Usuario identificado (id)
            topic.user = req.user.sub;

            //Guardar el topic
            topic.save((err, topicStored) => {

                if (err || !topicStored) {
                    return res.status(404).send({
                        message: 'El topico no se ha guardado',
                        status: 'error'
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    topicStored
                });
            });

        } else {
            return res.status(400).send({
                message: 'Los datos no son validos'
            });

        }
    },

    //Paginacion

    getTopics: function (req, res) {

        //Cargar libreria de paginacion

        //Recoger la paguna actual
        if (req.params.page == null || req.params.page == undefined || !req.params.page || req.params.page == 0 || req.params.page == '0') {
            var page = 1;
        } else {

            var page = parseInt(req.params.page);
        }
        //Indicar las opciones de paginacion
        var options = {
            //Orden de mas viejo a mas nuevo=1
            //Orden de mas nuevo a viejo=-1
            sort: { date: -1 },
            //Cargar el objeto del usuario
            populate: 'user',
            //entradas por pagina
            limit: 5,
            page: page
        };
        //Fin de paginado({condicion},options,(err,topics)=>{})
        Topic.paginate({}, options, (err, topics) => {

            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al realizar la consulta',

                });
            }

            if (!topics) {
                return res.status(500).send({
                    status: 'notfound',
                    message: 'No hay topics ingresados',

                });
            }



            //Devolver (documentos, total topics, total de paginas)


            return res.status(200).send({
                status: 'success',
                topics: topics.docs,
                totalDocs: topics.totalDocs,
                totalPages: topics.totalPages
            });
        });

    },

    //Obtener temas por usuario
    getTopicsByUser: function (req, res) {

        //Id de usuario
        var userId = req.params.user;
        //condicion de usuario
        Topic.find({
            user: userId
        })
            .sort([['date', 'descending']])
            .exec((err, topics) => {

                if (err) {
                    //Devolver resultado
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en al peticion'
                    });

                }

                if (topics == '') {

                    //Devolver resultado
                    return res.status(404).send({
                        status: 'error',
                        message: 'No hay topics disponibles'
                    });
                }
                //Devolver resultado
                return res.status(200).send({
                    message: 'Get My Topics',
                    topics
                });
            });

    },

    getTopic: function (req, res) {

        //Sacar el id del topic mediante la url 
        var topicId = req.params.topic;

        //Buscar  por iD
        Topic.findById(topicId)
            //usuario que ha creado el topic (objeto)
            .populate('user').populate('comments.user').exec((err, topic) => {

                


                if (err) {

                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en la peticion'
                    });
                }

                if (!topic || topic == '') {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No hay topics disponibles'
                    });

                }

                //Devlver resultados
                return res.status(200).send({
                    status: 'success',
                    topic
                });
            });
    },

    update: function (req, res) {

        //id topic
        var topicId = req.params.topic;
        //datos del topic
        var params = req.body;
        //validar
        try {

            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);

        } catch (error) {
            return res.status(200).send({
                message: 'Faltan datos'
            });
        }

        if (validate_title && validate_content && validate_lang) {

            //json con los datos a modificar
            var update = {
                title: params.title,
                content: params.content,
                code: params.code,
                lang: params.lang

            };
            //find and update por id e id de usuario

            Topic.findOneAndUpdate({ _id: topicId, user: req.user.sub }, update, { new: true }, (err, topicUpdated) => {

                if (err) {


                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    });
                }

                if (!topicUpdated) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'Topic no disponible'
                    });

                }



                return res.status(200).send({
                    status: 'success',
                    topicUpdated
                });
            });

        } else {

            return res.status(200).send({
                message: 'Los datos no son correctos'
            });

        }
    },

    delete: function (req, res) {
        //id topic url 
        var topicId = req.params.topic;

        //Find  y delete el topico si es creado por el usuario que ha iniciado sesion 
        Topic.findOneAndDelete({ _id: topicId, user: req.user.sub }, (err, topicRemoved) => {

            if (err) {


                return res.status(500).send({
                    status: 'error',
                    message: 'Error al eliminar'
                });
            }

            if (!topicRemoved) {
                return res.status(404).send({
                    status: 'error',
                    message: 'Topic no disponible por lo tanto no se puede borrar'
                });

            }

            return res.status(200).send({
                status: 'success',
                topic: topicRemoved
            });
        });
    },

    //Buscar Topics

    search: function (req, res) {
        //Texto a buscar
        var searchString = req.params.search;
        //Find con operador or
        //$or: para cumplir multiples condiciones
        //$regex: expresion regular
        //$options: comprobar si hay coincidencia
        Topic.find({
            "$or": [
                { "title": { "$regex": searchString, "$options": "i" } },
                { "content": { "$regex": searchString, "$options": "i" } },
                { "code": { "$regex": searchString, "$options": "i" } },
                { "lang": { "$regex": searchString, "$options": "i" } }

            ]
        })
        //traer datos de usuario
        .populate('user')
        .sort([['date','descending']]).exec((err, topics) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la peticion'
                });
            }

            if (!topics || topics=='') {

                return res.status(404).send({
                    status: 'error',
                    message: 'Topics no encontrados'
                });
            }
            //devolver resutltado
            return res.status(200).send({
                status: 'success',
                topics
            });
        });

    }

};

module.exports = controller;