const express = require('express');
const { getLiveContent } = require('../controllers/publicController');
const router = express.Router();

router.get('/live/:teacherId', getLiveContent);

module.exports = router;