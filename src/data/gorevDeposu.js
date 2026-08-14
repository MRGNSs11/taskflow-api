const fs = require('fs');
const path = require('path');

const { ayarlar } = require('../config/ayarlar');

/**
 * Veri katmani.
 *
 * Gorevler bir JSON dosyasinda saklanir (yonergede veritabani istenmiyor).
 * Sunucu yeniden baslatildiginda veriler korunur.
 *
 * Bu katman yalnizca "oku / yaz" isini bilir; is kurallari servis
 * katmanindadir. Boylece ileride veritabanina gecilse yalnizca bu dosya
 * degistirilir.
 */

/** Dosya yoksa baslangic verisiyle olusturur. */
function dosyayiHazirla() {
  const klasor = path.dirname(ayarlar.veriDosyasi);
  if (!fs.existsSync(klasor)) {
    fs.mkdirSync(klasor, { recursive: true });
  }

  if (!fs.existsSync(ayarlar.veriDosyasi)) {
    const baslangic = { sonId: 0, gorevler: [] };
    fs.writeFileSync(
      ayarlar.veriDosyasi,
      JSON.stringify(baslangic, null, 2),
      'utf8',
    );
  }
}

/** JSON dosyasinin tamamini okur. */
function oku() {
  dosyayiHazirla();

  try {
    const metin = fs.readFileSync(ayarlar.veriDosyasi, 'utf8');
    const govde = JSON.parse(metin);

    return {
      sonId: Number(govde.sonId) || 0,
      gorevler: Array.isArray(govde.gorevler) ? govde.gorevler : [],
    };
  } catch (hata) {
    // Dosya bozuksa uygulamayi cokertmek yerine bos veriyle devam et.
    console.error('Veri dosyasi okunamadi, bos liste kullaniliyor:', hata.message);
    return { sonId: 0, gorevler: [] };
  }
}

/** Tum veriyi diske yazar. */
function yaz(govde) {
  dosyayiHazirla();
  fs.writeFileSync(ayarlar.veriDosyasi, JSON.stringify(govde, null, 2), 'utf8');
}

/** Tum gorevleri dondurur. */
function hepsiniGetir() {
  return oku().gorevler;
}

/** id'ye gore tek gorev dondurur, yoksa undefined. */
function idIleGetir(id) {
  return oku().gorevler.find((gorev) => gorev.id === id);
}

/** Yeni gorev ekler ve eklenen gorevi dondurur. */
function ekle(gorev) {
  const govde = oku();
  const yeniId = govde.sonId + 1;

  const yeniGorev = { id: yeniId, ...gorev };

  govde.sonId = yeniId;
  govde.gorevler.push(yeniGorev);
  yaz(govde);

  return yeniGorev;
}

/** Mevcut gorevi gunceller, guncellenmis gorevi dondurur; yoksa null. */
function guncelle(id, degisiklikler) {
  const govde = oku();
  const sira = govde.gorevler.findIndex((gorev) => gorev.id === id);

  if (sira === -1) return null;

  govde.gorevler[sira] = { ...govde.gorevler[sira], ...degisiklikler, id };
  yaz(govde);

  return govde.gorevler[sira];
}

/** Gorevi siler; silindiyse true, kayit yoksa false dondurur. */
function sil(id) {
  const govde = oku();
  const oncekiAdet = govde.gorevler.length;

  govde.gorevler = govde.gorevler.filter((gorev) => gorev.id !== id);

  if (govde.gorevler.length === oncekiAdet) return false;

  yaz(govde);
  return true;
}

module.exports = { hepsiniGetir, idIleGetir, ekle, guncelle, sil };
