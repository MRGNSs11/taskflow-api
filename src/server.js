const app = require('./app');
const { ayarlar } = require('./config/ayarlar');

/**
 * Sunucuyu baslatan giris noktasi.
 *
 * app.js (uygulama kurulumu) ile server.js (dinlemeye baslama) ayri
 * tutulur; boylece uygulama test edilirken port acmaya gerek kalmaz.
 */
const sunucu = app.listen(ayarlar.port, () => {
  console.log('');
  console.log('  TaskFlow API');
  console.log(`  Adres  : http://localhost:${ayarlar.port}`);
  console.log(`  Uclar  : http://localhost:${ayarlar.port}/api`);
  console.log(`  Kayit  : logs/istekler.log`);
  console.log('');
});

/** Kapatma sinyallerinde sunucuyu duzgunce kapat. */
for (const sinyal of ['SIGINT', 'SIGTERM']) {
  process.on(sinyal, () => {
    console.log(`\n${sinyal} alindi, sunucu kapatiliyor...`);
    sunucu.close(() => process.exit(0));
  });
}

module.exports = sunucu;
