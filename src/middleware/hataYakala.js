const ApiHatasi = require('../utils/ApiHatasi');
const { hatali } = require('../utils/yanit');

/**
 * Bilinmeyen adresler icin 404 uretir.
 * Tanimli tum route'lardan sonra baglanir.
 */
function bulunamadi(req, res) {
  return hatali(res, {
    durumKodu: 404,
    kod: 'ROUTE_NOT_FOUND',
    message: `${req.method} ${req.originalUrl} adresi bulunamadi.`,
  });
}

/**
 * MERKEZI HATA YAKALAMA
 *
 * Uygulamanin herhangi bir yerinde firlatilan hata buraya duser ve tek bir
 * yerden bicimlendirilir. Boylece her controller'da try/catch tekrar etmez.
 *
 * Express 5'te async fonksiyonlarda olusan hatalar da otomatik olarak
 * buraya yonlendirilir.
 */
// eslint-disable-next-line no-unused-vars
function hataYakala(hata, req, res, next) {
  // Bizim bilerek firlattigimiz hatalar (404, 400 gibi)
  if (hata instanceof ApiHatasi) {
    return hatali(res, {
      durumKodu: hata.durumKodu,
      kod: hata.kod,
      message: hata.message,
      details: hata.details,
    });
  }

  // Govdesi bozuk JSON gonderildiginde Express bu hatayi uretir.
  if (hata.type === 'entity.parse.failed') {
    return hatali(res, {
      durumKodu: 400,
      kod: 'INVALID_JSON',
      message: 'Istek govdesi gecerli bir JSON degil.',
    });
  }

  // Beklenmeyen hatalar: sunucu gunlugune yazilir, istemciye detay sizdirilmaz.
  console.error('Beklenmeyen hata:', hata);

  return hatali(res, {
    durumKodu: 500,
    kod: 'INTERNAL_ERROR',
    message: 'Sunucuda beklenmeyen bir hata olustu.',
  });
}

module.exports = { bulunamadi, hataYakala };
