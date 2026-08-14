const path = require('path');

/**
 * Uygulama geneli ayarlar.
 * Ortam degiskeni verilmisse o kullanilir, yoksa varsayilan deger gecerlidir.
 */
const ayarlar = {
  port: process.env.PORT || 3000,

  // Gorevlerin saklandigi JSON dosyasi (veritabani istenmiyor, fs yeterli).
  veriDosyasi: path.join(__dirname, '..', 'data', 'gorevler.json'),

  // Logger middleware'inin yazdigi kayit dosyasi.
  logDosyasi: path.join(__dirname, '..', '..', 'logs', 'istekler.log'),

  // Sayfalama varsayilanlari (istege bagli ozellik).
  varsayilanSayfaBoyutu: 10,
  enBuyukSayfaBoyutu: 100,
};

/** Bir gorevin alabilecegi durumlar. */
const DURUMLAR = ['pending', 'in-progress', 'completed', 'cancelled'];

/** Bir gorevin alabilecegi oncelikler. */
const ONCELIKLER = ['low', 'medium', 'high', 'urgent'];

module.exports = { ayarlar, DURUMLAR, ONCELIKLER };
