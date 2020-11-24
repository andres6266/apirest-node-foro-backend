'use strict'

//Invocar modulo de monoose Conectar con mongo 
var mongoose=require('mongoose');

var app=require('./app');

//configurar puerto
var port=process.env.PORT || 3999;

//Para Trabajar con promesas(funciones de call back: ejecutar una operacion de acuerdo al resultado )
//Arreglo de errores
mongoose.set('useFindAndModify', false);
mongoose.Promise=global.Promise;



//Realizar la conexion, url de base de datos y conexion mas efectiva con UseNuew..
mongoose.connect('mongodb://localhost:27017/api_rest_node',{useNewUrlParser:true, useUnifiedTopology: true})
    .then(()=>{
        console.log('La conexion a la base de datos de mongo se ha realizado correctamente');
        //Crear el servidor
        app.listen(port,()=>{
            console.log('Servidor http://localhost:3999 funciona correctamente');
            
        });
        
    })
    .catch(error=>{
        console.log(error);
        
    })