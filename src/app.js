const express = require('express');

const logger = require('./middleware/logger');
const { bulunamadi, hataYakala } = require('./middleware/hataYakala');
const rotalar = require('./routes');

/**
 * Express uygulamasinin kurulumu.
 *
 * Middleware sirasi onemlidir:
 *   1) JSON govde cozumleyici
 *   2) Logger  (zorunlu middleware - her istegi kaydeder)
 *   3) Rotalar
 *   4) 404 yakalayici (hicbir rota eslesmediyse)
 *   5) Merkezi hata yakalayici (en sonda olmali)
 */
const app = express();

// 1) Gelen JSON govdelerini cozumle.
app.use(express.json());

// 2) ZORUNLU MIDDLEWARE: her istegi konsola ve dosyaya kaydeder.
app.use(logger);

// 3) Uygulama rotalari.
app.use('/api', rotalar);

// Koke gelen istegi API'ye yonlendiren kisa bilgi.
app.get('/', (req, res) =>
  res.json({
    success: true,
    message: 'TaskFlow API. Uclarin listesi icin /api adresine bakiniz.',
  }),
);

// 4) Tanimli hicbir rotaya uymayan istekler.
app.use(bulunamadi);

// 5) Merkezi hata yakalama (dort parametreli oldugu icin Express bunu
//    hata middleware'i olarak tanir).
app.use(hataYakala);

module.exports = app;
