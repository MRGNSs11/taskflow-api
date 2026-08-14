const express = require('express');

const controller = require('../controllers/gorevController');
const {
  idDogrula,
  olusturmayiDogrula,
  guncellemeyiDogrula,
} = require('../middleware/dogrulama');

/**
 * Gorev rotalari — /api/tasks
 *
 * Bu dosya yalnizca "hangi adres hangi controller'a gider" bilgisini tutar.
 * Is mantigi controller ve servis katmanlarindadir.
 *
 * ZORUNLU 5 UC:
 *   POST   /api/tasks      -> gorev ekleme
 *   GET    /api/tasks      -> gorev listeleme
 *   GET    /api/tasks/:id  -> gorev detayi
 *   PUT    /api/tasks/:id  -> gorev guncelleme
 *   DELETE /api/tasks/:id  -> gorev silme
 */
const router = express.Router();

router
  .route('/')
  .get(controller.listele)
  .post(olusturmayiDogrula, controller.olustur);

router
  .route('/:id')
  .all(idDogrula)
  .get(controller.getir)
  .put(guncellemeyiDogrula, controller.guncelle)
  .delete(controller.sil);

module.exports = router;
