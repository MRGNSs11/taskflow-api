const fs = require('fs');
const path = require('path');

const { ayarlar } = require('../config/ayarlar');

/**
 * ZORUNLU MIDDLEWARE — Logger
 *
 * Yonergede istenen tek middleware budur:
 * "Tum API isteklerinin (method, endpoint, zaman damgasi) konsola veya bir
 *  log dosyasina kayit altina alinmasi."
 *
 * Bu middleware ikisini birden yapar: hem konsola yazar hem logs/istekler.log
 * dosyasina ekler. Ayrica istegin kac milisaniyede tamamlandigini ve donen
 * HTTP durum kodunu da kaydeder.
 */

/** Log klasoru yoksa olusturur. */
function klasoruHazirla() {
  const klasor = path.dirname(ayarlar.logDosyasi);
  if (!fs.existsSync(klasor)) {
    fs.mkdirSync(klasor, { recursive: true });
  }
}

/** Durum koduna gore konsol rengi (okunabilirlik icin). */
function renk(durumKodu) {
  if (durumKodu >= 500) return '\x1b[31m'; // kirmizi
  if (durumKodu >= 400) return '\x1b[33m'; // sari
  if (durumKodu >= 300) return '\x1b[36m'; // camgobegi
  return '\x1b[32m'; // yesil
}

function logger(req, res, next) {
  const baslangic = Date.now();
  const zamanDamgasi = new Date().toISOString();

  // Yanit gonderildiginde calisir; boylece durum kodu ve sure de bilinir.
  res.on('finish', () => {
    const sure = Date.now() - baslangic;
    const satir =
      `[${zamanDamgasi}] ${req.method} ${req.originalUrl} ` +
      `-> ${res.statusCode} (${sure}ms)`;

    // 1) Konsola
    console.log(`${renk(res.statusCode)}${satir}\x1b[0m`);

    // 2) Dosyaya
    try {
      klasoruHazirla();
      fs.appendFileSync(ayarlar.logDosyasi, `${satir}\n`, 'utf8');
    } catch (hata) {
      // Log yazilamamasi istegin basarisiz olmasina yol acmamali.
      console.error('Log dosyasina yazilamadi:', hata.message);
    }
  });

  next();
}

module.exports = logger;
