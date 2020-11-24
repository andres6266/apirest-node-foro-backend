'use strict'
//JWT
var jwt = require('jwt-simple');

var moment = require('moment');

//clave secreta
var secret = 'clave-secreta-token99999';


//next: para salir el middleware y continuar con ejecucion
exports.authenticated = function (req, res, next) {


    //comprobar autorizacion esta ingresada
    if (!req.headers.authorization) {
        return res.status(403).send({
            message: 'La peticion no tiene la cabecera de autorizacion'
        });
    }
    //Limpiar el token y comiilas

    var token = req.headers.authorization.replace(/['"]+/g, '');



    //Decodificar el token 
    try {
        var payload = jwt.decode(token, secret);
        //Comprobar si el token a expirado
        if (payload.exp <= moment().unix()) {

            return res.status(404).send({
                message: 'El token ha expirado'
            });
        }
    } catch (ex) {
        return res.status(404).send({
            message: 'El token no es valido'
        });

    }

 
   


    //adjuntar usuario identificado al request es decir pasar al controlador
    req.user = payload;

   
    

    //Pasar  a la accion si el token es correcto
    next();
}