var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', teamNumber: "D" });
});

/* GET how to play page. */
router.get('/how-to-play', function(req, res, next) {
  res.render('how-to');
});

module.exports = router;
