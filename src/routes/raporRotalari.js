const express = require('express');

const controller = require('../controllers/raporController');

/**
 * Rapor rotalari — /api/reports
 * ISTEGE BAGLI bolum; teslim kapsaminda degildir.
 */
const router = express.Router();

router.get('/completed', controller.tamamlananlar);
router.get('/pending', controller.bekleyenler);
router.get('/summary', controller.ozet);

module.exports = router;
