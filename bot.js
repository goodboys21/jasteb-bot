const { Telegraf } = require('telegraf');
const fetch = require('node-fetch');

// Ganti dengan token bot Telegram kamu
const BOT_TOKEN = '7609084238:AAFnmFKncsghipzJ3KyVlNs62Ps7NXh4fqY';
const OWNER_ID = '7081489041'; // Ganti dengan ID Telegram Owner

const bot = new Telegraf(BOT_TOKEN);

const PANEL_URL = 'https://panelbananaezz.qzcmy.web.id/user/67b1ecc85934e/v4/mak.php';

let emailList = []; // Menyimpan daftar email sementara
let premiumUsers = []; // Menyimpan daftar pengguna premium

// Cek apakah pengguna premium
function isPremium(userId) {
    return premiumUsers.includes(userId);
}

// Cek apakah pengguna adalah owner
function isOwner(userId) {
    return userId.toString() === OWNER_ID;
}

// Perintah /start
bot.command('start', (ctx) => {
    ctx.reply(`
🤖 *Bot Jasteb Aktif!*
Gunakan perintah berikut:
🔹 /jasteb <email> <waktu> - Tambahkan email ke panel
🔹 /list - Lihat daftar email yang tersimpan
🔹 (Khusus Owner) /addprem <user_id>, /delprem <user_id>
`, { parse_mode: 'Markdown' });
});

// Perintah /addprem (HANYA OWNER)
bot.command('addprem', (ctx) => {
    const userId = ctx.from.id.toString();
    if (!isOwner(userId)) return ctx.reply('❌ Hanya Owner yang bisa menambah premium!');

    const targetId = ctx.message.text.split(' ')[1];
    if (!targetId) return ctx.reply('Format salah!\nGunakan: /addprem <user_id>');

    if (premiumUsers.includes(targetId)) {
        return ctx.reply('User ini sudah premium!');
    }

    premiumUsers.push(targetId);
    ctx.reply(`✅ User ID ${targetId} ditambahkan sebagai premium.`);
});

// Perintah /delprem (HANYA OWNER)
bot.command('delprem', (ctx) => {
    const userId = ctx.from.id.toString();
    if (!isOwner(userId)) return ctx.reply('❌ Hanya Owner yang bisa menghapus premium!');

    const targetId = ctx.message.text.split(' ')[1];
    if (!targetId) return ctx.reply('Format salah!\nGunakan: /delprem <user_id>');

    premiumUsers = premiumUsers.filter(id => id !== targetId);
    ctx.reply(`❌ User ID ${targetId} dihapus dari daftar premium.`);
});

// Perintah /jasteb untuk menambah email ke panel (HANYA PREMIUM)
bot.command('jasteb', async (ctx) => {
    const userId = ctx.from.id.toString();
    if (!isPremium(userId)) {
        return ctx.reply('❌ Kamu bukan pengguna premium!');
    }

    const args = ctx.message.text.split(' ').slice(1);
    if (args.length < 2) {
        return ctx.reply('Format salah!\nGunakan: /jasteb <email> <waktu (menit)>');
    }

    const email = args[0];
    const waktu = args[1];

    if (!email.includes('@') || isNaN(waktu)) {
        return ctx.reply('Format salah! Pastikan email valid dan waktu berupa angka.');
    }

    try {
        const response = await fetch(PANEL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `email=${email}&waktu=${waktu}`
        });

        if (response.ok) {
            emailList.push({ email, waktu, timestamp: new Date().toLocaleString() });
            ctx.reply(`✅ Email berhasil ditambahkan:\n📧 ${email}\n⏳ Waktu: ${waktu} menit`);
        } else {
            ctx.reply('❌ Gagal menambahkan email ke panel.');
        }
    } catch (error) {
        console.error(error);
        ctx.reply('❌ Terjadi kesalahan saat menambahkan email.');
    }
});

// Perintah /list untuk melihat daftar email (HANYA PREMIUM)
bot.command('list', (ctx) => {
    const userId = ctx.from.id.toString();
    if (!isPremium(userId)) {
        return ctx.reply('❌ Kamu bukan pengguna premium!');
    }

    if (emailList.length === 0) {
        return ctx.reply('📭 Tidak ada email yang tersimpan.');
    }

    let message = '📜 **Daftar Email Terdaftar:**\n';
    emailList.forEach((item, index) => {
        message += `\n${index + 1}. 📧 ${item.email}\n   ⏳ ${item.waktu} menit\n   🕒 ${item.timestamp}\n`;
    });

    ctx.reply(message, { parse_mode: 'Markdown' });
});

// Menjalankan bot
bot.launch().then(() => {
    console.log('Bot berhasil dijalankan!');
});

// Menangani error
process.on('uncaughtException', (err) => {
    console.error('Terjadi kesalahan:', err);
});
