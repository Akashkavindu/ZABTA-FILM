const { cmd, commands } = require("../command");

const HELP_IMAGE_URL = "https://github.com/Akashkavindu/ZANTA_MD/blob/main/images/menu-new.jpg?raw=true";

const lastHelpMessage = new Map();

cmd({
    pattern: "help",
    react: "❓",
    desc: "Display help for a specific command or show general help.",
    category: "main",
    filename: __filename,
},
async (zanta, mek, m, { from, reply, args, prefix }) => {
    try {
        const botSettings = global.CURRENT_BOT_SETTINGS || {};
        const finalPrefix = botSettings.prefix || '.';
        const botName = botSettings.botName || "ZANTA-MD";

        let searchTerm = args[0]?.toLowerCase() || m.body?.toLowerCase();

        if (searchTerm) {
            if (searchTerm.startsWith(finalPrefix + 'help')) {
                searchTerm = searchTerm.replace(finalPrefix + 'help', '').trim();
            } else if (searchTerm.startsWith('help')) {
                searchTerm = searchTerm.replace('help', '').trim();
            }
        }

        if (searchTerm) {
            const cmdObj = commands.find(c => 
                c.pattern === searchTerm || 
                (c.alias && c.alias.includes(searchTerm))
            );

            if (cmdObj) {
                let helpText = `╭━━━〔 ${botName} HELP 〕━━━┈⊷\n`;
                helpText += `┃\n`;
                helpText += `┃ 🏷️ *Command:* ${finalPrefix}${cmdObj.pattern}\n`;
                if (cmdObj.alias && cmdObj.alias.length > 0) {
                    helpText += `┃ 🔗 *Aliases:* ${cmdObj.alias.map(a => finalPrefix + a).join(', ')}\n`;
                }
                helpText += `┃ 📂 *Category:* ${cmdObj.category || 'misc'}\n`;
                helpText += `┃ 📝 *Description:* ${cmdObj.desc || 'No description available.'}\n`;
                helpText += `┃\n`;
                helpText += `╰━━━━━━━━━━━━━━━┈⊷`;

                return reply(helpText);
            } else {
                return reply(`❌ Command "*${searchTerm}*" not found. Use *${finalPrefix}menu* to see all commands.`);
            }
        }

        let helpText = `╭━━━〔 ${botName} HELP 〕━━━┈⊷\n`;
        helpText += `┃\n`;
        helpText += `┃ 👋 *Welcome to ${botName}!*\n`;
        helpText += `┃\n`;
        helpText += `┃ 📜 *${finalPrefix}menu* - View all commands\n`;
        helpText += `┃ ❓ *${finalPrefix}help <command>* - Get help for a specific command\n`;
        helpText += `┃ ⚙️ *${finalPrefix}settings* - Bot settings (Owner only)\n`;
        helpText += `┃ 💚 *${finalPrefix}alive* - Check if bot is running\n`;
        helpText += `┃\n`;
        helpText += `╰━━━━━━━━━━━━━━━┈⊷\n\n`;
        helpText += `_💡 Reply with a command name to get details._`;

        const sentMessage = await zanta.sendMessage(from, {
            image: { url: HELP_IMAGE_URL },
            caption: helpText.trim()
        }, { quoted: mek });

        lastHelpMessage.set(from, sentMessage.key.id);

    } catch (err) {
        console.error("Help Error:", err);
        reply("❌ Error generating help.");
    }
});

module.exports = { lastHelpMessage };
