const servis = require('../services/gorevServisi');
const { basarili } = require('../utils/yanit');

/**
 * ISTEGE BAGLI — Raporlama uclari.
 * Yonergenin "Istege Bagli 03" bolumu; teslim kapsaminda degildir.
 */

/** GET /api/reports/completed — Tamamlanan gorev sayisi */
function tamamlananlar(req, res) {
  const sonuc = servis.durumaGoreGetir('completed');

  return basarili(res, {
    data: sonuc,
    message: `${sonuc.count} gorev tamamlanmis.`,
  });
}

/** GET /api/reports/pending — Bekleyen gorev sayisi */
function bekleyenler(req, res) {
  const sonuc = servis.durumaGoreGetir('pending');

  return basarili(res, {
    data: sonuc,
    message: `${sonuc.count} gorev beklemede.`,
  });
}

/** GET /api/reports/summary — Genel sistem ozeti */
function ozet(req, res) {
  return basarili(res, {
    data: servis.ozet(),
    message: 'Sistem ozeti hazirlandi.',
  });
}

module.exports = { tamamlananlar, bekleyenler, ozet };
