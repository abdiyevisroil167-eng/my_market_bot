const { Telegraf, Markup } = require('telegraf');
const http = require('http');

// 1. ASOSIY KONFIGURATSIYA
const bot = new Telegraf('8618779342:AAHUWVkWjptqG2bPnGk7er_tGhO9v_NAl2w');
const ADMIN_ID = 6995131511;
const PROVIDER_TOKEN = '398062629:TEST:999999999_F91D8F69C042267444B74CC0B3C747757EB0E065';

// Ma'lumotlar bazasi (vaqtinchalik)
let users = new Set();
let carts = {};
let lastSpin = {}; // Kim qachon g'ildirakni aylantirganini saqlaydi

const foods = [
    { id: 'burger', name: '🍔 Burger', price: 25000, img: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500' },
    { id: 'pitsa', name: '🍕 Pitsa', price: 50000, img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500' },
    { id: 'cola', name: '🥤 Coca-Cola', price: 10000, img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500' }
];

const prizes = [
    "🎁 Tekin Coca-Cola",
    "🍟 Fri sovg'a",
    "📉 5% chegirma",
    "📉 10% chegirma",
    "😢 Afsus, bu safar omad kelmadi"
];

// 2. KLAVIATURA (Tugmalar)
const mainButtons = Markup.keyboard([
    ['🍽 Menyu', '🛒 Savat'],
    ['🎡 Omad g\'ildiragi', '👨‍💻 Bog\'lanish']
]).resize();

// 3. START BUYRUG'I
bot.start((ctx) => {
    users.add(ctx.from.id);
    carts[ctx.from.id] = [];
    ctx.reply(`Salom ${ctx.from.first_name}! Eldor Food-ga xush kelibsiz.`, mainButtons);
});

// 4. OMAD G'ILDIRAGI (Yangi funksiya)
bot.hears('🎡 Omad g\'ildiragi', (ctx) => {
    const userId = ctx.from.id;
    const now = Date.now();
    const cooldown = 24 * 60 * 60 * 1000; // 24 soat

    if (lastSpin[userId] && (now - lastSpin[userId] < cooldown)) {
        return ctx.reply("Siz bugun o'ynab bo'ldingiz! ⛔️ Ertaga yana keling.");
    }

    ctx.reply("🎡 G'ildirak aylanmoqda...");

    setTimeout(() => {
        const win = prizes[Math.floor(Math.random() * prizes.length)];
        lastSpin[userId] = now;

        ctx.reply(`🎉 NATIJA: \n\n${win}\n\nKeyingi buyurtmada buni adminga ayting!`);
        bot.telegram.sendMessage(ADMIN_ID, `🎰 YUTUQ: ${ctx.from.first_name} - ${win}`);
    }, 2000);
});

// 5. MENYU VA SAVAT
bot.hears('🍽 Menyu', async (ctx) => {
    for (const food of foods) {
        await ctx.replyWithPhoto(food.img, {
            caption: `${food.name}\nNarxi: ${food.price} so'm`,
            ...Markup.inlineKeyboard([Markup.button.callback("🛒 Qo'shish", `add_${food.id}`)])
        });
    }
});

bot.action(/add_(.+)/, (ctx) => {
    const foodId = ctx.match[1];
    const food = foods.find(f => f.id === foodId);
    if (!carts[ctx.from.id]) carts[ctx.from.id] = [];
    carts[ctx.from.id].push(food);
    ctx.answerCbQuery(`${food.name} qo'shildi! ✅`);
});

bot.hears('🛒 Savat', (ctx) => {
    const userCart = carts[ctx.from.id] || [];
    if (userCart.length === 0) return ctx.reply("Savat bo'sh! 🛒");

    let total = userCart.reduce((sum, f) => sum + f.price, 0);
    ctx.reply(`Jami: ${total} so'm.\nTo'lov uchun raqamingizni yuboring:`,
        Markup.keyboard([[Markup.button.contactRequest('📱 Raqamni yuborish')]]).resize());
});

// 6. TO'LOV TIZIMI
bot.on('contact', async (ctx) => {
    const userCart = carts[ctx.from.id] || [];
    let total = userCart.reduce((sum, f) => sum + f.price, 0);

    await ctx.replyWithInvoice({
        title: 'Eldor Food',
        description: 'Buyurtma uchun to\'lov',
        payload: `order_${ctx.from.id}`,
        provider_token: PROVIDER_TOKEN,
        currency: 'UZS',
        prices: [{ label: 'Jami', amount: total * 100 }],
        start_parameter: 'test'
    });
});

bot.on('pre_checkout_query', (ctx) => ctx.answerPreCheckoutQuery(true));
bot.on('successful_payment', (ctx) => {
    ctx.reply("To'lov qabul qilindi! ✅");
    carts[ctx.from.id] = [];
});

// 7. SERVERNI ISHGA TUSHIRISH
bot.launch();
http.createServer((req, res) => { res.write('OK'); res.end(); }).listen(process.env.PORT || 8080);