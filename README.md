# 🤖 FuryunaBot

**FuryunaBot**, Discord sunucunuzu profesyonelce yönetmeniz için geliştirilmiş kapsamlı bir **Kayıt, Seviye, Ekonomi ve Etkinlik** botudur. 

Modern ve kullanıcı dostu arayüzü, gelişmiş rütbe sistemi ve otomatikleştirilmiş özellikleriyle topluluğunuzu canlı tutun.

---

## 🌟 Öne Çıkan Özellikler

### 🛡️ Kayıt ve Güvenlik Sistemi
*   **Çift Aşamalı Yetki:** Kullanıcıları "Doğrulanmış Üye" ve "Yeni Üye" olarak ayırın.
*   **Otomatik Kontrol:** Zaten kayıtlı veya doğrulanmış kullanıcıları bot algılar ve uyarır.
*   **Hoş Geldin Karşılaması:** Sunucuya yeni katılanları veya kayıt olanları, şık ve **randomize edilmiş** (rastgele seçilen) mesajlarla karşılayın. Sonuna "Hoş Geldin Pingi" rolünü ekleyerek herkesin haberdar olmasını sağlayın.
*   **Esnek Komutlar:** İster `/slash` komutları, ister `!prefix` komutları, isterseniz de **Sağ Tık Menüsü** (Uygulamalar) ile işlem yapın.

### 🏆 Gelişmiş Level & Rütbe Sistemi
*   **Adil XP Kazanımı:** Mesaj başına rastgele (5-15) XP. Spam koruması (2 saniye bekleme süresi) ile haksız kazanç engellenir.
*   **🎙️ Ses Aktifliği:** Ses kanallarında geçirilen her dakika için hem **XP** (Level için) hem de **Aktiflik Puanı** (Rol için) kazanılır.
*   **Dinamik Rütbe (Rank) Sistemi:** Sadece level atlamak yetmez! Aktifliğinize göre **Bronz, Gümüş, Altın, Platin, Elmas** rütbeleri otomatik verilir.
*   **Aktiflik Çürümesi (Decay):** Kullanıcı aktif olmazsa, her gün gece 00:00'da puanlarının **%5'i silinir**. Böylece rütbeler her zaman hak edenlerde kalır.
*   **Boost Bonusu:** Sunucuya Boost basan üyeler **2 KAT** daha fazla para ve ödül kazanır.
*   **Görsel Profil:** `/profil` komutu ile level, rütbe, ve yüzdelik ilerleme durumunuzu estetik bir kartta görün.

### 🎉 Etkinlik ve Ekonomi
*   **Hayırlı Cumalar:** Her Cuma günü belirlediğiniz saatte (Örn: 11:53) otomatik kutlama mesajı atar.
*   **Furyuna Coin:** Aktif oldukça para biriktirin. (İleride market sistemi için altyapı hazır).

---

## 🛠️ Komut Listesi

### 👮 Yetkili Komutları (Kayıt & Güvenlik)
| Slash Komut | Prefix Komut | Açıklama |
| :--- | :--- | :--- |
| `/kayıt @üye` | `!kayıt` | Kullanıcıyı "Yeni Üye" olarak kaydeder. |
| `/kayıtsil @üye` | `!kayıtsil` | Kaydı siler, "Kayıtsız"a atar. |
| `/doğrula @üye` | `!doğrula` | Üyeyi "Doğrulanmış Üye" yapar. |
| `/doğrulamasil @üye` | `!doğrulamasil` | Doğrulamayı geri alır. |

> [!TIP]
> **Pro İpucu (Otomatik Kayıt):** Eğer bir kullanıcı **Kayıtsız** ise, direkt olarak `!doğrula` komutunu kullanarak onu hem kayıt edip hem de doğrulayabilirsiniz. İki komut kullanmanıza gerek yoktur, bot bunu otomatik halleder!

> [!NOTE]
> **Alternatif Komutlar (Aliases):**
> Komutların birden fazla ismi vardır. Örneğin `!kayıt` yerine `!k`, `!kaydol`, `!register` gibi kısaltmalar kullanabilirsiniz.
> Bu isimleri ve komutların çalışma mantığını **`commands/kayit/config.js`** dosyasından özgürce değiştirebilirsiniz.

### 🖱️ Sağ Tık Menüsü (Hızlı İşlem)
*Bir kullanıcıya veya mesajına SAĞ TIKLAYIP > Uygulamalar (Apps) menüsüne gidin:*
*   **Hızlı Kayıt Et / Sil:** Anında işlem yapar.
*   **Hızlı Doğrula / Sil:** Anında işlem yapar.
*   *(Hem kullanıcı profiline hem de attığı mesaja sağ tıklayarak çalışır)*

### 🎮 Kullanıcı ve Level Komutları
| Komut | Açıklama |
| :--- | :--- |
| `/profil` | Level, XP, Coin ve Rütbe durumunu gösterir. |
| `/sıralama` | Sunucudaki en yüksek seviyeli ilk 10 kişiyi listeler. |
| `!ping` | Botun gecikme süresini ölçer. |

### ⚙️ Yönetim Komutları
| Komut | Açıklama |
| :--- | :--- |
| `/level-yonet xp-ver` | Bir kullanıcıya manuel XP veya Para ekler. |
| `/level-yonet level-ayarla`| Kullanıcının seviyesini direkt belirler. |
| `/level-yonet sifirla` | Kullanıcının tüm level verilerini siler. |
| `/senkronize-et` | Veritabanı ile Discord rollerini eşler (Bakım için). |

---

## ⚙️ Kurulum Rehberi (Sıfırdan)

### 1. Gereksinimler
*   **Node.js** (Sürüm 16.9 veya üstü)
*   **Git**
*   **Discord Bot Token** (Discord Developer Portal'dan alınmış)

### 2. İndirme ve Yükleme
Terminal veya Komut İstemcisi'ni açın ve sırasıyla şunları yazın:

```bash
# 1. Projeyi bilgisayarınıza çekin
git clone https://github.com/Furyuna/FuryunaBot.git

# 2. Klasöre girin
cd FuryunaBot

# 3. Gerekli kütüphaneleri yükleyin
npm install
```

### 3. Ayarları Yapılandırma

#### `.env` Dosyası
Ana klasörde `.env` adında bir dosya oluşturun ve içine bot bilgilerinizi girin:
```env
BOT_TOKEN=BURAYA_TOKEN_GELECEK
CLIENT_ID=BURAYA_BOT_ID_GELECEK
GUILD_ID=BURAYA_SUNUCU_ID_GELECEK
```

#### `config.json` Dosyası
Botun sahibini ve prefix'ini belirleyin:
```json
{
  "owners": ["SİZİN_ID_NUMARANIZ"],
  "prefix": ["!", ".", "?"]
}
```

#### Rol ve Kanal Ayarları (ÖNEMLİ!)
Botun düzgün çalışması için aşağıdaki dosyalardaki **ID numaralarını kendi sunucunuza göre değiştirin**:

1.  **`commands/kayit/config.js`**: Kayıt yetkilisi rolleri, Yeni Üye/Kayıtsız rolleri burada ayarlanır.
2.  **`commands/level/config.js`**: Hangi kanallarda XP kazanılmayacağı, Rütbe puan sınırları ve Rol ID'leri burada.
3.  **`commands/etkinlik/config.js`**: Hoş geldin mesajı kanalı, Cuma mesajı kanalı ve saatleri burada.

### 4. Botu Başlatma

**Normal Başlatma (Test İçin):**
```bash
node index.js
```

**Kalıcı Başlatma (Sunucu İçin - PM2 Önerilir):**
Botun kapanmaması ve sunucu yeniden başlasa bile açılması için PM2 kullanın.
```bash
npm install pm2 -g  # Eğer yüklü değilse
pm2 start index.js --name "FuryunaBot"
pm2 save
pm2 startup
```

---

## 📁 Dosya Yapısı ve Anlamları

*   `index.js`: Botun beyni. Başlangıç noktası.
*   `commands/`: Tüm komut dosyaları burada kategorilenmiştir.
*   `handlers/`: Botun olayları işleyen sistemleri (XP, Ses, Kayıt vb.).
*   `events/`: Discord olaylarını dinleyen dosyalar (Mesaj geldiğinde, biri girdiğinde vb.).
*   `utils/`: Yardımcı araçlar (Veritabanı bağlantısı vb.).
*   `database.sqlite`: **SİLMEYİN!** Bu dosya üyelerin level ve paralarını tutar.

---
*Geliştirici: W4zel & Furyuna Ekibi* 🚀
