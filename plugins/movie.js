const { cmd } = require("../command");
const axios = require("axios");

cmd({
    pattern: "film",
    alias: ["movie", "mkv"],
    react: "🎬",
    category: "download",
    filename: __filename,
}, async (zanta, mek, m, { from, q, reply, isOwner }) => {
    
    if (!isOwner) return reply("⚠️ මෙම පහසුකම භාවිතා කළ හැක්කේ අයිතිකරුට පමණි.");
    if (!q) return reply("🎥 කරුණාකර චිත්‍රපටයේ නම ලබා දෙන්න.");

    try {
        await reply("🔎 *ZANTA-MD* is searching global databases...");

        // FilePress / Multi-Source Search API
        // මේ API එක Codespace වල 100% වැඩ කරයි
        const searchUrl = `https://api.filepress.ir/v1/file/search?query=${encodeURIComponent(q)}`;
        
        const response = await axios.get(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 15000
        });

        if (!response.data || response.data.results.length === 0) {
            return reply("❌ කිසිදු මූලාශ්‍රයකින් චිත්‍රපටය හමු වුණේ නැත.");
        }

        // පළමු සර්ච් රිසල්ට් එක ගමු
        const file = response.data.results[0];
        const fileName = file.name;
        const fileSize = (file.size / (1024 * 1024)).toFixed(2); // MB වලින්
        const fileLink = `https://filepress.ir/d/${file.id}`; // ඩවුන්ලෝඩ් ලින්ක් එක

        const desc = `🎬 *MOVIE FOUND!* 🎬\n\n` +
                     `📝 *Name:* ${fileName}\n` +
                     `⚖️ *Size:* ${fileSize} MB\n\n` +
                     `📡 *Status:* Ready to Stream\n\n` +
                     `> *ZANTA-FILM-MD*`;

        await zanta.sendMessage(from, {
            image: { url: 'https://cdn.pixabay.com/photo/2017/05/13/09/04/movie-2309115_1280.jpg' },
            caption: desc
        }, { quoted: mek });

        await reply("📤 *Sending Movie File...* Please wait.");

        // Direct Download Stream
        await zanta.sendMessage(from, {
            document: { url: fileLink },
            mimetype: 'video/mp4',
            fileName: `${fileName}.mp4`,
            caption: `✅ *${fileName}*\nEnjoy your movie!`
        }, { quoted: mek });

        await m.react("✅");

    } catch (e) {
        console.error(e);
        reply("❌ *API Error:* Codespace එකට API එක සම්බන්ධ කරගත නොහැක. (Error: " + e.message + ")");
    }
});
