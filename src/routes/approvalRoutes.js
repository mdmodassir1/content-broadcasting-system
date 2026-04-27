const express = require('express');
const { getPending, approve, reject } = require('../controllers/approvalController');
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');
const router = express.Router();

router.use(auth);
router.use(role(['principal']));

router.get('/pending', getPending);
router.put('/:id/approve', approve);
router.put('/:id/reject', reject);

module.exports = router;