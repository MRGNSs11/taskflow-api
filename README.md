# TaskFlow API — Kurulum Notu

Görev ve Proje Yönetim Sistemi REST API'si. Node.js ve Express.js ile
geliştirilmiştir. Bir yazılım şirketinin ekip içindeki görevleri oluşturması,
çalışanlara ataması, durum ve öncelik takibi yapması için tasarlanmıştır.

> Bu dosya yönergedeki **Kurulum Notu** çıktısıdır. Projenin amacı ve senaryosu
> için `docs/PROJE_TANITIM.md`, uç ayrıntıları için `docs/API_TASARIM.md`
> dosyalarına bakınız.

## Gereksinimler

- **Node.js 18 veya üzeri** (geliştirme sırasında 24.18 kullanıldı)
- npm

Kurulu olduğunu doğrulamak için:

```bash
node -v
npm -v
```

## Kurulum

```bash
# 1) Depoyu indirin
git clone https://github.com/MRGNSs11/taskflow-api.git
cd taskflow-api

# 2) Bağımlılıkları kurun
npm install
```

Tek bağımlılık **express**'tir.

## Sunucuyu Çalıştırma

```bash
npm start
```

Sunucu varsayılan olarak **http://localhost:3000** adresinde çalışır.
Açılışta konsolda şu bilgiler görünür:

```
  TaskFlow API
  Adres  : http://localhost:3000
  Uclar  : http://localhost:3000/api
  Kayit  : logs/istekler.log
```

Farklı bir port kullanmak için:

```bash
# Windows PowerShell
$env:PORT=4000; npm start

# macOS / Linux
PORT=4000 npm start
```

Geliştirme sırasında dosya değişikliklerinde sunucuyu otomatik yeniden
başlatmak için:

```bash
npm run dev
```

Sunucuyu durdurmak için terminalde **Ctrl + C**.

## Çalıştığını Doğrulama

Tarayıcıda veya terminalde:

```bash
curl http://localhost:3000/api
```

Uçların listesini içeren bir JSON cevabı dönerse API ayaktadır.

## Uçlar

### Zorunlu — Görev Yönetimi (CRUD)

| Metot | Adres | Açıklama | Başarılı yanıt |
|---|---|---|---|
| POST | `/api/tasks` | Görev ekleme | 201 Created |
| GET | `/api/tasks` | Görev listeleme | 200 OK |
| GET | `/api/tasks/:id` | Görev detayı | 200 OK |
| PUT | `/api/tasks/:id` | Görev güncelleme | 200 OK |
| DELETE | `/api/tasks/:id` | Görev silme | 204 No Content |

### İsteğe bağlı — ek geliştirmeler

> Yönergenin "İsteğe Bağlı" bölümündeki pratiklerdir; teslim ve
> değerlendirme kapsamına dahil değildir, ek olarak yapılmıştır.

| Adres | Açıklama |
|---|---|
| `/api/tasks?status=completed` | Duruma göre filtreleme |
| `/api/tasks?priority=high` | Önceliğe göre filtreleme |
| `/api/tasks?assignee=Omer Gunes` | Çalışana göre listeleme |
| `/api/tasks?keyword=api` | Başlık ve açıklamada arama |
| `/api/tasks?page=1&limit=10` | Sayfalama |
| `/api/tasks?sort=priority&order=desc` | Sıralama |
| `/api/reports/completed` | Tamamlanan görev sayısı |
| `/api/reports/pending` | Bekleyen görev sayısı |
| `/api/reports/summary` | Genel sistem özeti |

## Örnek İstek

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Odeme modulu entegrasyonu",
    "description": "Odeme saglayicisi ile API baglantisi",
    "status": "pending",
    "priority": "high",
    "assignee": "Omer Gunes"
  }'
```

Cevap:

```json
{
  "success": true,
  "message": "Gorev olusturuldu.",
  "data": {
    "id": 7,
    "title": "Odeme modulu entegrasyonu",
    "description": "Odeme saglayicisi ile API baglantisi",
    "status": "pending",
    "priority": "high",
    "assignee": "Omer Gunes",
    "createdAt": "2026-08-14T11:20:00.000Z",
    "updatedAt": "2026-08-14T11:20:00.000Z"
  }
}
```

## Postman ile Test

`postman/TaskFlow_API.postman_collection.json` dosyası hazır koleksiyondur.

1. Postman'i açın → **Import** → dosyayı seçin
2. Sunucunun çalıştığından emin olun (`npm start`)
3. Koleksiyondaki istekleri sırayla çalıştırın

Koleksiyon dört klasöre ayrılmıştır: zorunlu CRUD uçları, hata durumları,
isteğe bağlı filtreleme/arama/sayfalama ve raporlama.

Test ekran görüntüleri `postman/ekran_goruntuleri/` klasöründedir.

## Veri Saklama

Görevler `src/data/gorevler.json` dosyasında saklanır. Yönergede veritabanı
istenmediği için Node.js'in `fs` modülü yeterlidir. Sunucu yeniden
başlatıldığında veriler korunur.

Görev alanları:

| Alan | Tip | Açıklama |
|---|---|---|
| `id` | number | Otomatik artan, sistem üretir |
| `title` | string | Zorunlu, 3–120 karakter |
| `description` | string | İsteğe bağlı, en fazla 1000 karakter |
| `status` | string | `pending`, `in-progress`, `completed`, `cancelled` |
| `priority` | string | `low`, `medium`, `high`, `urgent` |
| `assignee` | string | Atanan çalışan, en fazla 60 karakter |
| `createdAt` | string | ISO 8601, sistem üretir |
| `updatedAt` | string | ISO 8601, her güncellemede yenilenir |

## Kayıt (Log) Dosyası

Logger middleware her isteği hem konsola hem `logs/istekler.log` dosyasına
yazar:

```
[2026-08-14T11:09:23.651Z] GET /api/tasks?status=completed -> 200 (0ms)
```

Kaydedilenler: zaman damgası · HTTP metodu · adres · dönen durum kodu · süre.

## Klasör Yapısı

```
src/
├── server.js                 Sunucuyu başlatan giriş noktası
├── app.js                    Express kurulumu ve middleware sırası
├── config/
│   └── ayarlar.js            Port, dosya yolları, sabit değerler
├── routes/                   Yalnızca adres tanımları
│   ├── index.js
│   ├── gorevRotalari.js
│   └── raporRotalari.js
├── controllers/              İstek alma ve cevap döndürme
│   ├── gorevController.js
│   └── raporController.js
├── services/                 İş mantığı
│   └── gorevServisi.js
├── data/                     Veri erişimi
│   ├── gorevDeposu.js
│   └── gorevler.json
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

İstek şu sırayla ilerler:
**route → middleware (doğrulama) → controller → service → data**

Bu ayrım sayesinde her katmanın tek bir sorumluluğu vardır; ileride veri
kaynağı değişirse yalnızca `data/` katmanı değiştirilir.

## HTTP Durum Kodları

| Kod | Ne zaman |
|---|---|
| 200 | Başarılı okuma veya güncelleme |
| 201 | Yeni görev oluşturuldu |
| 204 | Silme başarılı, dönecek gövde yok |
| 400 | Geçersiz veri veya geçersiz görev numarası |
| 404 | Görev veya adres bulunamadı |
| 500 | Beklenmeyen sunucu hatası |

Tüm cevaplar aynı zarfı kullanır:

```json
{ "success": true,  "message": "...", "data": ... }
{ "success": false, "error": { "code": "...", "message": "...", "details": [...] } }
```

## Not

Bu proje bir staj bitirme çalışmasıdır. Kimlik doğrulama ve veritabanı
katmanı yönerge kapsamı dışındadır.

Hazırlayan: **Ömer Güneş**
