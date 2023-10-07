var express = require('express');
const mongoose = require('mongoose');
const Tache = require('../model/tache');
var router = express.Router();
const validator = require('validator');
const path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//Post Method
router.post('/taches', async (req, res) => {

  try {
    if (!validator.isLength(req.body.name, { min: 3, max: 255 })) {
      return res.status(400).send({ error: 'Nom de tache invalide' });
    }

    if (!validator.isLength(req.body.description, { min: 10, max: 1000 })) {
      return res.status(400).send({ error: 'Description invalide' });
    }

    const completed = req.body.completed === 'on';

    const tache = new Tache({ 
      name: req.body.name, 
      description: req.body.description, 
      dueDate: req.body.dueDate, 
      createdDate: req.body.createdDate, 
      completed 
    });
    
    await tache.save();
    res.redirect('/visualisation.html');
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


  //Get all Method
  router.get('/taches', async (req, res) => {
    try {
      const taches = await Tache.find({});
      res.send(taches);
    } catch (error) {
      res.status(500).send();
    }
  });
  //Get by ID Method
  router.get('/taches/:id', async (req, res) => {
    try {
      const tache = await Tache.findById(req.params.id);
      if (!tache) {
        return res.status(404).send();
      }
      res.send(tache);
    } catch (error) {
      
      res.status(400).send({ error: 'Error updating task', details: error.message });
    }
    
  });
  //Update by ID Method
  router.patch('/taches/:id', async (req, res) => {
    try {
      const updates = Object.keys(req.body);
      const tache = await Tache.findById(req.params.id);
  
      if (!tache) {
        return res.status(404).send();
      }
  
      updates.forEach((update) => tache[update] = req.body[update]);
      await tache.save();
      res.send(tache);
    } catch (error) {
      res.status(400).send({ error: 'Error updating task', details: error.message });

    }
  });

  router.delete('/taches/:id', async (req, res) => {
    try {
      const tache = await Tache.findByIdAndDelete(req.params.id);
  
      if (!tache) {
        return res.status(404).send();
      }
  
      res.send(tache);
    } catch (error) {
      res.status(500).send();
    }
  });

  router.get('/visualisation', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../public', 'visualisation.html'));
  });

  router.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });
  
  module.exports = router;