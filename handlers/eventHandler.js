const fs = require('node:fs');
const path = require('node:path');

module.exports = (client) => {
    const eventsPath = path.join(__dirname, '../events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        try {
            const event = require(filePath);
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
            console.log(`[EVENT] ${event.name} yüklendi.`);
        } catch (error) {
            console.error(`[HATA] ${filePath} event'i yüklenirken hata oluştu:`, error);
        }
    }

    // handlers/events klasörünü de yükle (XP sistemi için)
    const specializedEventsPath = path.join(__dirname, '../handlers/events');
    if (fs.existsSync(specializedEventsPath)) {
        const specialFiles = fs.readdirSync(specializedEventsPath).filter(file => file.endsWith('.js'));
        for (const file of specialFiles) {
            const filePath = path.join(specializedEventsPath, file);
            try {
                const event = require(filePath);
                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args));
                } else {
                    client.on(event.name, (...args) => event.execute(...args));
                }
                console.log(`[EVENT] Handler/Event ${file} yüklendi.`);
            } catch (error) {
                console.error(`[HATA] ${filePath} yüklenirken hata:`, error);
            }
        }
    }
};
