# 🦅 FuryunaBot - Gelişmiş Sunucu Yönetim Botu

**FuryunaBot**, Discord sunucunuzu profesyonelce yönetmeniz için geliştirilmiş; **Kayıt, Seviye, Ekonomi, Moderasyon ve Etkinlik** sistemlerini tek çatı altında toplayan kapsamlı bir bottur.

Son güncelleme ile birlikte tamamen modernize edilmiş, güvenli ve performans odaklı hale getirilmiştir.

---

## 🌟 Öne Çıkan Özellikler

### 🛡️ 1. Kayıt ve Güvenlik Sistemi
Sunucuya giren kullanıcıları güvenli bir şekilde karşılayın ve yönetin.
*   **Çift Aşamalı Yetki:** Kullanıcıları "Doğrulanmış Üye" ve "Yeni Üye" olarak ayırır.
*   **Akıllı Yetki Kontrolü (YENİ):** Kayıt komutlarını kullanmak için **"Rolleri Yönet"** gibi tehlikeli izinlere gerek yok! Sadece **"Üyeleri Engelle"** (Ban Members) yetkisi olan herkes güvenle kayıt yapabilir.
*   **Güvenlik Modülü (Anti-Link):** "Yeni Üye" rolündeki (henüz güvenilmeyen) kullanıcıların Link veya Dosya paylaşmasını engeller.
*   **Otomatik Kontrol:** Zaten kayıtlı veya doğrulanmış kullanıcıları bot algılar, mükerrer işlemi önler.
*   **Hoş Geldin Karşılaması:** Sunucuya yeni katılanları, şık ve **randomize edilmiş** (5 farklı varyasyon) mesajlarla karşılar.
*   **Esnek Komutlar:**
    *   `/slash` komutları (Modern)
    *   `!prefix` komutları (Klasik)
    *   **Sağ Tık Menüsü (Apps):** Bir üyeye sağ tıklayıp anında "Hızlı Kayıt Et" diyebilirsiniz.

### 🏆 2. Gelişmiş Level & Rütbe Sistemi
Sunucu aktifliğini ödüllendiren dinamik bir sistem.
*   **Adil XP Kazanımı:** Mesaj başına rastgele (5-15) XP. Spam koruması (2 saniye) ile haksız kazanç engellenir.
*   **🎙️ Ses Aktifliği:** Ses kanallarında geçirilen her dakika için hem **XP** (Level için) hem de **Aktiflik Puanı** (Rol için) kazanılır.
*   **Dinamik Rütbe (Rank) Sistemi:** Sadece level atlamak yetmez! Aktifliğinize göre **Bronz, Gümüş, Altın, Platin, Elmas** rütbeleri otomatik verilir.
*   **Aktiflik Çürümesi (Decay):** Kullanıcı aktif olmazsa, her gün gece 00:00'da puanlarının **%5'i silinir**. Böylece rütbeler her zaman hak edenlerde kalır.
*   **Boost Bonusu:** Sunucuya Boost basan üyeler **2 KAT** daha fazla para ve ödül kazanır.
*   **Görsel Profil:** `/profil` komutu ile level, rütbe, ve yüzdelik ilerleme durumunuzu estetik bir kartta görün.

### 🎨 3. Görsel Karşılama (Image Welcome) - YENİ!
Sunucuya katılan ve ayrılan üyeler için **tamamen özelleştirilebilir** görsel kartlar oluşturur.
*   **Glassmorphism Tasarım:** Arka plan ne olursa olsun şık duran "Buzlu Cam" paneli.
*   **Detaylı Bilgi:** Kullanıcının profil resmi, **takma adı (Display Name)** ve motive edici mesajlar içerir.
*   **Performans:** `Canvas` teknolojisi ile anlık oluşturulur, diskte yer kaplamaz.

### 🆙 4. Gelişmiş Bump & Hatırlatma Sistemi
Disboard veya benzeri botlarla sunucuyu öne çıkardığınızda devreye girer.
*   **Otomatik Algılama:** "Bump başarılı" mesajını gördüğü an 2 saatlik sayacı başlatır.
*   **Kanal Adı Yönetimi (YENİ):** Kanal ismini duruma göre değiştirir:
    *   🟢 **Hazır:** `「🤖」bot-komut-🟢`
    *   ⏳ **Beklemede:** `「🤖」bot-komut-⏳`
*   **Ödül Sistemi:** Bump atan kişiye anında **Coin, XP ve Aktiflik Puanı** verir.
*   **Akıllı Hatırlatma:** Süre dolduğunda son bump atanı etiketler (veya isteğe göre etiketlemez). Bot yeniden başlatılsa bile süreyi hatırlar ve çift bildirim yapmaz.

### 🎭 5. Chat Revival (Sohbet Canlandırma) Sistemi
Sohbet durduğunda (30 dakika sessizlik), bot otomatik olarak devreye girer ve ortamı şenlendirir.
*   **Sıralı Mod:** Sırasıyla **Quiz -> Matematik -> Kelime Düşürme (Drop)** etkinlikleri yapar.
*   **Kelime Düşürme (Drop):** "Cümleyi ilk yazan kazanır" etkinliği.
*   **Dinamik Ödüller:** Kazananlar rastgele aralıklarla **Coin** ve **XP** kazanır.
*   **Akıllı Süre:** Bir etkinlik başladığında, kimse cevap vermese bile **5 DAKİKA** boyunca aktif kalır.

### ☀️ 6. Otomatik Mesajlar
*   **Günaydın Sistemi:** Her sabah **07:58 - 08:50** arasında rastgele bir saatte "Günaydın" mesajı atar.
*   **Hayırlı Cumalar:** Her Cuma **11:30 - 13:30** arasında Cuma mesajı atar.
*   **Akıllı Telafi:** Bot kapalıyken saati kaçırırsa, açıldığı an otomatik olarak atar (Günde 1 kereden fazla atmaz).

### 🧹 7. Gece Temizliği & Ghost Busting
*   **Veritabanı Senkronizasyonu:** Her gece **04:00'te** otomatik çalışır.
*   **Ghost-Busting:** Sunucudan çıkmış veya banlanmış kullanıcıları veritabanından kalıcı olarak siler.
*   **Aktiflik Çürümesi (Decay):** Kullanıcı aktif olmazsa, her gece puanlarının **%11'i silinir**. (Eski: %5). Bu sayede rütbeler daha rekabetçi hale gelir.
*   **Manuel Tetikleme:** `/level-yonet senkronize-et` komutuyla istediğiniz an temizlik yapabilirsiniz.

---

## 🛠️ Komut Listesi

### 👮 Kayıt & Yetkili Komutları
*(Gereksinim: "Üyeleri Engelle" Yetkisi veya Config'deki Yetkili Roller)*

| Komut | Açıklama |
| :--- | :--- |
| `/kayıt @üye` | Kullanıcıyı "Yeni Üye" olarak kaydeder. |
| `/kayıtsil @üye` | Kaydı siler, "Kayıtsız"a atar. |
| `/doğrula @üye` | Üyeyi "Doğrulanmış Üye" yapar. |
| `/doğrulamasil @üye` | Doğrulamayı geri alır. |
| **Sağ Tık > Apps** | Hızlı Kayıt/Doğrulama işlemleri. |

### 🎮 Kullanıcı ve Level Komutları
*(Herkes Kullanabilir)*

| Komut | Açıklama |
| :--- | :--- |
| `/profil` | Level, XP, Coin ve Rütbe durumunu gösterir. |
| `/sıralama` | Sunucudaki en yüksek seviyeli ilk 10 kişiyi listeler. |
| `!ping` | Botun gecikme süresini ölçer. |

### ⚙️ Yönetim Komutları
*(Sadece Yöneticiler / Administrator)*

| Komut | Açıklama |
| :--- | :--- |
| `/level-yonet xp-ver` | Bir kullanıcıya manuel XP veya Para ekler. |
| `/level-yonet level-ayarla`| Kullanıcının seviyesini direkt belirler. |
| `/level-yonet senkronize-et` | **Ghost Busting:** Sunucuda olmayanları siler ve herkesin rolünü tazeler. |
| `/baslat [etkinlik]` | İstediğiniz an manuel Etkinlik (Quiz/Math/Drop) başlatır. |

---

## ⚙️ Kurulum Rehberi

### 1. Gereksinimler
*   **Node.js** (Sürüm 20.x veya üstü önerilir)
*   **Git**
*   **FFmpeg** (Ses sistemi için gereklidir)

### 2. İndirme ve Yükleme
```bash
# Projeyi indirin
git clone https://github.com/Furyuna/FuryunaBot.git
cd FuryunaBot

# Kütüphaneleri kurun
npm install
```

### 3. Ayarları Yapılandırma
Ana dizinde `.env` dosyası oluşturun:
```env
BOT_TOKEN=TOKEN_BURAYA
CLIENT_ID=BOT_ID_BURAYA
GUILD_ID=SUNUCU_ID_BURAYA
```

**ÖNEMLİ:** Aşağıdaki dosyalardaki Rol/Kanal ID'lerini kendi sunucunuza göre düzenlemeyi unutmayın!
*   `commands/kayit/config.js` (Kayıt Rolleri)
*   `commands/level/config.js` (Level ve Rütbe Rolleri)
*   `commands/etkinlik/config.js` (Etkinlik ve Mesaj Kanalları)

### 4. Botu Başlatma
```bash
# Geliştirme modu
node index.js

# Sunucu modu (PM2 ile - Önerilen)
pm2 start index.js --name "FuryunaBot"
pm2 save
```

---

## 📁 Dosya Yapısı
*   `commands/`: Komutlar (Kayıt, Level, Etkinlik, Yetkili).
*   `handlers/`: XP, Ses, Hoşgeldin, Güvenlik sistemleri.
*   `events/`: Discord olay dinleyicileri.
*   `data/`: `scheduledEvents.json` ve `revivalState.json` burada tutulur.
*   `database.sqlite`: Üye veritabanı.

---
*Developed by W4zel & Furyuna Team* 🚀
