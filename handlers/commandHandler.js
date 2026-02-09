const fs = require('node:fs');
const path = require('node:path');

module.exports = (client) => {
    const commandsPath = path.join(__dirname, '../commands');
    const commandFolders = fs.readdirSync(commandsPath);

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        if (fs.lstatSync(folderPath).isDirectory()) {
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js') && file !== 'config.js');
            for (const file of commandFiles) {
                const filePath = path.join(folderPath, file);
                try {
                    const command = require(filePath);

                    // 1. SLASH COMMANDS (veya Context Menu)
                    if ('data' in command && 'execute' in command) {
                        let key = command.data.name;
                        if (command.data.type && command.data.type !== 1) {
                            key = `${command.data.name}_${command.data.type}`;
                        }
                        client.commands.set(key, command);
                        console.log(`[KOMUT] ${command.data.name} (${key !== command.data.name ? key : 'SLASH'}) yüklendi.`);
                    }
                    // 2. PREFIX COMMANDS (Sadece ! komutları)
                    else if ('name' in command && 'executePrefix' in command) {
                        client.commands.set(command.name, command);
                        console.log(`[KOMUT] ${command.name} (PREFIX) yüklendi.`);
                    }
                    else {
                        console.log(`[UYARI] ${filePath} dosyasında gerekli özellikler eksik.`);
                    }
                } catch (error) {
                    console.error(`[HATA] ${filePath} yüklenirken hata oluştu:`, error);
                }
            }
        }
    }
};
