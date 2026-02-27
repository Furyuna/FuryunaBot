module.exports = {
    // Oyunun çalışacağı kanal ID'si
    channelId: "1288412943574237195",

    // Oyun Ayarları
    minWordLength: 2,         // Minimum kelime uzunluğu

    // Puanlar
    pointsPerWord: 5,         // Her doğru kelime için kazanılan puan

    // Mesajlar
    messages: {
        gameStart: "🎮 **Kelime Türetmece Başladı!**\nİlk kelime: **{word}**\nSon harf: **{letter}** ile başlayan bir kelime yazın! ⏳",
        validWord: "✅ **{word}** kabul edildi! (Sonraki: **{letter}**)",
        invalidWord: "❌ **{word}** TDK'da bulunamadı veya geçersiz!",
        usedWord: "🚫 **{word}** bu turda zaten kullanıldı!",
        wrongStart: "⚠️ Kelimen **{letter}** harfiyle başlamalı!"
    }
};
