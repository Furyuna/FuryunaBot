# 🤖 FuryunaBot

FuryunaBot, Discord sunucuları için geliştirilmiş gelişmiş bir **Kayıt ve Doğrulama** botudur. Kullanıcıları kaydetmek, doğrulamak ve rollerini yönetmek için Slash Komutları (`/`) ve Sağ Tık Menülerini kullanır.

## 🌟 Özellikler

*   **🛡️ Güvenli Doğrulama:** Kullanıcıları "Doğrulanmış Üye" yaparak sunucu güvenliğini artırın.
*   **📝 Kolay Kayıt:** Tek komutla kullanıcıları kaydedin ve rollerini otomatik yönetin.
*   **⚡ Hızlı İşlemler:** Kullanıcının üzerine sağ tıklayarak saniyeler içinde işlem yapın.
*   **🚫 Akıllı Hata Yönetimi:** Zaten kayıtlı veya doğrulanmış kullanıcıları tespit eder ve bilgilendirir.

## 🛠️ Komutlar

### Slash Komutları (Sohbet)
| Komut | Açıklama |
| :--- | :--- |
| `/kayıt @kullanıcı` | Kullanıcıyı sunucuya kayıt eder (Yeni Üye rolü verir). |
| `/kayıt-sil @kullanıcı` | Kullanıcının kaydını siler ve Kayıtsız'a atar. |
| `/doğrula @kullanıcı` | Kullanıcıyı doğrular (Doğrulanmış Üye rolü verir). |
| `/doğrulama-sil @kullanıcı` | Kullanıcının doğrulamasını kaldırır. |
| `/ping` | Botun gecikme süresini gösterir. |

### Prefix Komutları (Mesaj)
*   `!kayıt @kullanıcı`
*   `!kayıt sil @kullanıcı`
*   `!doğrula @kullanıcı`
*   `!doğrulama sil @kullanıcı`

### 🖱️ Sağ Tık Menüsü (Uygulamalar)
Kullanıcının üzerine sağ tıklayıp **Uygulamalar (Apps)** menüsünden şunları seçebilirsiniz:
*   `Hızlı Kayıt Et`
*   `Hızlı Kayıt Sil`
*   `Hızlı Doğrula`
*   `Hızlı Doğrulama Sil`

## ⚙️ Kurulum

1.  Repoyu klonlayın:
    ```bash
    git clone https://github.com/Furyuna/FuryunaBot.git
    ```
2.  Gerekli paketleri yükleyin:
    ```bash
    npm install
    ```
3.  `.env` dosyasını oluşturun ve Token'ınızı girin:
    ```env
    BOT_TOKEN=sizin_bot_tokeniniz
    CLIENT_ID=sizin_client_id
    GUILD_ID=sizin_sunucu_id
    ```
4.  Botu başlatın:
    ```bash
    node index.js
    ```

---
*Furyuna için geliştirilmiştir.*
