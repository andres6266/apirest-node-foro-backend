'use strict'

//Importar mongoose
var mongoose=require('mongoose');

//Crear esquemas de mongoose para definir propiedades
var Schema = mongoose.Schema;

var UserSchema=Schema({
    name:String,
    surname:String,
    email:String,
    password:String,
    image:String,
    role:String
});

//Devolver todos lso datos de usuario excepto la contrasena 
UserSchema.methods.toJSON=function(){
    var obj=this.toObject();

    delete obj.password;

    return obj;
};

//exportar archivo para llamar en otros archivos
module.exports=mongoose.model('User',UserSchema);
                            //lowercase y pluralizar el nombre
                            //users -> documentos (schema)