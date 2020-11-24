'use strict'

var express= require('express');

var UserController=require('../controllers/user');

var router=express.Router();

//Middleware
var md_auth=require('../middlewares/authenticated');

//Dependencia para subir archivos, para recibir datos tipo file
var multipart=require('connect-multiparty');

var md_upload=multipart({uploadDir:'./uploads/users'});

router.get('/probando',UserController.probando);
router.post('/testeando',UserController.testeando);

//Ruta de usuario
router.post('/register',UserController.save);
router.post('/login',UserController.login);
//Utilizacion de middleware 
router.put('/user/update',md_auth.authenticated,UserController.update);
router.post('/upload-avatar',[md_auth.authenticated,md_upload],UserController.uploadAvatar);
router.get('/avatar/:fileName',UserController.avatar);
router.get('/users',UserController.getUsers);
router.get('/user/:userId',UserController.getUser);
module.exports=router;