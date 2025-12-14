require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const config = require('./config.json');

const commands = [];
const commandsFolder = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsFolder);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsFolder, folder);
    if (fs.lstatSync(folderPath).isDirectory()) {
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js') && file !== 'config.js');
        for (const file of commandFiles) {
            const command = require(path.join(folderPath, file));
            if ('data' in command && 'execute' in command) {
                // Log command name and type for verification
                const typeStr = command.data.type === 2 ? 'USER_CONTEXT' :
                    command.data.type === 3 ? 'MESSAGE_CONTEXT' : 'SLASH_COMMAND';
                console.log(`[HAZIRLANDI] ${command.data.name} (${typeStr})`);

                commands.push(command.data.toJSON());
            } else {
                console.log(`[UYARI] ${file} dosyasında eksik veriler.`);
            }
        }
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        console.log(`${commands.length} komut yükleniyor...`);
        const data = await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commands },
        );
        console.log(`✅ ${data.length} komut başarıyla yüklendi!`);
    } catch (error) {
        console.error(error);
    }
})();