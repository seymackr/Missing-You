# Missing You — Herkese Açık Mesaj Günlüğü

GitHub Pages + Firebase Firestore ile çalışan, her günü ayrı bir telefon sohbet ekranı gibi gösteren, **giriş yapmadan herkesin okuyup yazabildiği** mesaj günlüğü.

## Şu anki yapı

- Firebase projesi: `missing-truly` (web yapılandırması `firebase-config.js` dosyasında tanımlı).
- GitHub deposu: `seymackr/Missing-You`.
- Hesap veya giriş ekranı **yok**.
- Her günün kendi mesajları vardır; mesajlar saat bilgisiyle birlikte anlık görüntülenir.
- Gönderilen mesajlar tarayıcıda değil, Firestore veritabanında kalır.
- Uygulama arayüzünden mesaj silinemez veya düzenlenemez. Proje yöneticisi gerekirse Firebase Console'dan manuel olarak silebilir.
- Mesajlar en fazla 1000 karakter; arayüzde gönderim sonrası 4 saniyelik basit bir bekleme vardır. **Bu bekleme gerçek bir sunucu tarafı hız sınırı değildir.**

## ZORUNLU ADIM: Firestore Rules yayınla

Firebase Console → `missing-truly` projesi → **Firestore Database → Rules** sekmesini aç. `firestore.rules` dosyasının **tüm içeriğini** oraya yapıştır, ardından **Publish** düğmesine bas.

> ⚠️ **Bu sitenin tüm mesajları herkese açıktır ve herkes anonim olarak yeni mesaj yazabilir.** Kötü niyetli kişiler de mesaj gönderebilir, spam yapabilir ve Firestore kotanızı tüketebilir. Güçlü spam koruması, istismar önleme, şikâyet/silme paneli ve maliyet koruması için ek sunucu tarafı önlemler gerekir. Kişisel/gizli bilgiler paylaşmayın. Firebase App Check ek koruma sağlayabilir, ancak tamamen spam önleyici değildir.

Kurallar sadece `days/{YYYY-MM-DD}` altındaki sınırlı veri şemasına izin verir, anonim mesaj oluşturulmasına izin verir; **mesaj değiştirme/silme** işlemlerini reddeder. Site giriş istemez; Firebase Authentication kurulumu gerekmez.

## GitHub Pages yayını

1. GitHub'da **`seymackr/Missing-You`** deposunu aç.
2. **Settings → Pages → Build and deployment** altında **Deploy from a branch**, **main**, **/(root)** seç.
3. Yayın etkinleşince beklenen adres: `https://seymackr.github.io/Missing-You/`.

Bu adresin gerçekten açılması için Pages'in etkinleşmiş ve dağıtımın başarılı olmuş olması gerekir.

## Kullanım

1. Herhangi bir cihazdan siteye gir.
2. Takvimden bir gün seç, ortadaki veya yan telefonun altındaki mesaj kutusuna yaz.
3. **Gönder**'e bas; mesaj Firestore'a kaydedilir ve diğer ziyaretçiler de gerçek zamanlı görür.
4. Mesajlar tarihler arasında ayrı tutulur. Arama bölümünden geçmiş mesajlarda kelime arayabilirsin.

**Not:** Herkesin mesaj göndermesini istiyorsan güvenlik kuralları Firebase Console'da yayınlanmalıdır. Sadece GitHub'a kod yüklemek Firebase kurallarını değiştirmez. Firestore'a ilk gerçek mesajı göndermeden çalıştığı kesinleşmez.