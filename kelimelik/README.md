# 📖 Kelimelik - Akıllı Kelime Öğrenme & Alışkanlık Takibi

<div align="center">

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Status: Production](https://img.shields.io/badge/Status-Production%20Ready-success.svg)
![Platform: PWA](https://img.shields.io/badge/Platform-PWA%20%7C%20Offline%20First-indigo.svg)
![Vocabulary: Oxford 3200+](https://img.shields.io/badge/Vocabulary-Oxford%203%2C201%20Words-emerald.svg)
![Architecture: Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20Runtime%20Deps-purple.svg)

**Modern, çevrimdışı çalışabilen (PWA), bilimsel Aralıklı Tekrar (SRS) algoritmalı, çalışma müzikli ve "Zinciri Kırma" motivasyonlu akıllı kelime asistanı.**

[🚀 Canlı Önizleme](#-hızlı-kurulum--canlı-kullanım) •
[✨ Özellikler](#-öne-çıkan-özellikler) •
[🎵 Çalışma Müzikleri](#-yerleşik-çalışma-müziği-sentezleyicisi) •
[⌨️ Kısayollar](#️-klavye-kısayolları) •
[📦 GitHub Pages](#-github-pages-ile-anında-yayınlama)

</div>

---

## 🌟 Projeye Genel Bakış

**Kelimelik**, İngilizce ve çoklu dil öğreniminde ezber yerine kalıcı hafıza tekniklerini (Spaced Repetition System / Leitner Kutuları) temel alan modern bir web uygulamasıdır. 

Harici hiçbir sunucuya veya kütüphaneye bağımlı kalmadan, tarayıcınızın yerel depolama ve ses sentezleme güçlerini kullanarak **%100 çevrimdışı** çalışır.

---

## ✨ Öne Çıkan Özellikler

### 📚 1. 3.201 Kelimelik Kapsamlı Oxford A1-C2 Veritabanı
İngilizce öğreniminde küresel standart kabul edilen Oxford 3000 & 5000 külliyatı CEFR standartlarına göre dengeli şekilde entegre edilmiştir:
- 🟢 **A1 (Başlangıç)**: 801 kelime
- 🟢 **A2 (Temel)**: 727 kelime
- 🔵 **B1 (Orta Seviye)**: 649 kelime
- 🟣 **B2 (Orta-İleri)**: 772 kelime
- 🟡 **C1 (İleri Seviye)**: 180 kelime
- 🔴 **C2 (Uzman / Usta)**: 72 kelime
- *Her kelime; IPA fonetik telaffuzu, kelime türü, seviye rozeti, örnek cümle, Türkçe çeviri ve özel not alanı ile gelir.*

### 🧠 2. Bilimsel Aralıklı Tekrar (SRS / Spaced Repetition)
- Ebbinghaus unutma eğrisine karşı 5 aşamalı Leitner algoritması.
- Kelimeleri tam unutulmak üzereyken (1. gün, 3. gün, 7. gün, 14. gün, 30. gün) karşınıza çıkarır.
- Kart değerlendirmesi: **Zor (1 Gün)** | **İyi (3 Gün)** | **Kolay (7 Gün)**.

### 🎯 3. Özelleştirilebilir Çalışma Planı Seçici (Study Launcher)
Tek bir tıkla çalışma oturumunuzu baştan sona yapılandırın:
- **Hedef Seviye**: `Tümü` veya doğrudan `A1`, `A2`, `B1`, `B2`, `C1`, `C2`.
- **Kelime Sayısı**: `5`, `10`, `20` veya `50` kelimelik seanslar.
- **Çalışma Modları**:
  - 🃏 **3D Kart Çevirme (Flashcards)**: Zihinsel hatırlama ve sesli telaffuz.
  - ✍️ **Cümle İçi Boşluk Doldurma**: Bağlamsal öğrenme. Kelimenin çekimli (`realized`) ve yalın (`realize`) hallerini akıllıca tanıyan toleranslı kontrol motoru.
  - 🎯 **4 Şıklı Çoktan Seçmeli Quiz**: Anlık pekiştirme ve hız testi.

### 🔥 4. Zinciri Kırma (Don't Break the Chain) & Gelişim Grafiği
- Günlük kelime hedefinizi tamamlayarak serinizi koruyun.
- Açılış panelinde son 7 günlük çalışma çubuk grafiği ve güncel/en iyi seri rekorunuzu canlı takip edin.

### 🎨 5. 4 Seçkin Renk Teması (Glassmorphism UI)
- 🌌 **Gece Mavisi (Midnight Indigo)**: Karanlık modda göz dinlendirici derin lacivert.
- 🌲 **Zümrüt Ormanı (Emerald)**: Doğal ve odaklayıcı koyu yeşil tonları.
- 🔮 **Siber Menekşe (Cyber Violet)**: Canlı ve modern neon mor atmosferi.
- 📄 **Minimal Kağıt (Light Mode)**: Gün ışığında çalışanlar için aydınlık kitap sayfası estetiği.

### 🌟 6. Günün Kelimesi & Kutlama Konfetisi
- **Günün Kelimesi**: Her gün ana ekranda takvime göre otomatik güncellenen özel vitrin kartı.
- **Canvas Fireworks**: Günlük hedefinize ulaştığınızda veya testleri tamamladığınızda ekranda patlayan dinamik konfeti efekti.

---

## 🎵 Yerleşik Çalışma Müziği Sentezleyicisi

Çalışırken odaklanmayı en üst düzeye çıkarmak için sıfır ses dosyası yüküyle doğrudan **Web Audio API** ile çalışan ambient çalar:
- **🎹 Klasik Piyano Ambiyansı**: Rahatlatıcı, harmonik Cmaj7 – Fmaj7 akor döngüleri.
- **🌧️ Doğal Yağmur Sesi**: Organik frekans filtreli yağmur jeneratörü.
- **🧠 10Hz Alfa Dalgaları**: Beynin odaklanma frekansını uyaran çift kulaklı vuruşlar (Binaural Beats).
- **☕ Lo-Fi Çalışma Dronu**: Sıcak, düşük frekanslı analog çalışma atmosferi.

---

## ⌨️ Klavye Kısayolları

Kart çalışma modunda farenizi kullanmadan ultra hızlı tekrar yapabilirsiniz:

| Tuş | Eylem |
| :---: | :--- |
| <kbd>Boşluk (Space)</kbd> | Kartı Ön / Arka Çevir |
| <kbd>1</kbd> | **Zor** Olarak İşaretle (1 gün sonra) |
| <kbd>2</kbd> | **İyi** Olarak İşaretle (3 gün sonra) |
| <kbd>3</kbd> | **Kolay** Olarak İşaretle (7 gün sonra) |
| <kbd>S</kbd> | Kelimeyi İngilizce Sesli Oku (TTS) |
| <kbd>Esc</kbd> | Açık olan herhangi bir pencereyi kapat |

---

## 📂 Proje Dizin Yapısı

```text
kelimelik/
├── .github/
│   └── workflows/
│       └── deploy.yml      # Otomatik GitHub Pages dağıtım iş akışı
├── .gitignore              # Git tarafından yok sayılacak dosyalar
├── index.html              # Uygulama ana arayüzü ve modalleri
├── style.css               # Cam tasarımı (glassmorphism), temalar ve animasyonlar
├── app.js                  # SRS algoritması, ses motoru, tema yöneticisi ve durum
├── data.js                 # 3.201 kelimelik Oxford A1-C2 veritabanı
├── manifest.json           # PWA (Progressive Web App) manifest dosyası
├── sw.js                   # Çevrimdışı önbellekleme Service Worker'ı
├── start.bat               # Windows için tek tıkla başlatıcı
├── LICENSE                 # MIT Açık Kaynak Lisansı
├── CONTRIBUTING.md         # Katkıda bulunma rehberi
└── README.md               # Proje tanıtım ve kullanım kılavuzu
```

---

## 🚀 Hızlı Kurulum & Canlı Kullanım

### Yerel Olarak Çalıştırma
Projeyi klonlayın veya zip olarak indirin, ardından `index.html` dosyasını herhangi bir modern tarayıcıda açın:
```bash
git clone https://github.com/KULLANICI_ADINIZ/kelimelik.git
cd kelimelik
# index.html dosyasını doğrudan tarayıcınızda açabilirsiniz!
```

---

## 🌐 GitHub Pages ile Anında Yayınlama

Bu repo, içinde hazır bir GitHub Actions yapılandırması barındırır:
1. Projeyi GitHub'a yükledikten sonra deponuzun **Settings** > **Pages** menüsüne gidin.
2. **Build and deployment > Source** kısmını **GitHub Actions** olarak seçin.
3. Uygulamanız birkaç saniye içinde `https://kullanici-adiniz.github.io/kelimelik` adresinde ücretsiz ve canlı olarak yayına girecektir!

---

## 📜 Lisans

Bu proje [MIT Lisansı](LICENSE) kapsamında açık kaynak olarak sunulmaktadır.
Dilediğiniz gibi kullanabilir, özelleştirebilir ve katkıda bulunabilirsiniz.
