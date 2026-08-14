const ApiHatasi = require('../utils/ApiHatasi');
const { DURUMLAR, ONCELIKLER } = require('../config/ayarlar');

/**
 * ISTEGE BAGLI MIDDLEWARE — Validation
 *
 * Yonergenin "Istege Bagli 02" bolumu: title, description, priority ve
 * assignee alanlarinin dogrulanmasi; gecersiz veride 400 Bad Request ve
 * aciklayici mesaj.
 *
 * Zorunlu kapsamdaki tek middleware Logger'dir; bu katman onun uzerine
 * eklenmis ikinci, ileri seviye katmandir.
 */

/** id parametresinin pozitif tam sayi olmasini garanti eder. */
function idDogrula(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return next(
      ApiHatasi.gecersizIstek(
        'Gorev numarasi pozitif bir tam sayi olmalidir.',
        { id: req.params.id },
      ),
    );
  }

  req.gorevId = id;
  next();
}

/** Ortak alan kurallari. yeniKayit=true ise zorunlu alanlar aranir. */
function alanlariDogrula(govde, yeniKayit) {
  const hatalar = [];

  // --- title ---
  if (yeniKayit || govde.title !== undefined) {
    if (typeof govde.title !== 'string' || govde.title.trim() === '') {
      hatalar.push({ field: 'title', message: 'Baslik zorunludur.' });
    } else if (govde.title.trim().length < 3) {
      hatalar.push({ field: 'title', message: 'Baslik en az 3 karakter olmalidir.' });
    } else if (govde.title.trim().length > 120) {
      hatalar.push({ field: 'title', message: 'Baslik en fazla 120 karakter olabilir.' });
    }
  }

  // --- description ---
  if (govde.description !== undefined) {
    if (typeof govde.description !== 'string') {
      hatalar.push({ field: 'description', message: 'Aciklama metin olmalidir.' });
    } else if (govde.description.length > 1000) {
      hatalar.push({
        field: 'description',
        message: 'Aciklama en fazla 1000 karakter olabilir.',
      });
    }
  }

  // --- status ---
  if (govde.status !== undefined && !DURUMLAR.includes(govde.status)) {
    hatalar.push({
      field: 'status',
      message: `Durum su degerlerden biri olmalidir: ${DURUMLAR.join(', ')}`,
    });
  }

  // --- priority ---
  if (govde.priority !== undefined && !ONCELIKLER.includes(govde.priority)) {
    hatalar.push({
      field: 'priority',
      message: `Oncelik su degerlerden biri olmalidir: ${ONCELIKLER.join(', ')}`,
    });
  }

  // --- assignee ---
  if (govde.assignee !== undefined) {
    if (typeof govde.assignee !== 'string') {
      hatalar.push({ field: 'assignee', message: 'Atanan kisi metin olmalidir.' });
    } else if (govde.assignee.trim().length > 60) {
      hatalar.push({
        field: 'assignee',
        message: 'Atanan kisi en fazla 60 karakter olabilir.',
      });
    }
  }

  return hatalar;
}

/** POST /tasks icin dogrulama. */
function olusturmayiDogrula(req, res, next) {
  const hatalar = alanlariDogrula(req.body || {}, true);

  if (hatalar.length > 0) {
    return next(
      ApiHatasi.gecersizIstek('Gonderilen veri gecerli degil.', hatalar),
    );
  }

  next();
}

/** PUT /tasks/:id icin dogrulama. */
function guncellemeyiDogrula(req, res, next) {
  const govde = req.body || {};

  if (Object.keys(govde).length === 0) {
    return next(
      ApiHatasi.gecersizIstek('Guncellenecek en az bir alan gonderilmelidir.'),
    );
  }

  const hatalar = alanlariDogrula(govde, false);

  if (hatalar.length > 0) {
    return next(
      ApiHatasi.gecersizIstek('Gonderilen veri gecerli degil.', hatalar),
    );
  }

  next();
}

module.exports = { idDogrula, olusturmayiDogrula, guncellemeyiDogrula };
