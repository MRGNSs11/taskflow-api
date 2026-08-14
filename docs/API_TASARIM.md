# TaskFlow — API Tasarım Dokümanı

Taban adres: `http://localhost:3000/api`
Tüm istek ve cevap gövdeleri `application/json` biçimindedir.

---

## Yanıt Zarfı

Her uç aynı yapıyı döndürür.

**Başarılı**

```json
{
  "success": true,
  "message": "Gorev olusturuldu.",
  "data": { }
}
```

**Hatalı**

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

---

# ZORUNLU UÇLAR

## 1. Görev Ekleme

```
POST /api/tasks
```

**İstek gövdesi**

| Alan | Tip | Zorunlu | Kural |
|---|---|:---:|---|
| `title` | string | ✓ | 3–120 karakter |
| `description` | string | | ≤ 1000 karakter |
| `status` | string | | Geçerli durumlardan biri, varsayılan `pending` |
| `priority` | string | | Geçerli önceliklerden biri, varsayılan `medium` |
| `assignee` | string | | ≤ 60 karakter |

```json
{
  "title": "Odeme modulu entegrasyonu",
  "description": "Odeme saglayicisi ile API baglantisinin kurulmasi",
  "status": "pending",
  "priority": "high",
  "assignee": "Omer Gunes"
}
```

**Cevap — 201 Created**

```json
{
  "success": true,
  "message": "Gorev olusturuldu.",
  "data": {
    "id": 7,
    "title": "Odeme modulu entegrasyonu",
    "description": "Odeme saglayicisi ile API baglantisinin kurulmasi",
    "status": "pending",
    "priority": "high",
    "assignee": "Omer Gunes",
    "createdAt": "2026-08-14T11:20:00.000Z",
    "updatedAt": "2026-08-14T11:20:00.000Z"
  }
}
```

**Olası hata — 400** başlık eksik veya geçersiz öncelik gönderildi.

---

## 2. Görev Listeleme

```
GET /api/tasks
```

Parametresiz çağrıldığında tüm görevleri döndürür.

**Cevap — 200 OK**

```json
{
  "success": true,
  "message": "6 gorev listelendi.",
  "data": [ { "id": 1, "title": "Kullanici giris ekrani" } ],
  "total": 6
}
```

Sayfalama parametresi verilirse `total` yerine `pagination` nesnesi döner:

```json
{
  "pagination": { "page": 1, "limit": 3, "total": 6, "totalPages": 2 }
}
```

---

## 3. Görev Detayı

```
GET /api/tasks/:id
```

**Cevap — 200 OK**

```json
{
  "success": true,
  "data": {
    "id": 2,
    "title": "Veritabani semasinin olusturulmasi",
    "status": "in-progress",
    "priority": "urgent",
    "assignee": "Mehmet Kaya"
  }
}
```

**Olası hatalar**

- `404` — o numarada görev yok
- `400` — numara pozitif tam sayı değil (örn. `/api/tasks/abc`)

---

## 4. Görev Güncelleme

```
PUT /api/tasks/:id
```

Yalnızca gönderilen alanlar güncellenir; gönderilmeyenler değişmez.
`updatedAt` her güncellemede yenilenir.

```json
{ "status": "completed", "priority": "medium" }
```

**Cevap — 200 OK** güncellenmiş görevin tamamını döndürür.

**Olası hatalar**

- `404` — görev yok
- `400` — geçersiz alan değeri veya boş gövde

---

## 5. Görev Silme

```
DELETE /api/tasks/:id
```

**Cevap — 204 No Content** — gövde boştur.

**Olası hata — 404** görev yok.

---

# İSTEĞE BAĞLI UÇLAR

> Yönergenin "İsteğe Bağlı" bölümündeki pratiklerdir. Teslim ve
> değerlendirme kapsamına dahil değildir; ek olarak geliştirilmiştir.

## Filtreleme, Arama, Sıralama, Sayfalama

Hepsi `GET /api/tasks` üzerinde sorgu parametresiyle çalışır ve birlikte
kullanılabilir.

| Parametre | Örnek | Açıklama |
|---|---|---|
| `status` | `?status=completed` | Duruma göre filtreleme |
| `priority` | `?priority=high` | Önceliğe göre filtreleme |
| `assignee` | `?assignee=Omer Gunes` | Çalışana göre listeleme |
| `keyword` | `?keyword=api` | Başlık ve açıklamada arama |
| `sort` | `?sort=priority` | Sıralama alanı |
| `order` | `?order=desc` | Sıralama yönü (`asc` / `desc`) |
| `page` | `?page=2` | Sayfa numarası |
| `limit` | `?limit=10` | Sayfa başına kayıt (en fazla 100) |

Birlikte kullanım:

```
GET /api/tasks?status=pending&priority=high&sort=createdAt&order=desc&page=1&limit=5
```

## Raporlama

| Uç | Döndürdüğü |
|---|---|
| `GET /api/reports/completed` | Tamamlanan görev sayısı ve listesi |
| `GET /api/reports/pending` | Bekleyen görev sayısı ve listesi |
| `GET /api/reports/summary` | Duruma, önceliğe ve çalışana göre dağılım |

**Özet cevabı örneği**

```json
{
  "success": true,
  "message": "Sistem ozeti hazirlandi.",
  "data": {
    "toplamGorev": 6,
    "durumaGore": { "pending": 2, "in-progress": 2, "completed": 1, "cancelled": 1 },
    "oncelikeGore": { "low": 1, "medium": 2, "high": 2, "urgent": 1 },
    "calisanaGore": { "Ayse Demir": 2, "Mehmet Kaya": 2, "Omer Gunes": 2 }
  }
}
```

---

# Yardımcı Uçlar

| Uç | Açıklama |
|---|---|
| `GET /` | API'nin ayakta olduğunu bildirir |
| `GET /api` | Tüm uçların listesini döndürür |

---

# Hata Kodları

| `error.code` | HTTP | Ne zaman |
|---|:---:|---|
| `VALIDATION_ERROR` | 400 | Alan kuralları sağlanmadı veya numara geçersiz |
| `INVALID_JSON` | 400 | İstek gövdesi geçerli JSON değil |
| `NOT_FOUND` | 404 | İstenen görev yok |
| `ROUTE_NOT_FOUND` | 404 | Böyle bir adres tanımlı değil |
| `INTERNAL_ERROR` | 500 | Beklenmeyen sunucu hatası |

# Geçerli Değerler

**status:** `pending` · `in-progress` · `completed` · `cancelled`
**priority:** `low` · `medium` · `high` · `urgent`
