const { cmd } = require("../command");
const axios = require("axios");
const cheerio = require("cheerio");

cmd({
    pattern: "film",
    alias: ["movie", "movie-dl"],
    react: "🎬",
    desc: "Debuggable movie downloader for Render.",
    category: "download",
    filename: __filename,
}, async (zanta, mek, m, { from, q, reply, isOwner }) => {
    
    if (!isOwner) return reply("⚠️ මෙම පහසුකම භාවිතා කළ හැක්කේ අයිතිකරුට පමණි.");
    if (!q) return reply("🎥 කරුණාකර චිත්‍රපටයේ නම ලබා දෙන්න.");

    try {
        await reply(`🔍 *Debug Search:* Searching for "${q}"...`);

        const headers = { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
        };
        
        // 1. සෙවුම (Search)
        const searchUrl = `https://cinesubz.lk/?s=${encodeURIComponent(q)}`;
        const response = await axios.get(searchUrl, { headers, timeout: 15000 });
        const $ = cheerio.load(response.data);
        
        // සයිට් එකේ තියෙන ඔක්කොම ලින්ක් චෙක් කරනවා
        let movieUrl = "";
        $("article a, .result-item a, .post-column a").each((i, el) => {
            const href = $(el).attr("href");
            if (href && href.includes("/movies/") && !movieUrl) {
                movieUrl = href;
                console.log("DEBUG: Found Movie Link ->", movieUrl);
            }
        });

        if (!movieUrl) {
            return reply(`❌ *Search Error:* සයිට් එකේ චිත්‍රපටය හමු වුණේ නැහැ. (CineSubz blocked or layout changed)`);
        }

        await reply(`🔗 *Found Page:* Accessing movie details...`);

        // 2. මූවී පේජ් එකට යාම
        const movieRes = await axios.get(movieUrl, { headers, timeout: 15000 });
        const $$ = cheerio.load(movieRes.data);
        
        const title = $$('h1').first().text().trim() || "Movie";
        let pixeldrainId = "";

        // Pixeldrain ID එක සොයන තැන් කිහිපයක්
        $$('a').each((i, el) => {
            const href = $$(el).attr('href');
            if (href) {
                if (href.includes('pixeldrain.com/u/')) {
                    pixeldrainId = href.split('/u/')[1].split(/[?#]/)[0];
                    return false;
                }
                // සමහරවිට සයිට් එක ඇතුළේ ලින්ක් එක redirect වෙනවා නම්
                if (href.includes('pixeldrain.com/api/file/')) {
                    pixeldrainId = href.split('/file/')[1].split(/[?#]/)[0];
                    return false;
                }
            }
        });

        if (!pixeldrainId) {
            return reply(`❌ *Link Error:* සයිට් එකේ පේජ් එක හමු වුණත් Download Link එක සොයාගත නොහැක.`);
        }

        const finalDlLink = `https://pixeldrain.com/api/file/${pixeldrainId}`;
        await reply(`🚀 *Direct Link Found!* Starting upload to WhatsApp...`);

        // 3. WhatsApp එකට යැවීම
        await zanta.sendMessage(from, {
            document: { url: finalDlLink },
            mimetype: 'video/mp4',
            fileName: `${title}.mp4`,
            caption: `🎬 *${title}*\n\n✅ *Status:* Successfully Downloaded\n🚀 *Server:* Render Stream\n\n> *ZANTA-FILM-MD*`
        }, { quoted: mek });

        await m.react("✅");

    } catch (e) {
        console.error("DEBUG ERROR:", e);
        reply(`❌ *System Error:* ${e.message}\n\n*Note:* Render එකෙන් සයිට් එක බ්ලොක් කරලා වෙන්නත් පුළුවන්.`);
    }
});
