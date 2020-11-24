'use strict'
//Modelo topic donde se va a guardar el comentario
var Topic = require('../models/topic');
var validator = require('validator');

var controller = {
    add: function (req, res) {
        //id topic url
        var topicId = req.params.topicId;

        //find id de topic
        Topic.findById(topicId).exec((err, topic) => {

            if (err) {

                res.status(500).send({
                    status: 'error',
                    message: 'Error en la peticion'
                });
            }

            if (!topic) {

                res.status(404).send({
                    status: 'error',
                    message: 'Topic no encontrado'
                });
            }

            //Comprobar objeto usuario y validar datos
            if (req.body.content) {
                try {


                    var validate_content = !validator.isEmpty(req.body.content);


                } catch (error) {
                    return res.status(200).send({
                        message: 'No se ha comentado'
                    });
                }

                if (validate_content) {

                    var comment = {
                        user: req.user.sub,
                        content: req.body.content
                    };

                    //en la propiedad de comments del objeto topics hacer un push
                    topic.comments.push(comment);

                    //guardar el topic con el comentario
                    topic.save((err, topic) => {

                        if (err) {

                            res.status(500).send({
                                status: 'error',
                                message: 'Error al guardar el comentario en el topic'
                            });

                        }
                        //Buscar  por iD
                        Topic.findById(topic._id)
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

                        
                    });


                } else {
                    return res.status(200).send({
                        message: 'No se ha validado el comentario'
                    });

                }
            }

        });

    },

    //Operadores de actualizacion
    update: function (req, res) {
        //id comentario en url
        var commentId = req.params.commentId;

        //recoger datos y validar

        var params = req.body;

        try {
            var validate_content = !validator.isEmpty(params.content);
        } catch (error) {
            return res.status(200).send({
                message: 'No hay comentario'
            });
        }

        if (validate_content) {

            //find and update de subdocumento de comenatrio
            Topic.findOneAndUpdate(
                //buscar comentario mediante id y que solo el dueno lo pueda editar
                { "comments._id": commentId, "user": req.user.sub },
                //Operador de actualizacion $set para un subdocumento 
                { "$set": { 'comments.$.content': params.content } },
                { new: true },
                //Confirma si se actualiza o no
                (err, topicUpdated) => {

                    if (err) {
                        return res.status(500).send({
                            status: 'error',
                            message: 'Error en la peticion'
                        });
                    }

                    if (!topicUpdated) {
                        return res.status(404).send({
                            status: 'error',
                            message: 'No existe el comentario'
                        });

                    }

                    //devolver los datos


                    res.status(200).send({
                        status: 'success',
                        topic: topicUpdated
                    });
                }
            );
        }


    },
    delete: function (req, res) {
        // id del topic y el comentario url
        var topicId = req.params.topicId;
        var commentId = req.params.commentId;
        //seleccionar el subdocumento (comentario)
        Topic.findById(topicId, (err, topic) => {

            if (err) {

                res.status(500).send({
                    status: 'error',
                    message: 'Error en la peticion'
                });
            }

            if (!topic) {
                res.status(404).send({
                    status: 'error',
                    message: 'Topic no encontrado'
                });

            }

            //seleccionar comentario(subdocumento)
            var comment = topic.comments.id(commentId);
            //Borrar el comentario 
            if (comment) {
                comment.remove();
                //Guardar el topic 
                topic.save((err) => {
                    if (err) {

                        res.status(500).send({
                            status: 'error',
                            message: 'Error al guardar el topic'
                        });
                    }
                    if (!topic) {
                        res.status(404).send({
                            status: 'error',
                            message: 'Topic no encontrado'
                        });

                    }
                });

                 //Buscar  por iD
                 Topic.findById(topic._id)
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

                
            } else {
                return res.status(404).send({
                    status: 'error',
                    message: 'Comentario no encontrado'
                });
            }

        });

    }
};

//exportar
module.exports = controller;