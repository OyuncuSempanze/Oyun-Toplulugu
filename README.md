# Oyun Alanı

Oyunlar hakkında kullanıcı katkılarını, yorumları ve faydalı bulma oylarını bir araya getirmek için hazırlanan ayrı bir topluluk uygulaması prototipi.

Bu depo, **Oyun-Rehberi'nin yerine geçmez**. Oyun-Rehberi kaynaklı ve düzenli arşiv olarak kalır. Bu uygulama ise topluluk katılımını denemek için ayrı geliştirilir. İleride doğrulanmış katkılar Oyun-Rehberi'ne aktarılabilir fakat başlangıçta iki proje birbirinden bağımsızdır.

## Şu an neler çalışıyor?

- Mobil uyumlu rehber listesi
- Örnek içerikler üzerinde arama, oyun filtresi ve sıralama
- Rehber ayrıntısı ve örnek yorumları görüntüleme
- Geçerli oturumda artı ve eksi oy kullanma
- İnceleme bekleyen yeni rehber taslağı ekleme
- Rehber ayrıntısına yorum taslağı ekleme
- İncelendi, inceleme bekliyor ve deneyimli katkıcı işaretlerini birbirinden ayırma

## Henüz neler yok?

Bu sürüm statik bir ön yüz prototipidir. Gerçek hesap açma, kimlik doğrulama, kalıcı veritabanı, kullanıcıların cihazları arasında veri eşitleme, moderasyon paneli, kötüye kullanım bildirimi ve özel bildirimler yoktur. Gönderiler, yorumlar ve oylar sayfa belleğinde tutulur ve sayfa yenilenince silinir. Kullanılan örnek içerikler de temsili veridir.

Hakaret kontrolü henüz eklenmedi. Bunun için özel kelime listesi ve yanlış pozitifleri ele alacak bir inceleme akışı belirlenmeden otomatik karar verilmemelidir. İstenen yaklaşım, otomatik silme değil, özel moderasyon uyarısı ve insan kararıdır.

## Dosyalar

- `index.html` sayfanın semantik iskeleti
- `styles.css` görünüm ve mobil düzen
- `src/js/sample-data.js` örnek rehberler
- `src/js/mock-store.js` geçici bellek deposu
- `src/js/app.js` sayfa etkileşimleri
- `docs/ARCHITECTURE.md` taşıma ve arka uç planı
- `tests/prototype.test.js` geçici veri deposu için temel testler
- `.github/workflows/ci.yml` değişikliklerde otomatik sözdizimi ve test kontrolü
- `docs/ROADMAP.md` önerilen geliştirme sırası

## Kontrolü çalıştırma

Bilgisayarda Node.js 22 veya uyumlu daha yeni bir sürüm kuruluysa depo klasöründe `npm test` komutu temel kontrolleri çalıştırır. Harici paket kurulumu gerekmez.

## GitHub Pages üzerinde önizleme

Bu depo kök dizininde `index.html` bulunduğu için GitHub Pages ayarlarında `main` dalının kök klasörü seçilerek statik önizleme yayımlanabilir. Bu yalnızca arayüzü yayımlar. Gerçek topluluk özelliklerini kendiliğinden çalışır hâle getirmez.

## Lisans

Bu depo için lisans henüz seçilmedi. Oyun-Rehberi'nin lisansı bu projeye otomatik olarak uygulanmış değildir. Depoyu yayımlamadan önce uygulama kodunun ve içeriklerin nasıl lisanslanacağına ayrıca karar verilmelidir.

## Teknik yaklaşım

Arayüz depolama katmanından ayrılmıştır. Şimdiki `mockStore`, ileride gerçek API ile değiştirilecek bir deneme katmanıdır. Arayüzün her yerde çalışabilmesi için sağlayıcıya özgü veritabanı kodunu bileşenlerin içine dağıtmamak gerekir.

Gerçek kullanıcı verisi bağlanmadan önce yaş ve kullanım koşulları, ücretsiz kullanım sınırları, erişim kuralları, kimlik doğrulama, spam ve kötüye kullanım önlemleri değerlendirilmelidir.
