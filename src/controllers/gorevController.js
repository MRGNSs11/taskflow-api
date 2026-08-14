const servis = require('../services/gorevServisi');
const { basarili } = require('../utils/yanit');

/**
 * Controller katmani.
 *
 * Gorevi yalnizca istegi almak, servisi cagirmak ve cevabi dondurmektir.
 * Is kurallari servis katmanindadir, veri erisimi ise depo katmanindadir.
 *
 * Hatalar burada yakalanmaz; merkezi hata yakalama middleware'ine birakilir.
 */

/** POST /api/tasks — Gorev ekleme */
function olustur(req, res) {
  const gorev = servis.olustur(req.body);

  return basarili(res, {
    durumKodu: 201, // 201 Created
    data: gorev,
    message: 'Gorev olusturuldu.',
  });
}

/** GET /api/tasks — Gorev listeleme (filtre, arama, siralama, sayfalama) */
function listele(req, res) {
  const { gorevler, sayfalama, toplam } = servis.listele(req.query);

  return basarili(res, {
    data: gorevler,
    message: `${gorevler.length} gorev listelendi.`,
    ek: sayfalama ? { pagination: sayfalama } : { total: toplam },
  });
}

/** GET /api/tasks/:id — Gorev detayi */
function getir(req, res) {
  const gorev = servis.getir(req.gorevId);

  return basarili(res, { data: gorev });
}

/** PUT /api/tasks/:id — Gorev guncelleme */
function guncelle(req, res) {
  const gorev = servis.guncelle(req.gorevId, req.body);

  return basarili(res, {
    data: gorev,
    message: 'Gorev guncellendi.',
  });
}

/** DELETE /api/tasks/:id — Gorev silme */
function sil(req, res) {
  servis.sil(req.gorevId);

  // 204 No Content: basarili ama dondurulecek govde yok.
  return res.status(204).send();
}

module.exports = { olustur, listele, getir, guncelle, sil };
