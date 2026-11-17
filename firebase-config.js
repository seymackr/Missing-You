// Firebase Console > Proje ayarları > Uygulamalarınız > Web uygulaması
// içindeki firebaseConfig değerlerini BURAYA yapıştırın.
// Bu bilgiler web uygulamalarında herkese açıktır; GÜVENLİĞİ Firestore kuralları sağlar.
export const firebaseConfig = {
  apiKey: "FIREBASE_API_KEY_BURAYA",
  authDomain: "PROJE_ID.firebaseapp.com",
  projectId: "PROJE_ID_BURAYA",
  storageBucket: "PROJE_ID.firebasestorage.app",
  messagingSenderId: "MESAJLASMA_ID_BURAYA",
  appId: "APP_ID_BURAYA"
};

// Firebase Console > Authentication > Users > kendi hesabınızın User UID alanı.
// Aynı UID'yi firestore.rules dosyasına da yazmanız gerekir.
export const OWNER_UID = "YAZAR_UID_BURAYA";
