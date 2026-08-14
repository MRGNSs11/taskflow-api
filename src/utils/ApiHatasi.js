/**
 * Uygulama icindeki beklenen hatalar icin ozel hata sinifi.
 *
 * Servis katmani "gorev bulunamadi" gibi durumlarda bu hatayi firlatir;
 * merkezi hata yakalama middleware'i durum kodunu buradan okuyup
 * dogru HTTP cevabini uretir. Boylece her controller'da tekrar tekrar
 * hata bicimlendirmek gerekmez.
 */
class ApiHatasi extends Error {
  constructor(durumKodu, kod, message, details = null) {
    super(message);
    this.name = 'ApiHatasi';
    this.durumKodu = durumKodu;
    this.kod = kod;
    this.details = details;

    // Yigin izinde bu yapicinin gorunmemesi icin.
    Error.captureStackTrace(this, ApiHatasi);
  }

  /** 400 - istek govdesi veya parametreler gecersiz. */
  static gecersizIstek(message, details = null) {
    return new ApiHatasi(400, 'VALIDATION_ERROR', message, details);
  }

  /** 404 - istenen kayit yok. */
  static bulunamadi(message) {
    return new ApiHatasi(404, 'NOT_FOUND', message);
  }
}

module.exports = ApiHatasi;
