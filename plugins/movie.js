const { cmd } = require("../command");
const axios = require("axios");
const cheerio = require("cheerio");

cmd({
    pattern: "film",
    alias: ["movie", "movie-dl"],
    react: "🎬",
    desc: "Optimized movie downloader for GitHub Actions/Servers.",
    category: "download",
    filename: __filename,
}, async (zanta, mek, m, { from, q, reply, isOwner }) => {
    
    if (!isOwner) return reply("⚠️ මෙම පහසුකම භාවිතා කළ හැක්කේ අයිතිකරුට පමණි.");
    if (!q) return reply("🎥 කරුණාකර චිත්‍රපටයේ නම ලබා දෙන්න.");

    try {
        await reply("🚀 *ZANTA-FILM-MD* is fetching your movie via Server Stream...");

        const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };
        
        // 1. සර්ච් එක සහ ලින්ක් එක ගැනීම
        const searchUrl = `https://cinesubz.lk/?s=${encodeURIComponent(q)}`;
        const response = await axios.get(searchUrl, { headers });
        const $ = cheerio.load(response.data);
        let movieUrl = "";

        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && href.includes('/movies/') && href.includes(q.toLowerCase().replace(/\s+/g, '-'))) {
                movieUrl = href;
                return false;
            }
        });

        if (!movieUrl) return reply("❌ චිත්‍රපටය හමු වුණේ නැහැ.");

        const movieRes = await axios.get(movieUrl, { headers });
        const $$ = cheerio.load(movieRes.data);
        const title = $$('h1').first().text().trim() || "Movie";
        
        let pixeldrainId = "";
        $$('a').each((i, el) => {
            const href = $$(el).attr('href');
            if (href && href.includes('/api-')) {
                const parts = href.split('/');
                const id = parts.filter(p => p.length > 5).pop();
                if (id) { pixeldrainId = id.replace(/\/$/, ""); return false; }
            }
        });

        if (!pixeldrainId) return reply("❌ ඩවුන්ලෝඩ් ලින්ක් එක සොයාගත නොහැක.");

        const finalDlLink = `https://pixeldrain.com/api/file/${pixeldrainId}`;

        // 2. කෙලින්ම Server Stream එක WhatsApp එකට යැවීම
        // මේකෙන් RAM එක හෝ Disk Space එක පිරෙන්නේ නැහැ
        await zanta.sendMessage(from, {
            document: { url: finalDlLink }, // Server එක කෙලින්ම URL එක Stream කරයි
            mimetype: 'video/mp4',
            fileName: `${title}.mp4`,
            caption: `🎬 *${title}*\n\n> *ZANTA-FILM-MD SERVER UPLOAD*`
        }, { quoted: mek });

        await m.react("✅");

    } catch (e) {
        console.error(e);
        reply("❌ Server Error: " + e.message);
    }
});
