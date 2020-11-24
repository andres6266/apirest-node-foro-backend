'use strict'

//Importar mongoose
var mongoose=require('mongoose');

//Crear esquemas de mongoose para definir propiedades
var Schema = mongoose.Schema;

//Cargar modulo para paginacion
var mongoosePaginate=require('mongoose-paginate-v2');


//Crear el esquema del modelo de los comentarios
var CommentSchema=Schema({
    content:String,
    date:{type:Date, default:Date.now},
    user:{type:Schema.ObjectId, ref:'User'}
});


//var Comment=mongoose.model('Comment',);

var TopicSchema=Schema({
    title:String,
    content:String,
    code:String,
    lang:String,
    date:{type:Date, default:Date.now},
    //Llav foranea
    user:{type: Schema.ObjectId,ref:'User'},
    //Guardar el esquema del modelo de los comentarios
    comments:[CommentSchema]
});

//Cargar paginacion
TopicSchema.plugin(mongoosePaginate);

//exportar archivo para llamar en otros archivos
module.exports=mongoose.model('Topic',TopicSchema);
                            //lowercase y pluralizar el nombre
                            //users -> documentos (schema)