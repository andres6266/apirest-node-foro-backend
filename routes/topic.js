'use strict'
var express=require('express');

//Controlador
var TopicController=require('../controllers/topic');

var router = express.Router();

//middleware
var md_auth=require('../middlewares/authenticated');


router.post('/topic',md_auth.authenticated,TopicController.save);
//parametro opcional
router.get('/topics/:page?',TopicController.getTopics);
router.get('/user-topics/:user',TopicController.getTopicsByUser);
router.get('/topic/:topic',TopicController.getTopic);
router.put('/topic/:topic',md_auth.authenticated,TopicController.update);
router.delete('/topic/:topic',md_auth.authenticated,TopicController.delete);
router.get('/search/:search',TopicController.search);
module.exports=router;