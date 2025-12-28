const { cmd } = require("../command");

// --- 🛠️ LID/JID ඇඩ්මින් ප්‍රශ්නය විසඳන Function එක ---
const getLastDigits = (jid) => {
    if (!jid) return "";
    let clean = jid.split('@')[0].split(':')[0]; 
    return clean.slice(-8); 
};

// --- 🛡️ PERMISSION CHECKER (අන්තිම ඉලක්කම් 8 පාවිච්චි කර ඇත) ---
const checkPerms = (zanta, m, groupAdmins, isOwner, sender) => {
    const adminDigitsList = (groupAdmins || []).map(ad => getLastDigits(ad));
    const botDigits = getLastDigits(zanta.user.lid || zanta.user.id);
    const userDigits = getLastDigits(m.senderLid || sender);

    const isBotAdmin = adminDigitsList.includes(botDigits);
    const isUserAdmin = adminDigitsList.includes(userDigits);

    if (!isBotAdmin) return "bot_not_admin";
    if (!(isOwner || isUserAdmin)) return "not_admin";
    return "ok";
};

// --- 🔒 MUTE ---
cmd({
    pattern: "mute", alias: ["close"], react: "🔒", category: "group", filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup, groupAdmins, sender, isOwner }) => {
    if (!isGroup) return reply("❌ *Groups only.*");
    const perm = checkPerms(zanta, m, groupAdmins, isOwner, sender);
    if (perm === "bot_not_admin") return reply("❌ *මාව Admin කරන්න!*");
    if (perm === "not_admin") return reply("❌ *ඔබ Admin කෙනෙක් නෙවෙයි!*");

    await zanta.groupSettingUpdate(from, 'announcement');
    let desc = `\n╭━─━─━─━─━─━─━─━╮\n┃    *GROUP SETTINGS*\n╰━─━─━─━─━─━─━─━╯\n\n🔒 *Status:* Group Muted\n✅ *Action:* Success\n👤 *By:* @${sender.split('@')[0]}\n\n_Only admins can send messages now._`;
    await zanta.sendMessage(from, { text: desc, mentions: [sender] }, { quoted: mek });
});

// --- 🔓 UNMUTE ---
cmd({
    pattern: "unmute", alias: ["open"], react: "🔓", category: "group", filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup, groupAdmins, sender, isOwner }) => {
    if (!isGroup) return reply("❌ *Groups only.*");
    const perm = checkPerms(zanta, m, groupAdmins, isOwner, sender);
    if (perm === "bot_not_admin") return reply("❌ *මාව Admin කරන්න!*");
    if (perm === "not_admin") return reply("❌ *ඔබ Admin කෙනෙක් නෙවෙයි!*");

    await zanta.groupSettingUpdate(from, 'not_announcement');
    let desc = `\n╭━─━─━─━─━─━─━─━╮\n┃    *GROUP SETTINGS*\n╰━─━─━─━─━─━─━─━╯\n\n🔓 *Status:* Group Unmuted\n✅ *Action:* Success\n👤 *By:* @${sender.split('@')[0]}\n\n_Everyone can send messages now._`;
    await zanta.sendMessage(from, { text: desc, mentions: [sender] }, { quoted: mek });
});

// --- 🚫 KICK ---
cmd({
  pattern: "kick", react: "🚫", category: "group", filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup, groupAdmins, sender, isOwner, q }) => {
  try {
      if (!isGroup) return reply("❌ *Groups only.*");
      const perm = checkPerms(zanta, m, groupAdmins, isOwner, sender);
      if (perm === "bot_not_admin") return reply("❌ *මාව Admin කරන්න!*");
      if (perm === "not_admin") return reply("❌ *ඔබ Admin කෙනෙක් නෙවෙයි!*");

      let user = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
      if (!user && q) user = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
      if (!user) return reply("❌ *Tag, Reply හෝ අංකයක් දෙන්න.*");

      await zanta.groupParticipantsUpdate(from, [user], "remove");
      let desc = `\n╭━─━─━─━─━─━─━─━╮\n┃    *MEMBER REMOVED*\n╰━─━─━─━─━─━─━─━╯\n\n👤 *User:* @${user.split('@')[0]}\n✅ *Action:* Kicked\n👮 *By:* @${sender.split('@')[0]}`;
      await zanta.sendMessage(from, { text: desc, mentions: [user, sender] }, { quoted: mek });
  } catch (e) { reply("❌ Error: " + e.message); }
});

// --- ⭐ PROMOTE ---
cmd({
  pattern: "promote", react: "⭐", category: "group", filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup, groupAdmins, sender, isOwner, q }) => {
  try {
      if (!isGroup) return reply("❌ *Groups only.*");
      const perm = checkPerms(zanta, m, groupAdmins, isOwner, sender);
      if (perm === "bot_not_admin") return reply("❌ *මාව Admin කරන්න!*");
      if (perm === "not_admin") return reply("❌ *ඔබ Admin කෙනෙක් නෙවෙයි!*");

      let user = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
      if (!user && q) user = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
      if (!user) return reply("❌ *Tag, Reply හෝ අංකයක් දෙන්න.*");

      await zanta.groupParticipantsUpdate(from, [user], "promote");
      let desc = `\n╭━─━─━─━─━─━─━─━╮\n┃    *ADMIN PROMOTE*\n╰━─━─━─━─━─━─━─━╯\n\n👤 *User:* @${user.split('@')[0]}\n⭐ *Status:* New Admin\n👮 *By:* @${sender.split('@')[0]}`;
      await zanta.sendMessage(from, { text: desc, mentions: [user, sender] }, { quoted: mek });
  } catch (e) { reply("❌ Error: " + e.message); }
});

// --- 📉 DEMOTE ---
cmd({
  pattern: "demote", react: "📉", category: "group", filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup, groupAdmins, sender, isOwner, q }) => {
  try {
      if (!isGroup) return reply("❌ *Groups only.*");
      const perm = checkPerms(zanta, m, groupAdmins, isOwner, sender);
      if (perm === "bot_not_admin") return reply("❌ *මාව Admin කරන්න!*");
      if (perm === "not_admin") return reply("❌ *ඔබ Admin කෙනෙක් නෙවෙයි!*");

      let user = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
      if (!user && q) user = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
      if (!user) return reply("❌ *Tag, Reply හෝ අංකයක් දෙන්න.*");

      await zanta.groupParticipantsUpdate(from, [user], "demote");
      let desc = `\n╭━─━─━─━─━─━─━─━╮\n┃    *ADMIN DEMOTE*\n╰━─━─━─━─━─━─━─━╯\n\n👤 *User:* @${user.split('@')[0]}\n📉 *Status:* Admin Removed\n👮 *By:* @${sender.split('@')[0]}`;
      await zanta.sendMessage(from, { text: desc, mentions: [user, sender] }, { quoted: mek });
  } catch (e) { reply("❌ Error: " + e.message); }
});

// --- ➕ ADD MEMBER ---
cmd({
    pattern: "add", react: "➕", category: "group", filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup, groupAdmins, sender, isOwner, q }) => {
    if (!isGroup) return reply("❌ *Groups only.*");
    const perm = checkPerms(zanta, m, groupAdmins, isOwner, sender);
    if (perm === "bot_not_admin") return reply("❌ *මාව Admin කරන්න!*");
    if (perm === "not_admin") return reply("❌ *ඔබ Admin කෙනෙක් නෙවෙයි!*");

    if (!q) return reply("❌ *අංකය ලබා දෙන්න (Ex: .add 947xxxxxxxx).*");
    let user = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    try {
        await zanta.groupParticipantsUpdate(from, [user], "add");
        let desc = `\n╭━─━─━─━─━─━─━─━╮\n┃    *MEMBER ADDED*\n╰━─━─━─━─━─━─━─━╯\n\n👤 *User:* @${user.split('@')[0]}\n✅ *Status:* Added Success\n👮 *By:* @${sender.split('@')[0]}`;
        await zanta.sendMessage(from, { text: desc, mentions: [user, sender] }, { quoted: mek });
    } catch (e) { reply("❌ එක් කිරීමට නොහැක. (Privacy Settings හෝ අංකය වැරදියි)"); }
});

// --- 🔗 INVITE ---
cmd({
  pattern: "invite", alias: ["link"], react: "🔗", category: "group", filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup, groupMetadata, groupAdmins }) => {
  try {
      if (!isGroup) return reply("❌ *Groups only.*");
      const adminDigitsList = (groupAdmins || []).map(ad => getLastDigits(ad));
      const botDigits = getLastDigits(zanta.user.lid || zanta.user.id);

      if (!adminDigitsList.includes(botDigits)) return reply("❌ *මාව Admin කරන්න!*");

      const code = await zanta.groupInviteCode(from);
      let ppUrl;
      try { ppUrl = await zanta.profilePictureUrl(from, 'image'); } catch { ppUrl = "https://store-images.s-microsoft.com/image/apps.8453.13655054093851568.4a371b72-2ce8-4bdb-9d83-be49894d3fa0.7f3687b9-847d-4f86-bb5c-c73259e2b38e?h=210"; }

      let desc = `\n╭━─━─━─━─━─━─━─━╮\n┃    *GROUP INVITE*\n╰━─━─━─━─━─━─━─━╯\n\n🎬 *Group:* ${groupMetadata.subject}\n🔗 *Link:* https://chat.whatsapp.com/${code}\n\n_Join using the link above!_`;
      await zanta.sendMessage(from, { image: { url: ppUrl }, caption: desc }, { quoted: mek });
  } catch (e) { reply("❌ Error: " + e.message); }
});

// --- 🔔 TAGALL ---
cmd({
    pattern: "tagall", alias: ["all"], react: "📢", category: "group", filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup, participants, groupAdmins, sender, isOwner, q }) => {
    if (!isGroup) return reply("❌ *Groups only.*");
    const perm = checkPerms(zanta, m, groupAdmins, isOwner, sender);
    if (perm === "not_admin") return reply("❌ *Admin Only!*");

    let txt = `\n╭━─━─━─━─━─━─━─━╮\n┃    *📢 TAG ALL MEMBERS*\n╰━─━─━─━─━─━─━─━╯\n\n📢 *Message:* ${q ? q : 'No message'}\n\n`;
    for (let mem of participants) { txt += `🔘 @${mem.id.split('@')[0]}\n`; }
    await zanta.sendMessage(from, { text: txt, mentions: participants.map(p => p.id) }, { quoted: mek });
});

// --- 👋 LEFT ---
cmd({
    pattern: "left", react: "👋", category: "group", filename: __filename,
}, async (zanta, mek, m, { from, isGroup, isOwner, reply }) => {
    if (!isGroup) return reply("❌ *Groups only.*");
    if (!isOwner) return reply("❌ *Owner Only!*");
    await reply("👋 *Goodbye! Leaving the group...*");
    await zanta.groupLeave(from);
});
