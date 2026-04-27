const express = require('express');
const { uploadContent, getMyContent } = require('../controllers/contentController');
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');
const router = express.Router();

router.use(auth);
router.use(role(['teacher']));

router.post('/upload', uploadContent);
router.get('/my-content', getMyContent);

module.exports = router;