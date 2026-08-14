# TaskFlow — Proje Tanıtım Dokümanı

**Görev ve Proje Yönetim Sistemi API'si**
Node.js ile Backend Programlama — Bitirme Projesi

Hazırlayan: **Ömer Güneş** · Ağustos 2026

---

## 1. Projenin Amacı

Bu proje, eğitim boyunca öğrenilen Node.js, Express.js, REST API tasarımı,
routing, middleware ve CRUD konularının tek bir uygulama üzerinde
gösterilmesi amacıyla geliştirilmiştir.

Ortaya çıkan sistem, bir yazılım şirketinin ekip içi görev takibini
yürütebileceği, tamamen REST API mantığında çalışan bir sunucu
uygulamasıdır. Arayüzü yoktur; tüm işlemler HTTP istekleriyle yapılır ve
JSON cevapları döner.

## 2. Senaryo

Bir yazılım şirketi, ekip içerisindeki görevleri, projeleri ve çalışanların
sorumluluklarını tek bir yerden takip etmek istemektedir. Hâlihazırda görevler
sözlü olarak veya dağınık dosyalarda takip edilmekte; bu yüzden hangi işin
kimde olduğu, hangisinin tamamlandığı ve hangisinin aciliyeti bulunduğu
net görülememektedir.

TaskFlow bu ihtiyacı karşılamak için tasarlanmıştır. Sistem üzerinden:

- Yeni görev oluşturulabilir
- Görevler çalışanlara atanabilir
- Görevlerin durumu takip edilebilir (beklemede, devam ediyor, tamamlandı,
  iptal edildi)
- Görevlere öncelik verilebilir (düşük, orta, yüksek, acil)
- Görevler duruma, önceliğe ve çalışana göre filtrelenebilir
- Temel raporlar alınabilir

Sistem bir başka uygulamanın (web paneli, mobil uygulama) veri kaynağı
olarak kullanılmak üzere tasarlanmıştır; bu nedenle yalnızca API katmanı
geliştirilmiştir.

## 3. Sistem Özeti

| | |
|---|---|
| **Mimari** | REST API, katmanlı yapı |
| **Çalışma ortamı** | Node.js 18+ |
| **Çerçeve** | Express.js 5 |
| **Veri saklama** | JSON dosyası (`src/data/gorevler.json`) |
| **Kimlik doğrulama** | Yok (yönerge kapsamı dışında) |
| **Bağımlılık sayısı** | 1 (express) |

### Katmanlar

Bir isteğin izlediği yol:

```
İstek → Route → Middleware → Controller → Service → Data → Cevap
```

| Katman | Sorumluluk |
|---|---|
| **Route** | Hangi adresin hangi controller'a gideceği |
| **Middleware** | İstek kaydı (logger) ve veri doğrulama |
| **Controller** | İsteği alma, servisi çağırma, cevabı döndürme |
| **Service** | İş kuralları: filtreleme, sıralama, güncelleme mantığı |
| **Data** | JSON dosyasından okuma ve yazma |

Bu ayrımın nedeni, her katmanın tek bir işten sorumlu olmasıdır. Örneğin
ileride veri JSON dosyası yerine bir veritabanında tutulmak istenirse
yalnızca `data/` katmanı değiştirilir; controller ve servis kodlarına
dokunulmaz.

## 4. Veri Modeli

Sistemde tek bir ana varlık vardır: **Görev (Task)**.

| Alan | Tip | Zorunlu | Açıklama |
|---|---|:---:|---|
| `id` | number | — | Otomatik artan, sistem üretir |
| `title` | string | ✓ | Görev başlığı (3–120 karakter) |
| `description` | string | | Ayrıntılı açıklama (≤ 1000 karakter) |
| `status` | string | | `pending` · `in-progress` · `completed` · `cancelled` |
| `priority` | string | | `low` · `medium` · `high` · `urgent` |
| `assignee` | string | | Görevin atandığı çalışan |
| `createdAt` | string | — | Oluşturulma zamanı (ISO 8601) |
| `updatedAt` | string | — | Son güncelleme zamanı (ISO 8601) |

Yeni görev oluşturulurken `status` verilmezse `pending`, `priority`
verilmezse `medium` kabul edilir.

## 5. Sistem Ne Yapıyor

**Zorunlu kapsam — beş uç ve bir middleware**

| İşlev | Uç |
|---|---|
| Görev oluşturma | `POST /api/tasks` |
| Görev listeleme | `GET /api/tasks` |
| Görev detayı | `GET /api/tasks/:id` |
| Görev güncelleme | `PUT /api/tasks/:id` |
| Görev silme | `DELETE /api/tasks/:id` |

**Logger middleware:** Sisteme gelen her isteğin HTTP metodu, adresi ve zaman
damgası hem konsola hem `logs/istekler.log` dosyasına kaydedilir. Dönen durum
kodu ve isteğin kaç milisaniyede tamamlandığı da kayda eklenmiştir.

Örnek kayıt satırı:

```
[2026-08-14T11:09:23.651Z] GET /api/tasks?status=completed -> 200 (0ms)
```

**İsteğe bağlı olarak eklenenler** — yönergenin "İsteğe Bağlı" bölümünde yer
alan, teslim ve değerlendirmeye dahil olmayan pratiklerdir:

- Duruma, önceliğe ve çalışana göre filtreleme
- Başlık ve açıklamada anahtar kelime arama
- Sayfalama ve sıralama
- Alan doğrulama middleware'i (400 Bad Request + açıklayıcı hata listesi)
- Raporlama uçları (tamamlanan, bekleyen, genel özet)

## 6. Hata Yönetimi

Uygulamanın herhangi bir yerinde oluşan hata tek bir merkezî middleware'de
yakalanır ve aynı biçimde döndürülür. Böylece her controller'da hata
bicimlendirme kodu tekrar etmez.

| Durum | Kod | Örnek |
|---|:---:|---|
| Başarılı okuma / güncelleme | 200 | Görev listelendi |
| Kayıt oluşturuldu | 201 | Yeni görev eklendi |
| Silindi, gövde yok | 204 | Görev silindi |
| Geçersiz veri | 400 | Başlık boş gönderildi |
| Bulunamadı | 404 | 999 numaralı görev yok |
| Beklenmeyen hata | 500 | Sunucu tarafı sorun |

Başarılı ve hatalı cevaplar aynı zarfı kullanır:

```json
{ "success": true,  "message": "...", "data": ... }
{ "success": false, "error": { "code": "...", "message": "...", "details": [...] } }
```

## 7. Test Süreci

Beş zorunlu ucun tamamı Postman üzerinde test edilmiş, ekran görüntüleri
alınmıştır. Ayrıca hata durumları (404, 400) da ayrı isteklerle
doğrulanmıştır.

Hazır koleksiyon: `postman/TaskFlow_API.postman_collection.json`

## 8. Sonuç

Yönergede istenen dört aşama da tamamlanmıştır:

| Aşama | Çıktı |
|---|---|
| 1 — Analiz ve tasarım | Bu doküman · veri modeli · uç listesi |
| 2 — Backend altyapısı | Çalışan Express projesi · routing yapısı |
| 3 — CRUD + middleware | Beş uç · logger middleware |
| 4 — Test ve teslim | Postman testleri · kurulum notu · ekran görüntüleri |
