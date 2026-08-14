# GEMINI'YE VERİLECEK KOMUT (Backend teslim PDF'i)

> Form Backend için **tek PDF** kabul ediyor, kod dosyası alanı yok.
> Bu yüzden GitHub linki PDF'in içinde, kapakta olacak.
>
> Kullanım: `====` çizgileri arasını kopyala → Gemini'ye yapıştır →
> Canvas çıktısını Google Dokümanlar'a aktar → Postman ekran görüntülerini
> elle ekle → **Dosya > İndir > PDF (.pdf)** → adını
> `OmerGunes_TaskFlow_Proje.pdf` yap.

**ÖNCE ŞUNU YAP:** Aşağıdaki metinde `<<GITHUB-LINKI>>` yazan yeri gerçek
depo adresiyle değiştir.

========================= BURADAN KOPYALA =========================

Sen teknik dokümantasyon yazan bir kıdemli yazılım mühendisisin. Benim için
bir staj bitirme projesi teslim raporu hazırlayacaksın. Çıktıyı **Canvas'ta,
tek parça bir belge** olarak üret.

## GÖREV

Aşağıda içeriği verilen TaskFlow REST API projesinin teslim raporunu yaz.
Belge Türkçe olacak, teknik ama sade bir dille yazılacak.

## BİÇİM KURALLARI (kesin)

1. Başlıklar hiyerarşik olsun: Başlık 1 (bölümler), Başlık 2 (alt başlıklar).
2. Kod ve JSON parçaları **ayrı kod kutusu** içinde, Consolas monospace
   yazı tipiyle, açık gri arka planlı olsun. Girintileri koru, kodu değiştirme.
3. Ekran görüntüsü yerleri için tam olarak şu biçimde tek satırlık yer
   tutucular bırak: `[[GÖRSEL: postman-1-ekleme.png]]`
   Altına italik resim yazısı ekle: *Şekil 5.1 — POST /api/tasks isteği ve
   201 Created cevabı*
4. Emoji kullanma. Tablolar gerçek tablo olarak biçimlendirilsin.
5. Uydurma yapma: aşağıda verilmeyen bir uç, alan veya sayı ekleme.
6. **Zorunlu / isteğe bağlı ayrımını her bölümde net tut.** Yönerge isteğe
   bağlı pratikleri "teslim ve değerlendirmeye dahil değildir" diyor; jüri
   neyin istendiğini neyin fazladan yapıldığını görebilmeli.

## BELGE YAPISI

### KAPAK SAYFASI
- Proje adı: **TaskFlow — Görev ve Proje Yönetim Sistemi API'si**
- Alt başlık: Node.js ile Backend Programlama — Bitirme Projesi
- Hazırlayan: **Ömer Güneş**
- Teknolojiler: Node.js 24 · Express.js 5 · REST API
- Tarih: Ağustos 2026
- **Kaynak kod (büyük ve net yaz):** `<<GITHUB-LINKI>>`
- Kapaktan sonra sayfa sonu.

### İÇİNDEKİLER
Bölümleri listeleyen basit tablo. Sonra sayfa sonu.

### BÖLÜM 1 — PROJE TANITIMI
Amaç: Eğitimde öğrenilen Node.js, Express, REST API, routing, middleware ve
CRUD konularının tek uygulamada gösterilmesi. Arayüz yok; tüm işlemler HTTP
istekleriyle yapılır, JSON döner.

Senaryo: Bir yazılım şirketi ekip içindeki görevleri, projeleri ve
çalışanların sorumluluklarını tek yerden takip etmek istiyor. Görevler
sözlü veya dağınık dosyalarda takip edildiği için hangi işin kimde olduğu,
hangisinin bittiği ve aciliyeti görülemiyor. TaskFlow bunu çözer:
görev oluşturma, çalışana atama, durum takibi, öncelik yönetimi,
filtreleme ve temel raporlama.

Sistem başka bir uygulamanın (web paneli, mobil uygulama) veri kaynağı
olacak şekilde tasarlandığı için yalnızca API katmanı geliştirilmiştir.

Sistem özeti tablosu:
Mimari: REST API, katmanlı yapı | Ortam: Node.js 18+ | Çerçeve: Express.js 5 |
Veri saklama: JSON dosyası | Kimlik doğrulama: Yok (yönerge dışı) |
Bağımlılık sayısı: 1 (express)

### BÖLÜM 2 — VERİ MODELİ
Tek ana varlık: Görev (Task). Şu tabloyu ver:

| Alan | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| id | number | — | Otomatik artan, sistem üretir |
| title | string | Evet | Görev başlığı (3–120 karakter) |
| description | string | Hayır | Ayrıntılı açıklama (en fazla 1000 karakter) |
| status | string | Hayır | pending, in-progress, completed, cancelled |
| priority | string | Hayır | low, medium, high, urgent |
| assignee | string | Hayır | Görevin atandığı çalışan (en fazla 60 karakter) |
| createdAt | string | — | Oluşturulma zamanı (ISO 8601) |
| updatedAt | string | — | Son güncelleme zamanı (ISO 8601) |

Not: status verilmezse pending, priority verilmezse medium kabul edilir.

Örnek görev kaydını kod kutusunda göster:
```json
{
  "id": 2,
  "title": "Veritabani semasinin olusturulmasi",
  "description": "Kullanici, gorev ve proje tablolarinin iliskileriyle birlikte kurulmasi.",
  "status": "in-progress",
  "priority": "urgent",
  "assignee": "Mehmet Kaya",
  "createdAt": "2026-08-05T11:00:00.000Z",
  "updatedAt": "2026-08-13T10:20:00.000Z"
}
```

### BÖLÜM 3 — API TASARIMI VE MİMARİ

**3.1 Katmanlı yapı.** Bir isteğin izlediği yolu anlat:
İstek → Route → Middleware → Controller → Service → Data → Cevap

| Katman | Sorumluluk |
|---|---|
| Route | Hangi adresin hangi controller'a gideceği |
| Middleware | İstek kaydı (logger) ve veri doğrulama |
| Controller | İsteği alma, servisi çağırma, cevabı döndürme |
| Service | İş kuralları: filtreleme, sıralama, güncelleme mantığı |
| Data | JSON dosyasından okuma ve yazma |

Gerekçesini yaz: her katmanın tek sorumluluğu var; veri kaynağı ileride
veritabanına taşınırsa yalnızca data katmanı değişir.

**3.2 Zorunlu uçlar tablosu:**

| Metot | Adres | Açıklama | Başarılı yanıt |
|---|---|---|---|
| POST | /api/tasks | Görev ekleme | 201 Created |
| GET | /api/tasks | Görev listeleme | 200 OK |
| GET | /api/tasks/:id | Görev detayı | 200 OK |
| PUT | /api/tasks/:id | Görev güncelleme | 200 OK |
| DELETE | /api/tasks/:id | Görev silme | 204 No Content |

**3.3 Yanıt zarfı.** Tüm uçlar aynı biçimi döndürür; kod kutusunda göster:
```json
{ "success": true,  "message": "...", "data": ... }
{ "success": false, "error": { "code": "...", "message": "...", "details": [...] } }
```
Gerekçe: istemci her ucu ayrı ayrı öğrenmek zorunda kalmaz.

**3.4 HTTP durum kodları tablosu:**
200 başarılı okuma/güncelleme · 201 kayıt oluşturuldu · 204 silindi, gövde yok ·
400 geçersiz veri veya geçersiz görev numarası · 404 görev veya adres
bulunamadı · 500 beklenmeyen sunucu hatası

**3.5 Hata kodları tablosu:**
VALIDATION_ERROR (400) · INVALID_JSON (400) · NOT_FOUND (404) ·
ROUTE_NOT_FOUND (404) · INTERNAL_ERROR (500)

### BÖLÜM 4 — LOGGER MIDDLEWARE (ZORUNLU)

Yönergenin zorunlu kapsamındaki tek middleware budur. Her isteğin HTTP
metodu, adresi ve zaman damgası hem konsola hem `logs/istekler.log`
dosyasına yazılır. Ek olarak dönen durum kodu ve isteğin kaç milisaniyede
tamamlandığı da kaydedilir.

Örnek kayıt satırlarını kod kutusunda ver:
```
[2026-08-14T11:09:02.034Z] GET /api/tasks/abc -> 400 (1ms)
[2026-08-14T11:09:02.074Z] GET /api/olmayan-uc -> 404 (1ms)
[2026-08-14T11:09:23.651Z] GET /api/tasks?status=completed -> 200 (0ms)
[2026-08-14T11:09:23.861Z] GET /api/reports/summary -> 200 (1ms)
```

Middleware'in `res.on('finish')` olayına bağlandığını, böylece cevap
gönderildikten sonra durum kodunun da bilinebildiğini açıkla. Log yazma
başarısız olursa isteğin yine de tamamlandığını belirt.

Middleware sırasının önemli olduğunu anlat: JSON çözümleyici → logger →
rotalar → 404 yakalayıcı → merkezî hata yakalayıcı.

### BÖLÜM 5 — POSTMAN TESTLERİ

Her uç için: kısa açıklama + yer tutucu + resim yazısı + beklenen sonuç.
Sırasıyla:

1. Görev ekleme — `[[GÖRSEL: postman-1-ekleme.png]]` — POST /api/tasks, 201 Created
2. Görev listeleme — `[[GÖRSEL: postman-2-listeleme.png]]` — GET /api/tasks, 200 OK, 6 görev
3. Görev detayı — `[[GÖRSEL: postman-3-detay.png]]` — GET /api/tasks/2, 200 OK
4. Görev güncelleme — `[[GÖRSEL: postman-4-guncelleme.png]]` — PUT /api/tasks/2, 200 OK
5. Görev silme — `[[GÖRSEL: postman-5-silme.png]]` — DELETE /api/tasks/6, 204 No Content
6. Hata durumu — `[[GÖRSEL: postman-6-hata.png]]` — GET /api/tasks/999, 404 NOT_FOUND

Bölüm sonunda: beş zorunlu ucun tamamının test edildiğini, ayrıca hata
durumlarının da doğrulandığını yaz.

### BÖLÜM 6 — KURULUM NOTU

Gereksinim: Node.js 18+, npm. Adımları kod kutularında ver:

```bash
git clone <<GITHUB-LINKI>>
cd taskflow-api
npm install
npm start
```

Sunucunun http://localhost:3000 adresinde çalıştığını, açılışta konsola
adres ve log dosyası yolunun yazıldığını belirt. Farklı port için:

```bash
# Windows PowerShell
$env:PORT=4000; npm start
# macOS / Linux
PORT=4000 npm start
```

Doğrulama: `curl http://localhost:3000/api` uçların listesini döndürür.

Postman koleksiyonunun `postman/TaskFlow_API.postman_collection.json`
dosyasında hazır olduğunu, Import ile yüklenebileceğini yaz.

### BÖLÜM 7 — KLASÖR YAPISI

Şu ağacı kod kutusunda ver:

```
src/
├── server.js                 Sunucuyu başlatan giriş noktası
├── app.js                    Express kurulumu ve middleware sırası
├── config/ayarlar.js         Port, dosya yolları, sabit değerler
├── routes/                   Yalnızca adres tanımları
│   ├── index.js
│   ├── gorevRotalari.js
│   └── raporRotalari.js
├── controllers/              İstek alma ve cevap döndürme
│   ├── gorevController.js
│   └── raporController.js
├── services/gorevServisi.js  İş mantığı
├── data/
│   ├── gorevDeposu.js        Veri erişimi
│   └── gorevler.json         Görevlerin saklandığı dosya
├── middleware/
│   ├── logger.js             ZORUNLU: istek kaydı
│   ├── dogrulama.js          İsteğe bağlı: alan doğrulama
│   └── hataYakala.js         Merkezî hata yakalama + 404
└── utils/
    ├── yanit.js              Tutarlı JSON yanıt zarfı
    └── ApiHatasi.js          Özel hata sınıfı

docs/                         Proje tanıtım ve API tasarım dokümanları
postman/                      Postman koleksiyonu ve ekran görüntüleri
logs/                         Çalışma sırasında üretilen istek kayıtları
```

### BÖLÜM 8 — İSTEĞE BAĞLI GELİŞTİRMELER

Bu bölüme şu uyarıyla başla: *"Aşağıdakiler yönergenin 'İsteğe Bağlı'
bölümünde yer alan, teslim ve değerlendirmeye dahil olmayan pratiklerdir.
Zorunlu kapsam yukarıdaki bölümlerde tamamlanmıştır; bu bölüm ek olarak
geliştirilmiştir."*

| Parametre | Örnek | Açıklama |
|---|---|---|
| status | ?status=completed | Duruma göre filtreleme |
| priority | ?priority=high | Önceliğe göre filtreleme |
| assignee | ?assignee=Omer Gunes | Çalışana göre listeleme |
| keyword | ?keyword=api | Başlık ve açıklamada arama |
| sort / order | ?sort=priority&order=desc | Sıralama |
| page / limit | ?page=1&limit=10 | Sayfalama |

Validation middleware: title, description, status, priority ve assignee
alanları doğrulanır; geçersiz veride 400 Bad Request ve alan bazlı
açıklayıcı hata listesi döner. Örnek cevabı kod kutusunda ver:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Gonderilen veri gecerli degil.",
    "details": [ { "field": "title", "message": "Baslik zorunludur." } ]
  }
}
```

Raporlama uçları:
GET /api/reports/completed — tamamlanan görev sayısı ve listesi
GET /api/reports/pending — bekleyen görev sayısı ve listesi
GET /api/reports/summary — duruma, önceliğe ve çalışana göre dağılım

Özet cevabı örneğini kod kutusunda ver:
```json
{
  "toplamGorev": 6,
  "durumaGore": { "pending": 2, "in-progress": 2, "completed": 1, "cancelled": 1 },
  "oncelikeGore": { "low": 1, "medium": 2, "high": 2, "urgent": 1 },
  "calisanaGore": { "Ayse Demir": 2, "Mehmet Kaya": 2, "Omer Gunes": 2 }
}
```

### SONUÇ

Yönergenin dört zorunlu aşamasının tamamlandığını gösteren tablo:

| Aşama | Çıktı | Durum |
|---|---|---|
| 1 — İhtiyaç analizi ve sistem tasarımı | Proje tanıtım dokümanı, veri modeli, uç listesi | Tamamlandı |
| 2 — Backend altyapısı | Çalışan Express projesi, katmanlı klasör yapısı, routing | Tamamlandı |
| 3 — CRUD + temel middleware | 5 uç + Logger middleware | Tamamlandı |
| 4 — Test ve teslim | Postman testleri, kurulum notu, ekran görüntüleri | Tamamlandı |

Ardından teslim edilen üç temel çıktının bu belgede nerede olduğunu yaz:
Proje Tanıtım Dokümanı (Bölüm 1), Kurulum Notu (Bölüm 6), Postman Test
Ekran Görüntüleri (Bölüm 5). Kaynak kodların tamamının kapaktaki GitHub
adresinde olduğunu belirt.

Şimdi belgeyi Canvas'ta üret. Hiçbir bölümü atlama, `[[GÖRSEL: ...]]` yer
tutucularını unutma, zorunlu/isteğe bağlı ayrımını koru.

========================= BURAYA KADAR KOPYALA =========================

---

## GÖRSELLERİ NEREYE EKLEYECEKSİN

Belgede `[[GÖRSEL: xxx.png]]` yazan satırı sil, yerine ilgili dosyayı ekle.
Dosyalar: `04_backend_taskflow\postman\ekran_goruntuleri\`

| Yer tutucu | Ne göstermeli |
|---|---|
| `postman-1-ekleme.png` | POST /api/tasks — gövde ve 201 Created cevabı |
| `postman-2-listeleme.png` | GET /api/tasks — 200 OK, görev listesi |
| `postman-3-detay.png` | GET /api/tasks/2 — 200 OK |
| `postman-4-guncelleme.png` | PUT /api/tasks/2 — 200 OK |
| `postman-5-silme.png` | DELETE /api/tasks/6 — 204 No Content |
| `postman-6-hata.png` | GET /api/tasks/999 — 404 NOT_FOUND |

Ekran görüntüsü alırken **hem istek hem cevap** görünsün; durum kodu
(201 Created gibi) sağ üstte okunabilir olsun.

## SON ADIMLAR

1. Google Dokümanlar > Dosya > İndir > **PDF belgesi (.pdf)**
2. Dosya adı: `OmerGunes_TaskFlow_Proje.pdf` (Türkçe karakter/emoji yok)
3. Boyut 100 MB'ı geçmemeli (form sınırı) — sorun olmaz
4. Bana haber ver, yönerge maddelerine göre doğrulayayım
