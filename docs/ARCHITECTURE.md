# Teknik yapı ve taşınabilirlik

## Şimdiki yapı

Uygulama tarayıcıda çalışan statik HTML, CSS ve JavaScript dosyalarından oluşur. `app.js` ekran davranışlarını yönetir. `mock-store.js` rehberleri ve oturum içi değişiklikleri sağlayan küçük bir arayüz sunar. Örnek içerikler `sample-data.js` dosyasında durur.

Bu ayrım, arayüzün doğrudan Firestore, D1 veya belirli bir barındırma hizmetine bağlanmasını önlemek için ilk adımdır. Şimdiki depo gerçek bir API uygulaması değildir ve istemci tarafındaki kontroller güvenlik sınırı sayılmaz.

## Gerçek arka uç eklenince

Önerilen arayüz sözleşmesi şu işlemler etrafında tutulabilir:

- `listGuides(filters)` rehberleri getirir
- `getGuide(id)` tek bir rehberin ayrıntısını getirir
- `submitGuide(input)` yeni gönderi oluşturur ve başlangıçta inceleme bekliyor durumunu atar
- `updateGuide(id, input)` gönderiyi günceller ve önceki inceleme işaretini kaldırır
- `vote(guideId, direction)` kullanıcının tek oyunu kaydeder
- `listComments(guideId)` yorumları getirir
- `addComment(guideId, body)` yorum oluşturur
- `reportContent(target, reason)` moderasyon bildirimi oluşturur

Bu isimler kavramsal bir plandır, henüz uygulanmış API uç noktaları değildir.

## Veri modeli için ilk taslak

### User

- `id`
- `displayName`
- `createdAt`
- `contributorLevel`
- `moderationStatus`

### Guide

- `id`
- `authorId`
- `gameId` veya `gameName`
- `title`
- `body`
- `sources[]`
- `status` (`pending`, `approved`, `rejected`)
- `reviewedBy`
- `reviewedAt`
- `createdAt`
- `updatedAt`

### Vote

- `id`
- `guideId`
- `userId`
- `value` (`1` veya `-1`)
- `updatedAt`

Veritabanı düzeyinde bir kullanıcı ile rehber arasında tek oy ilişkisi uygulanmalıdır. Tarayıcı tarafında butonları gizlemek güvenlik için yeterli değildir.

### Comment

- `id`
- `guideId`
- `authorId`
- `body`
- `status`
- `createdAt`
- `updatedAt`

### ReviewEvent

- `id`
- `guideId`
- `moderatorId`
- `action`
- `reason`
- `createdAt`

İnceleme geçmişi tutulursa bir içeriğin neden onaylandığı veya geri alındığı sonradan anlaşılabilir. Rehberde anlamlı herhangi bir değişiklik olduğunda onay işareti sunucu tarafında kaldırılmalıdır.

## Taşıma ilkeleri

1. Arayüzün sağlayıcıya özgü SDK'ları doğrudan çağırmasını önle.
2. Veritabanı ve kimlik doğrulama işlemlerini tek bir servis katmanında tut.
3. Kaynak kodu, örnek verileri ve kullanıcı verilerini ayrı tut.
4. Düzenli dışa aktarım ve yedekleme yolu belirle.
5. Ortam değişkenlerini ve gizli anahtarları Git'e koyma.
6. Yetkileri istemciye güvenerek değil, sunucu veya veritabanı güvenlik kurallarıyla doğrula.
7. Platform taşırken sadece barındırma değil, kimlik doğrulama, veritabanı, bildirimler ve kuralları da ayrı ayrı değerlendir.

## Gizlilik ve güvenlik notu

Bu prototipe gerçek kişisel bilgi eklenmemelidir. Gerçek sisteme geçmeden önce kullanılacak hizmetlerin yaş ve hesap şartları, veri saklama politikası ve ücretsiz kullanım sınırları teyit edilmelidir.
