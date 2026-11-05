# Kelimelik Projesine Katkıda Bulunma Rehberi (Contributing Guide)

Kelimelik projesine ilgi gösterdiğiniz ve katkıda bulunmak istediğiniz için teşekkür ederiz! 🎉

Bu proje, açık kaynak topluluğunun desteğiyle büyüyen, reklamsız, çevrimdışı çalışabilen ve bilimsel öğrenme metodolojilerine (SRS) dayalı çok dilli bir kelime öğrenme uygulamasıdır.

---

## 🛠️ Nasıl Katkıda Bulunabilirsiniz?

1. **Yeni Kelimeler & Diller Eklemek**:
   - `data.js` dosyasına A1-C2 seviyelerine uygun yeni kelimeler, örnek cümleler ve çeviriler ekleyebilirsiniz.
   - Gelecek diller (Almanca, İspanyolca, Fransızca) için kelime listeleri hazırlayabilirsiniz.
2. **Hata Bildirimi (Bug Reports)**:
   - Karşılaştığınız hataları detaylı adımlarla birlikte GitHub Issues üzerinden bildirebilirsiniz.
3. **Yeni Özellikler & UI/UX İyileştirmeleri**:
   - Yeni temalar, alıştırma modları veya erişilebilirlik geliştirmeleri için Pull Request açabilirsiniz.

---

## 📋 Geliştirme Adımları

1. Projeyi Fork'layın (`Fork` butonuna tıklayın).
2. Özellik dalınızı oluşturun:
   ```bash
   git checkout -b feature/yeni-ozellik
   ```
3. Değişikliklerinizi yapın ve anlamlı bir commit mesajı ile kaydedin:
   ```bash
   git commit -m "feat: Almanca kelime paketi eklendi"
   ```
4. Dalınızı uzak depoya gönderin:
   ```bash
   git push origin feature/yeni-ozellik
   ```
5. GitHub üzerinden bir **Pull Request (PR)** açın.

---

## 📜 Kod Standartları

- Sıfır dış bağımlılık (Vanilla JS + Modern Web API'leri) felsefesini koruyun.
- Kodlar temiz, okunabilir ve Türkçe/İngilizce dokümante edilmiş olmalıdır.
- Çevrimdışı PWA çalışma prensibine sadık kalın.

Katkılarınız için şimdiden çok teşekkürler!
