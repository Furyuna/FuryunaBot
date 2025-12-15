# 🤖 FuryunaBot

FuryunaBot, Discord sunucuları için geliştirilmiş **Kayıt, Doğrulama, Seviye ve Ekonomi** botudur. Modern arayüzü, detaylı seviye sistemi ve güvenli kayıt özellikleriyle topluluğunuzu yönetmenizi sağlar.

## 🌟 Özellikler

### 🛡️ Kayıt & Güvenlik
*   **Güvenli Doğrulama:** Kullanıcıları "Doğrulanmış Üye" yaparak sunucu güvenliğini artırın.
*   **Kolay Kayıt:** Tek komutla (`/kayıt`) veya sağ tık menüsüyle hızlı işlem.
*   **Akıllı Kontrol:** Zaten kayıtlı/doğrulanmış kullanıcıları otomatik algılar.

### 🏆 Level & Ekonomi Sistemi (YENİ!)
*   **Gelişmiş XP:** Mesaj başına ve **Ses Kanallarında** (dakika başı) XP kazanımı.
*   **Sürekli Kazanç:** Sadece seviye atlayınca değil, aktif oldukça anında **Furyuna Coin** kazanılır.
*   **Rütbe Sistemi:** Belirli seviyelerde (5, 10, 20 vb.) otomatik **Bronz, Gümüş, Altın** gibi roller verilir.
*   **Boost & Rol Bonusu:** Sunucuya Boost basanlar veya özel role sahip olanlar daha hızlı gelişir.
*   **Görsel Profil:** `/profil` komutu ile yüzdelik dilimli, şık bir ilerleme çubuğu görüntülenir.

## 🛠️ Komutlar

### 🎮 Level & Ekonomi
| Komut | Açıklama |
| :--- | :--- |
| `/profil` | Seviye, XP, Coin ve Rütbe durumunu gösterir. |
| `/sıralama` | Sunucudaki en yüksek seviyeli ilk 10 kişiyi listeler. |
| `/level-yonet xp-ver` | (Admin) Kullanıcıya XP ve Para verir. |
| `/level-yonet level-ayarla`| (Admin) Kullanıcının seviyesini direkt ayarlar. |
| `/level-yonet sifirla` | (Admin) Kullanıcının tüm verilerini siler. |

### 📝 Kayıt & Yetkili
| Komut | Açıklama |
| :--- | :--- |
| `/kayıt @kullanıcı` | Kullanıcıyı kayıt eder (Yeni Üye). |
| `/kayıt-sil @kullanıcı` | Kaydı siler ve Kayıtsız'a atar. |
| `/doğrula @kullanıcı` | Kullanıcıyı doğrular. |
| `/doğrulama-sil @kullanıcı` | Doğrulamayı kaldırır. |
| `/ping` | Botun gecikme süresini gösterir. |

### 🖱️ Sağ Tık Menüsü (Hızlı İşlem)
Kullanıcı üzerine sağ tıklayıp **Uygulamalar** menüsünden:
*   `Hızlı Kayıt Et` / `Sil`
*   `Hızlı Doğrula` / `Sil`

## ⚙️ Kurulum & Ayarlar

### 1. Dosyaları İndirin
```bash
git clone https://github.com/Furyuna/FuryunaBot.git
cd FuryunaBot
npm install
```

### 2. .env Dosyasını Oluşturun
Proje kök dizininde `.env` adında bir dosya oluşturun ve içine şunları yazın:
```env
BOT_TOKEN=TOKEN_GRIN
CLIENT_ID=BOT_ID_GRIN
GUILD_ID=SUNUCU_ID_GRIN
```

### 3. Ayarları Yapılandırın
Botun ayarları iki ana dosyada tutulur:
*   **`commands/kayit/config.js`**: Kayıt rolleri ve yetkili ayarları.
*   **`commands/level/config.js`**: Seviye XP oranları, ödül rolleri ve Rank sistemi ayarları.

### 4. Başlatın
```bash
node index.js
```

---
*Furyuna Topluluğu İçin Geliştirilmiştir.*
