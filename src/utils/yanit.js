/**
 * Tum uclarin ayni bicimde cevap vermesini saglar.
 *
 * Basarili:  { success: true,  data: ..., message: "..." }
 * Hatali:    { success: false, error: { code, message, details } }
 *
 * Tutarli zarf, API'yi kullanan istemcinin her ucu ayri ayri ogrenmesini
 * gerektirmez; hata da basari da ayni sekilde okunur.
 */

/** Basarili yanit gonderir. */
function basarili(res, { data = null, message = null, durumKodu = 200, ek = {} } = {}) {
  const govde = { success: true };

  if (message) govde.message = message;
  govde.data = data;
  Object.assign(govde, ek);

  return res.status(durumKodu).json(govde);
}

/** Hatali yanit gonderir. */
function hatali(res, { durumKodu = 500, kod = 'INTERNAL_ERROR', message, details = null } = {}) {
  const govde = {
    success: false,
    error: { code: kod, message },
  };

  if (details) govde.error.details = details;

  return res.status(durumKodu).json(govde);
}

module.exports = { basarili, hatali };
