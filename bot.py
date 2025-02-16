import asyncio
import logging
import requests
from aiogram import Bot, Dispatcher, types
from aiogram.types import Message

TOKEN = "7609084238:AAFnmFKncsghipzJ3KyVlNs62Ps7NXh4fqY"
URL_JASTEB = "https://panelbananaezz.qzcmy.web.id/user/67b1ecc85934e/v4/mak.php"

bot = Bot(token=TOKEN)
dp = Dispatcher()

# Tambahkan email ke web Jasteb
@dp.message_handler(commands=['jasteb'])
async def tambah_email(message: Message):
    try:
        args = message.text.split(" ")
        if len(args) != 3:
            await message.reply("Gunakan format: /jasteb email@example.com 60")
            return

        email, waktu = args[1], args[2]
        data = {"email": email, "waktu": waktu}
        response = requests.post(URL_JASTEB, data=data)

        if response.status_code == 200:
            await message.reply(f"✅ Email {email} berhasil ditambahkan selama {waktu} menit!")
        else:
            await message.reply("❌ Gagal menambahkan email!")
    except Exception as e:
        await message.reply(f"⚠ Error: {e}")

# Lihat daftar email
@dp.message_handler(commands=['list'])
async def list_email(message: Message):
    try:
        response = requests.get(URL_JASTEB)
        if response.status_code == 200:
            await message.reply(f"📧 Daftar Email:\n{response.text}")
        else:
            await message.reply("❌ Gagal mengambil daftar email!")
    except Exception as e:
        await message.reply(f"⚠ Error: {e}")

# Jalankan bot
async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
