const express = require('express');

const gorevRotalari = require('./gorevRotalari');
const raporRotalari = require('./raporRotalari');
const { basarili } = require('../utils/yanit');

/**
 * Tum rotalarin toplandigi yer.
 * app.js yalnizca bu dosyayi tanir; yeni bir modul eklendiginde
 * app.js'e dokunmadan buraya baglanir.
 */
const router = express.Router();

/** GET /api — API'nin ayakta oldugunu ve uclarini gosterir. */
router.get('/', (req, res) =>
  basarili(res, {
    message: 'TaskFlow API calisiyor.',
    data: {
      surum: '1.0.0',
      zorunluUclar: {
        'POST   /api/tasks': 'Gorev ekleme',
        'GET    /api/tasks': 'Gorev listeleme',
        'GET    /api/tasks/:id': 'Gorev detayi',
        'PUT    /api/tasks/:id': 'Gorev guncelleme',
        'DELETE /api/tasks/:id': 'Gorev silme',
      },
      istegeBagliUclar: {
        'GET /api/tasks?status=&priority=&assignee=': 'Filtreleme',
        'GET /api/tasks?keyword=': 'Arama',
        'GET /api/tasks?sort=&order=': 'Siralama',
        'GET /api/tasks?page=&limit=': 'Sayfalama',
        'GET /api/reports/completed': 'Tamamlanan gorev sayisi',
        'GET /api/reports/pending': 'Bekleyen gorev sayisi',
        'GET /api/reports/summary': 'Genel sistem ozeti',
      },
    },
  }),
);

router.use('/tasks', gorevRotalari);
router.use('/reports', raporRotalari);

module.exports = router;
