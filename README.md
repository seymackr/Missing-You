# Günlük — mesaj ekranı tasarımlı kişisel web sitesi

Kahve, zeytin yeşili ve mor tonlarında, **her günü ayrı bir telefon sohbeti** gibi gösteren dijital günlük. Web sitesi GitHub Pages üzerinde yayınlanır; mesajlar **Firebase Cloud Firestore** veritabanında tutulur. Bu yüzden aynı mesajlar bilgisayarda, telefonda ve tüm ziyaretçilerin ekranında görünür.

## Özellikler

- Ortada seçili gün, sağda ertesi gün, solda önceki gün olmak üzere üç telefon görünümü.
- Gün ve ay değiştirici, takvimden tarih seçimi, önceki / sonraki gün geçişleri.
- Mesaj yazma, saat bilgisi ve mesaj silme.
- **Herkese açık okuma**: Siteyi ziyaret eden herkes bütün mesajları görebilir.
- **Sadece tek yazar**: Mesaj ekleme ve silme yetkisi yalnızca Firebase Authentication'da oluşturacağınız ve UID'sini kurallara yazacağınız hesaptadır.
- Tüm ziyaretçiler için **gerçek zamanlı güncelleme**.
- Mesaj içeriğinde arama.
- Telefon, tablet ve bilgisayar için uyumlu görünüm.
- Kullanıcının tarayıcısında mesaj saklanmaz. Oturum bilgisi Firebase Authentication tarafından tarayıcıda tutulabilir.

> **ÖNEMLİ — GİZLİLİK:** Buraya yazdığınız günlük mesajları **HERKESE AÇIKTIR**. Site bağlantısını bilen ya da Firestore veritabanınıza erişen kişiler okuyabilir. Gizli/özel notları bu sürüme yazmayın. Mesajları saklamak için GitHub tek başına yeterli değildir; Firebase kurulumu şarttır.

## 1. Firebase projesi açın

1. [Firebase Console](https://console.firebase.google.com/) adresine gidip Google hesabınızla giriş yapın.
2. **Add project / Proje ekle** ile yeni proje oluşturun. Örnek ad: `benim-gunlugum`.
3. Proje açıldıktan sonra ana sayfadaki **Web** simgesine (`</>`) tıklayıp bir web uygulaması ekleyin.
4. Uygulama kaydı tamamlanınca ekranda aşağıdakine benzeyen `firebaseConfig` bilgileri görünecek:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "....firebaseapp.com",
  projectId: "...",
  storageBucket: "....firebasestorage.app",
  messagingSenderId: "...",
  appId: "..."
};
```

5. Projedeki **`firebase-config.js`** dosyasını açın. Ekrandaki değerleri mevcut örnek değerlerin yerine yazın. Bunlar web uygulaması bağlantı bilgileridir; tek başına yazma izni vermez. Yazma güvenliğini aşağıdaki Firestore kuralları sağlar.

## 2. Herkesin okuyacağı Firestore veritabanını kurun

1. Firebase Console sol menüden **Build → Firestore Database → Create database** seçin.
2. Başlangıçta **Production mode / Üretim modu** seçin. Bölgeyi seçip veritabanını oluşturun.
3. Birazdan **Rules / Kurallar** sekmesine döneceğiz. Kullanıcı hesabını oluşturmadan herkese yazma yetkisi tanımayın.

## 3. Sadece sizin yazabileceğiniz kullanıcıyı oluşturun

1. **Build → Authentication → Get started** bölümüne gidin.
2. **Sign-in method / Oturum açma yöntemi** bölümünde **Email/Password** yöntemini etkinleştirin (e-posta bağlantısı zorunlu değil).
3. **Users / Kullanıcılar → Add user / Kullanıcı ekle** bölümünden yalnızca kendi hesabınız için bir e-posta ve güçlü şifre oluşturun.
4. Kullanıcılar listesinde oluşturduğunuz hesabın **User UID** değerini kopyalayın. UID e-postanız değildir, ayrı bir kimliktir.
5. `firebase-config.js` içindeki `OWNER_UID = "YAZAR_UID_BURAYA"` değerini gerçek UID'nizle değiştirin.
6. **`firestore.rules`** içindeki `'YAZAR_UID_BURAYA'` metnini **aynı UID** ile değiştirin.
7. Firestore Database → **Rules / Kurallar** bölümüne gidip `firestore.rules` dosyasının içeriğini yapıştırın; **Publish / Yayınla**'ya tıklayın.
8. Authentication → Settings → **Authorized domains / Yetkili alan adları** bölümüne gerekiyorsa GitHub Pages alan adınızı ekleyin: `kullaniciadiniz.github.io` (başına `https://` koymadan).

**Güvenlik kontrolü:** Kurallar `allow read: if true` ile herkesin okumasına izin verir. Yazma için yalnızca oturum açmış ve UID'si belirlediğiniz hesap olan kullanıcıyı kabul eder. **Asla** `allow write: if true` yapmayın.

## 4. GitHub Pages'e yükleyin

1. [GitHub](https://github.com/) hesabınıza giriş yapın ve **New repository / Yeni depo** açın. Örnek: `gunlugum`.
2. Depoya bu ZIP paketinin içindeki tüm dosyaları **kök dizine** yükleyin: `index.html`, `styles.css`, `app.js`, `firebase-config.js`, `firestore.rules`, `README.md`, `assets/` ve `.nojekyll`.
3. Değişiklikleri kaydedin (**Commit changes**).
4. Depoda **Settings → Pages → Build and deployment** bölümüne gidin.
5. **Source: Deploy from a branch**, **Branch: main**, klasör olarak **/(root)** seçip **Save**'e basın.
6. GitHub Pages bağlantısı genellikle şöyle olur:

   `https://KULLANICIADINIZ.github.io/gunlugum/`

7. Site açılınca alt bölümdeki kilit simgesine ya da bilgisayarda sol menüdeki **Yazar girişi** düğmesine basarak e-posta/şifre ile giriş yapın. Girişten sonra mesaj kutuları aktif olacaktır.

> Projeyi ilk kez Firebase yapılandırması olmadan açarsanız **Önizleme modu** görürsünüz. Ekrandaki örnek mesajlar gerçek veritabanı verisi değildir. Firebase kurulumu tamamlanınca örnekler kalkar ve gerçek günlük başlar.

## 5. Nasıl kullanılır?

- Bir gün seçin; ortadaki telefonda o tarihin mesajlarını göreceksiniz.
- Yazar girişi yapın, alttaki kutuya yazın, **gönder** düğmesine basın veya `Enter`'a basın. Alt satır için `Shift + Enter` kullanın.
- Mesaj kaydedildiği anda internete bağlı diğer ziyaretçiler de onu aynı gün içinde görür.
- Yanlış yazdığınız mesajı, giriş yaptıysanız yanındaki çöp kutusu simgesinden silebilirsiniz.
- **Arama** bölümünden daha önce yazdığınız mesajlarda kelime arayabilirsiniz.
- Mobilde kilit simgesi ekranın üstündeki menüde bulunur.

## Dosya yapısı

```text
mesaj-gunlugu-github/
├── index.html          # Sayfanın yapısı
├── styles.css          # Kahve, yeşil ve mor tasarım
├── app.js              # Takvim, mesajlar, giriş ve arama
├── firebase-config.js  # Sizin Firebase proje bilgileriniz
├── firestore.rules     # Okuma/yazma güvenlik kuralları
├── assets/
│   └── favicon.svg
├── .nojekyll
└── README.md
```

## Sorun giderme

| Belirti | Ne kontrol edilmeli? |
|---|---|
| Ekranda "Önizleme modu" yazıyor | `firebase-config.js` ve `OWNER_UID` yer tutucuları doldurulmadı. |
| Giriş yapılıyor ama mesaj yazılamıyor | Firebase Authentication **User UID**, `firebase-config.js` ve `firestore.rules` dosyasında birebir aynı mı? Kuralları **Publish** ettiniz mi? |
| Ziyaretçiler mesajları göremiyor | Firestore oluşturuldu mu, doğru Firebase projesine bağlandı mı? `allow read: if true` kuralı yayınlandı mı? |
| `Missing or insufficient permissions` | Firestore kurallarında UID uyuşmuyor veya kurallar yayınlanmamış. |
| Site 404 veriyor | GitHub Pages dağıtımını `main` ve `/(root)` için etkinleştirdiniz mi? |
| Mesajlar iki cihazda farklı | İki cihazda **aynı GitHub Pages adresini** ve **aynı Firebase projesini** kullanın. |

## Teknik notlar

- Sunucu kurmanız veya ücretli hosting satın almanız gerekmez; GitHub Pages yalnızca sitenin dosyalarını sunar, Firebase mesajları saklar.
- Firebase/Firestore ücretsiz başlangıç kotası sunabilir, ancak hizmetlerin güncel kota ve ücret koşullarını Firebase Console'dan kontrol edin. Kullanım artarsa limitler geçerli olabilir.
- CDN'den yüklenen Firebase Web SDK sürümü: `13.3.0`. Dosyalar `type="module"` ile çalışır; `file://` üzerinden açmak yerine GitHub Pages veya yerel HTTP sunucusu kullanın.
- Bu projede mesaj silme geri alınamaz. Kritik verilerin düzenli yedeğini Firebase/Firestore üzerinden almayı düşünün.

Resmî kaynaklar: [Firebase Web Kurulumu](https://firebase.google.com/docs/web/setup) · [Firebase CDN kurulumu](https://firebase.google.com/docs/web/alt-setup) · [Firestore Güvenlik Kuralları](https://firebase.google.com/docs/firestore/security/rules-conditions) · [GitHub Pages](https://docs.github.com/en/pages/quickstart)
