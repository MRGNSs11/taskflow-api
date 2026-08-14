const depo = require('../data/gorevDeposu');
const ApiHatasi = require('../utils/ApiHatasi');
const { ayarlar, DURUMLAR, ONCELIKLER } = require('../config/ayarlar');

/**
 * Is mantigi katmani.
 *
 * Controller'lar yalnizca istegi alip cevabi doner; kurallar burada durur.
 * Bu ayrim, yonergedeki "Kod Kalitesi" olcutunu hedefler.
 */

/** Yeni gorev olusturur. */
function olustur(veri) {
  const simdi = new Date().toISOString();

  return depo.ekle({
    title: veri.title.trim(),
    description: (veri.description || '').trim(),
    status: veri.status || 'pending',
    priority: veri.priority || 'medium',
    assignee: (veri.assignee || '').trim(),
    createdAt: simdi,
    updatedAt: simdi,
  });
}

/**
 * Gorevleri listeler.
 * Filtreleme, arama, siralama ve sayfalama istege bagli ozelliklerdir;
 * hicbir parametre verilmezse tum gorevler dondurulur.
 */
function listele(sorgu = {}) {
  let gorevler = depo.hepsiniGetir();

  // --- Filtreleme ---
  if (sorgu.status) {
    gorevler = gorevler.filter((g) => g.status === sorgu.status);
  }

  if (sorgu.priority) {
    gorevler = gorevler.filter((g) => g.priority === sorgu.priority);
  }

  if (sorgu.assignee) {
    const aranan = sorgu.assignee.toLowerCase();
    gorevler = gorevler.filter((g) => g.assignee.toLowerCase() === aranan);
  }

  // --- Arama (baslik ve aciklamada) ---
  if (sorgu.keyword) {
    const anahtar = sorgu.keyword.toLowerCase();
    gorevler = gorevler.filter(
      (g) =>
        g.title.toLowerCase().includes(anahtar) ||
        g.description.toLowerCase().includes(anahtar),
    );
  }

  // --- Siralama ---
  const siralamaAlani = sorgu.sort || 'id';
  const azalan = String(sorgu.order || 'asc').toLowerCase() === 'desc';

  gorevler = [...gorevler].sort((a, b) => {
    const solDeger = a[siralamaAlani];
    const sagDeger = b[siralamaAlani];

    if (solDeger === undefined || sagDeger === undefined) return 0;
    if (solDeger < sagDeger) return azalan ? 1 : -1;
    if (solDeger > sagDeger) return azalan ? -1 : 1;
    return 0;
  });

  const toplam = gorevler.length;

  // --- Sayfalama ---
  const sayfaIstendi = sorgu.page !== undefined || sorgu.limit !== undefined;

  if (!sayfaIstendi) {
    return { gorevler, sayfalama: null, toplam };
  }

  const sayfa = Math.max(1, Number.parseInt(sorgu.page, 10) || 1);
  const boyut = Math.min(
    ayarlar.enBuyukSayfaBoyutu,
    Math.max(1, Number.parseInt(sorgu.limit, 10) || ayarlar.varsayilanSayfaBoyutu),
  );

  const baslangic = (sayfa - 1) * boyut;

  return {
    gorevler: gorevler.slice(baslangic, baslangic + boyut),
    sayfalama: {
      page: sayfa,
      limit: boyut,
      total: toplam,
      totalPages: Math.max(1, Math.ceil(toplam / boyut)),
    },
    toplam,
  };
}

/** Tek gorev getirir; yoksa 404 hatasi firlatir. */
function getir(id) {
  const gorev = depo.idIleGetir(id);

  if (!gorev) {
    throw ApiHatasi.bulunamadi(`${id} numarali gorev bulunamadi.`);
  }

  return gorev;
}

/** Gorevi gunceller; yoksa 404 hatasi firlatir. */
function guncelle(id, veri) {
  // Once var mi diye bakilir, yoksa 404 doner.
  getir(id);

  const degisiklikler = { updatedAt: new Date().toISOString() };

  // Yalnizca gonderilen alanlar guncellenir (kismi guncelleme).
  for (const alan of ['title', 'description', 'status', 'priority', 'assignee']) {
    if (veri[alan] !== undefined) {
      degisiklikler[alan] =
        typeof veri[alan] === 'string' ? veri[alan].trim() : veri[alan];
    }
  }

  return depo.guncelle(id, degisiklikler);
}

/** Gorevi siler; yoksa 404 hatasi firlatir. */
function sil(id) {
  const silindi = depo.sil(id);

  if (!silindi) {
    throw ApiHatasi.bulunamadi(`${id} numarali gorev bulunamadi.`);
  }
}

/**
 * Raporlama ozeti (istege bagli ozellik).
 * Gorevleri duruma ve oncelige gore sayar.
 */
function ozet() {
  const gorevler = depo.hepsiniGetir();

  const durumaGore = {};
  for (const durum of DURUMLAR) {
    durumaGore[durum] = gorevler.filter((g) => g.status === durum).length;
  }

  const oncelikeGore = {};
  for (const oncelik of ONCELIKLER) {
    oncelikeGore[oncelik] = gorevler.filter((g) => g.priority === oncelik).length;
  }

  const calisanlar = {};
  for (const gorev of gorevler) {
    const kisi = gorev.assignee || 'atanmamis';
    calisanlar[kisi] = (calisanlar[kisi] || 0) + 1;
  }

  return {
    toplamGorev: gorevler.length,
    durumaGore,
    oncelikeGore,
    calisanaGore: calisanlar,
  };
}

/** Belirli bir durumdaki gorevleri ve sayisini dondurur. */
function durumaGoreGetir(durum) {
  const gorevler = depo.hepsiniGetir().filter((g) => g.status === durum);
  return { count: gorevler.length, tasks: gorevler };
}

module.exports = {
  olustur,
  listele,
  getir,
  guncelle,
  sil,
  ozet,
  durumaGoreGetir,
};
