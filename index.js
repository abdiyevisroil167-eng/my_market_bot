const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf('8618779342:AAHUWVkWjptqG2bPnGk7er_tGhO9v_NAl2w');

const ADMIN_ID = 6995131511;

// Ma'lumotlarni saqlash
let users = new Set();
let blackList = new Set();
let carts = {};

const foods = [
    { id: 'burger', name: '🍔 Burger', price: 25000, img: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500' },
    { id: 'pitsa', name: '🍕 Pitsa', price: 50000, img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500' },
    { id: 'cola', name: '🥤 Coca-Cola', price: 10000, img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500' },
    { id: 'fri', name: '🍟 Fri', price: 15000, img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500' }
];

// Blokni tekshirish middleware
bot.use((ctx, next) => {
    if (blackList.has(ctx.from.id)) {
        return ctx.reply("Siz ushbu botdan bloklangansiz! 🚫");
    }
    return next();
});

bot.start((ctx) => {
    users.add(ctx.from.id);
    carts[ctx.from.id] = [];
    ctx.reply(`Xush kelibsiz, ${ctx.from.first_name}!\n"Eldor Food" botidan eng mazali taomlarni buyurtma qiling.`,
        Markup.keyboard([
            ['🍽 Menyu', '🛒 Savat'],
            ['👨‍💻 Admin bilan bog\'lanish']
        ]).resize()
    );
});

// --- MENYU VA SAVAT ---
bot.hears('🍽 Menyu', async (ctx) => {
    for (const food of foods) {
        await ctx.replyWithPhoto(food.img, {
            caption: `📌 **${food.name}**\n💰 Narxi: ${food.price.toLocaleString()} so'm`,
            ...Markup.inlineKeyboard([Markup.button.callback(`🛒 Savatga qo'shish`, `add_${food.id}`)])
        });
    }
});

bot.action(/add_(.+)/, (ctx) => {
    const foodId = ctx.match[1];
    const food = foods.find(f => f.id === foodId);
    if (!carts[ctx.from.id]) carts[ctx.from.id] = [];

    if (carts[ctx.from.id].length < 2) {
        carts[ctx.from.id].push(food);
        ctx.answerCbQuery(`${food.name} savatga qo'shildi! ✅`);
    } else {
        ctx.answerCbQuery(`Maksimal 2 ta buyurtma mumkin! ⚠️`, { show_alert: true });
    }
});

bot.hears('🛒 Savat', (ctx) => {
    const userCart = carts[ctx.from.id] || [];
    if (userCart.length === 0) return ctx.reply("Savatchangiz bo'sh. 🛒");

    let text = "🛒 Sizning savatchangiz:\n\n";
    let total = 0;
    userCart.forEach((f, i) => {
        text += `${i + 1}. ${f.name} - ${f.price.toLocaleString()} so'm\n`;
        total += f.price;
    });
    text += `\n💰 Jami: ${total.toLocaleString()} so'm\n\nTasdiqlash uchun raqamingizni yuboring:`;

    ctx.reply(text, Markup.keyboard([[Markup.button.contactRequest('📱 Raqamni yuborish')], ['❌ Savatni tozalash']]).resize());
});

bot.hears('❌ Savatni tozalash', (ctx) => {
    carts[ctx.from.id] = [];
    ctx.reply("Savat tozalandi. ✅", Markup.keyboard([['🍽 Menyu', '🛒 Savat']]).resize());
});

// --- BUYURTMA QABUL QILISH VA ADMINGA YUBORISH ---
bot.on('contact', async (ctx) => {
    const user = ctx.from;
    const phone = ctx.message.contact.phone_number;
    const userCart = carts[user.id] || [];

    if (userCart.length === 0) return ctx.reply("Savat bo'sh!");

    const orderList = userCart.map(f => f.name).join(", ");
    const adminMsg = `🔔 YANGI BUYURTMA!\n\n👤 Mijoz: ${user.first_name}\n📞 Tel: +${phone}\n🛍 Mahsulot: ${orderList}\n🆔 ID: ${user.id}`;

    await bot.telegram.sendMessage(ADMIN_ID, adminMsg,
        Markup.inlineKeyboard([Markup.button.callback("🚫 Bloklash", `block_${user.id}`)])
    );

    ctx.reply("Rahmat! Buyurtmangiz qabul qilindi. ✅", Markup.keyboard([['🍽 Menyu']]).resize());
    carts[user.id] = [];
});

// --- ADMIN PANEL FUNKSIYALARI ---
bot.command('admin', (ctx) => {
    if (ctx.from.id == ADMIN_ID) {
        ctx.reply("Boss, boshqaruv paneliga xush kelibsiz!",
            Markup.keyboard([['📊 Statistika', '📢 Reklama yuborish'], ['⬅️ Chiqish']]).resize()
        );
    }
});

bot.hears('📊 Statistika', (ctx) => {
    if (ctx.from.id == ADMIN_ID) {
        ctx.reply(`📈 Bot statistikasi:\n\n👥 Foydalanuvchilar: ${users.size} ta\n🚫 Bloklanganlar: ${blackList.size} ta`);
    }
});

bot.hears('📢 Reklama yuborish', (ctx) => {
    if (ctx.from.id == ADMIN_ID) {
        ctx.reply("Reklama yuborish uchun: \n`/send reklama matni` ko'rinishida yozing.");
    }
});

bot.command('send', (ctx) => {
    if (ctx.from.id == ADMIN_ID) {
        const text = ctx.message.text.split(' ').slice(1).join(' ');
        if (!text) return ctx.reply("Matn yozishni unutdingiz!");

        users.forEach(userId => {
            bot.telegram.sendMessage(userId, `📣 **ADMIN XABARI:**\n\n${text}`, { parse_mode: 'Markdown' })
                .catch(err => console.log(userId + " botni tark etgan."));
        });
        ctx.reply("Xabar hammaga yuborildi! 🚀");
    }
});

bot.action(/block_(.+)/, (ctx) => {
    const userId = parseInt(ctx.match[1]);
    blackList.add(userId);
    ctx.answerCbQuery("Bloklandi!");
    ctx.editMessageText(ctx.callbackQuery.message.text + "\n\n🚫 BLOKLANDI!");
});

bot.hears('⬅️ Chiqish', (ctx) => {
    ctx.reply("Admin paneldan chiqdingiz.", Markup.keyboard([['🍽 Menyu', '🛒 Savat']]).resize());
});

bot.launch();
console.log("Eldor Shop Pro 🚀 ishga tushdi!");

const http = require('http');
http.createServer((req, res) => {
    res.write('Bot is running!');
    res.end();
}).listen(process.env.PORT || 8080);