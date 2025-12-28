const { cmd } = require("../command");
const axios = require("axios");
const cheerio = require("cheerio");

cmd({
    pattern: "film",
    alias: ["movie", "movie-dl"],
    react: "🎬",
    desc: "Optimized movie downloader for Render/VPS.",
    category: "download",
    filename: __filename,
}, async (zanta, mek, m, { from, q, reply, isOwner }) => {
    
    if (!isOwner) return reply("⚠️ මෙම පහසුකම භාවිතා කළ හැක්කේ අයිතිකරුට පමණි.");
    if (!q) return reply("🎥 කරුණාකර චිත්‍රපටයේ නම ලබා දෙන්න.");

    try {
        await reply("🚀 *ZANTA-FILM-MD* is fetching your movie via Render Server...");

        const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' };
        
        // 1. සෙවුම
        const searchUrl = `https://cinesubz.lk/?s=${encodeURIComponent(q)}`;
        const response = await axios.get(searchUrl, { headers, timeout: 15000 });
        const $ = cheerio.load(response.data);
        
        // වඩාත් නිවැරදිව පළමු මූවී ලින්ක් එක ගැනීම
        let movieUrl = $("article a").first().attr("href");

        if (!movieUrl) return reply("❌ චිත්‍රපටය හමු වුණේ නැහැ. (Search Error)");

        // 2. මූවී පේජ් එකට යාම
        const movieRes = await axios.get(movieUrl, { headers, timeout: 15000 });
        const $$ = cheerio.load(movieRes.data);
        const title = $$('h1.entry-title').text().trim() || "Movie";
        
        let pixeldrainId = "";
        
        // Pixeldrain ID එක සොයා ගැනීම (Link එකේ තියෙන එක)
        $$('a').each((i, el) => {
            const href = $$(el).attr('href');
            if (href && href.includes('pixeldrain.com/u/')) {
                const parts = href.split('/u/');
                pixeldrainId = parts[1].split(/[?#]/)[0]; // ID එක විතරක් වෙන් කර ගනී
                return false; 
            }
        });

        if (!pixeldrainId) return reply("❌ Pixeldrain Link එක සොයාගත නොහැක.");

        const finalDlLink = `https://pixeldrain.com/api/file/${pixeldrainId}`;

        // 3. WhatsApp එකට යැවීම (Streaming)
        await zanta.sendMessage(from, {
            document: { url: finalDlLink },
            mimetype: 'video/mp4',
            fileName: `${title}.mp4`,
            caption: `🎬 *${title}*\n\n✅ *Source:* CineSubz\n🚀 *Server:* Render Stream\n\n> *ZANTA-FILM-MD*`
        }, { quoted: mek });

        await m.react("✅");

    } catch (e) {
        console.error(e);
        reply("❌ දෝෂය: " + e.message);
    }
});
