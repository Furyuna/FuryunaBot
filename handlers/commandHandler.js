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
                    if ('data' in command && 'execute' in command) {
                        client.commands.set(command.data.name, command);
                        console.log(`[KOMUT] ${command.data.name} yüklendi.`);
                    } else {
                        console.log(`[UYARI] ${filePath} dosyasında 'data' veya 'execute' özelliği eksik.`);
                    }
                } catch (error) {
                    console.error(`[HATA] ${filePath} yüklenirken hata oluştu:`, error);
                }
            }
        }
    }
};
