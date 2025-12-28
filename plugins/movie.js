const { cmd } = require("../command");
const axios = require("axios");
const cheerio = require("cheerio");

cmd({
    pattern: "film",
    alias: ["movie", "movie-dl"],
    desc: "Download films from sinhalasub.",
    category: "download",
    react: "🎬",
    filename: __filename,
}, async (zanta, mek, m, { from, q, reply, isOwner }) => {
    
    // Private mode - අයිතිකරුට පමණයි
    if (!isOwner) return reply("⚠️ මෙම පහසුකම භාවිතා කළ හැක්කේ අයිතිකරුට පමණි.");
    if (!q) return reply("🎥 කරුණාකර චිත්‍රපටයේ නම ලබා දෙන්න. (E.g: .film Jumanji)");

    try {
        await reply("🔍 Searching for your movie... Please wait.");

        // 1. සයිට් එකේ සර්ච් කරනවා
        const searchUrl = `https://sinhalasub.lk/?s=${encodeURIComponent(q)}`;
        const { data } = await axios.get(searchUrl);
        const $ = cheerio.load(data);
        
        const movieUrl = $('#post-wrapper .result-item .details .title a').attr('href');
        if (!movieUrl) return reply("❌ චිත්‍රපටය හමු වුණේ නැහැ. කරුණාකර නම නිවැරදිව ලබා දෙන්න.");

        // 2. ෆිල්ම් එකේ ලින්ක් එකට ගිහින් විස්තර ගන්නවා
        const moviePage = await axios.get(movieUrl);
        const $$ = cheerio.load(moviePage.data);
        const title = $$('h1').text().trim();
        const dlLink = $$('.g-btn.g-btn-d').first().attr('href'); // පළමු download බටන් එක ගනී

        if (!dlLink) return reply("❌ ඩවුන්ලෝඩ් ලින්ක් එක ලබා ගැනීමට නොහැක.");

        await reply(`📽️ *Movie Found:* ${title}\n📦 *Size:* Processing...\n\n📥 සර්වර් එක හරහා ඩවුන්ලෝඩ් වීම ආරම්භ වුණා. කරුණාකර රැඳී සිටින්න.`);

        // 3. Direct Streaming - RAM එකට ගන්නේ නැතිව කෙලින්ම WhatsApp එකට යවනවා
        await zanta.sendMessage(from, {
            document: { url: dlLink },
            mimetype: 'video/mp4',
            fileName: `${title}.mp4`,
            caption: `🎬 *${title}*\n\n> *Powered by ZANTA-FILM-MD*`
        }, { quoted: mek });

        await m.react("✅");

    } catch (e) {
        console.error(e);
        reply("❌ දෝෂයක් සිදු වුණා: " + e.message);
    }
});
