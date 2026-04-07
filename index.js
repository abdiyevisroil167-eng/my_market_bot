const { Telegraf, Markup } = require('telegraf');
const http = require('http');

const bot = new Telegraf('8618779342:AAHUWVkWjptqG2bPnGk7er_tGhO9v_NAl2w');
const ADMIN_ID = 6995131511;
const PROVIDER_TOKEN = '398062629:TEST:999999999_F91D8F69C042267444B74CC0B3C747757EB0E065';

let carts = {};
let lastSpin = {};

// 1. HAQIQIY RASMLI MAHSULOTLAR
const menuData = {
    '🍕 Pitsalar': [
        { id: 'p1', name: 'Margarita', price: 45000, img: 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?w=600' },
        { id: 'p2', name: 'Peperoni', price: 55000, img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600' },
        { id: 'p3', name: 'Go\'shtli Mix', price: 65000, img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600' },
        { id: 'p4', name: 'Meksikancha', price: 60000, img: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600' },
        { id: 'p5', name: 'To\'rt fasl', price: 70000, img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600' },
        { id: 'p6', name: 'Qo\'ziqorinli', price: 48000, img: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600' }
    ],
    '🍔 Burgerlar': [
        { id: 'b1', name: 'Chizburger', price: 25000, img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600' },
        { id: 'b2', name: 'Gamburger', price: 22000, img: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600' },
        { id: 'b3', name: 'Dubl Burger', price: 35000, img: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=600' },
        { id: 'b4', name: 'Hot-Dog Katta', price: 15000, img: 'https://images.unsplash.com/photo-1541234007145-34f0821c024d?w=600' },
        { id: 'b5', name: 'Lavash', price: 30000, img: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600' }
    ],
    '🍟 Fast-Fud': [
        { id: 'f1', name: 'Fri Kichik', price: 10000, img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600' },
        { id: 'f2', name: 'Fri Katta', price: 16000, img: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=600' },
        { id: 'f3', name: 'Naggetslar', price: 18000, img: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600' },
        { id: 'f4', name: 'Tovuq qanotchalari', price: 28000, img: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600' }
    ],
    '🥤 Ichimliklar': [
        { id: 'i1', name: 'Coca-Cola 0.5', price: 7000, img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600' },
        { id: 'i2', name: 'Fanta 0.5', price: 7000, img: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=600' },
        { id: 'i3', name: 'Kofe Latte', price: 14000, img: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=600' },
        { id: 'i4', name: 'Suv 0.5', price: 3000, img: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600' }
    ],
    '🥗 Salatlar': [
        { id: 's1', name: 'Sezar', price: 25000, img: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600' },
        { id: 's2', name: 'Grecheskiy', price: 22000, img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600' }
    ],
    '🍰 Shirinliklar': [
        { id: 'd1', name: 'Cheesecake', price: 22000, img: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600' },
        { id: 'd2', name: 'Medovik', price: 15000, img: 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=600' }
    ]
};

const prizes = ["🎁 Tekin Coca-Cola", "🍟 Fri", "📉 5% chegirma", "📉 10% chegirma", "😢 Omad kelmadi"];

// 2. KLAVIATURA
const mainButtons = Markup.keyboard([
    ['🍽 Menyu', '🛒 Savat'],
    ['🎡 Omad g\'ildiragi', '👨‍💻 Bog\'lanish']
]).resize();

bot.start((ctx) => {
    carts[ctx.from.id] = [];
    ctx.reply(`Salom ${ctx.from.first_name}! Eldor Food-ga xush kelibsiz.`, mainButtons);
});

// 3. DINAMIK MENYU
bot.hears('🍽 Menyu', (ctx) => {
    const categoryButtons = Object.keys(menuData).map(cat => [cat]);
    categoryButtons.push(['⬅️ Orqaga']);
    ctx.reply("Bo'limni tanlang:", Markup.keyboard(categoryButtons).resize());
});

Object.keys(menuData).forEach(category => {
    bot.hears(category, async (ctx) => {
        const items = menuData[category];
        for (const item of items) {
            await ctx.replyWithPhoto(item.img, {
                caption: `✨ **${item.name}**\n💰 Narxi: ${item.price.toLocaleString()} so'm`,
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([Markup.button.callback("🛒 Savatga qo'shish", `add_${item.id}`)])
            });
        }
    });
});

// 4. SAVAT LOGIKASI
bot.action(/add_(.+)/, (ctx) => {
    const id = ctx.match[1];
    let found;
    Object.values(menuData).forEach(items => {
        const p = items.find(i => i.id === id);
        if (p) found = p;
    });

    if (!carts[ctx.from.id]) carts[ctx.from.id] = [];
    carts[ctx.from.id].push(found);
    ctx.answerCbQuery(`${found.name} qo'shildi! ✅`);
});

bot.hears('🛒 Savat', (ctx) => {
    const userCart = carts[ctx.from.id] || [];
    if (userCart.length === 0) return ctx.reply("Savat bo'sh! 🛒");

    let total = 0;
    let text = "🛒 Savat tarkibi:\n\n";
    userCart.forEach((item, i) => {
        text += `${i + 1}. ${item.name} - ${item.price.toLocaleString()} so'm\n`;
        total += item.price;
    });
    text += `\n💰 Jami: ${total.toLocaleString()} so'm`;

    ctx.reply(text, Markup.keyboard([
        [Markup.button.contactRequest('📱 Raqamni yuborish (Buyurtma)')],
        ['❌ Savatni tozalash', '⬅️ Orqaga']
    ]).resize());
});

bot.hears('❌ Savatni tozalash', (ctx) => {
    carts[ctx.from.id] = [];
    ctx.reply("Savat tozalandi! 🗑");
});

bot.hears('⬅️ Orqaga', (ctx) => ctx.reply("Asosiy menyu:", mainButtons));

// 5. OMAD G'ILDIRAGI
bot.hears('🎡 Omad g\'ildiragi', (ctx) => {
    const userId = ctx.from.id;
    const now = Date.now();
    if (lastSpin[userId] && (now - lastSpin[userId] < 24 * 60 * 60 * 1000)) {
        return ctx.reply("Siz bugun o'z omadingizni sinab ko'rdingiz. Ertaga qaytib keling! ⛔️");
    }
    ctx.reply("🎡 G'ildirak aylanmoqda...");
    setTimeout(() => {
        const win = prizes[Math.floor(Math.random() * prizes.length)];
        lastSpin[userId] = now;
        ctx.reply(`🎉 NATIJA: ${win}`);
        bot.telegram.sendMessage(ADMIN_ID, `🎰 OMAD G'ILDIRAGI:\nFoydalanuvchi: ${ctx.from.first_name}\nYutuq: ${win}`);
    }, 2000);
});

// 6. TO'LOV VA ADMINGA HABAR
bot.on('contact', async (ctx) => {
    const userCart = carts[ctx.from.id] || [];
    if (userCart.length === 0) return ctx.reply("Savat bo'sh!");

    let total = userCart.reduce((sum, f) => sum + f.price, 0);
    let itemsList = userCart.map(i => i.name).join(', ');

    // Adminga zakazni yuborish
    bot.telegram.sendMessage(ADMIN_ID, `🆕 YANGI BUYURTMA!\n👤 Mijoz: ${ctx.from.first_name}\n📞 Tel: ${ctx.message.contact.phone_number}\n🛍 Mahsulotlar: ${itemsList}\n💰 Jami: ${total.toLocaleString()} so'm`);

    // To'lov hisobi
    await ctx.replyWithInvoice({
        title: 'Eldor Food',
        description: 'Buyurtmangiz uchun to\'lov qiling',
        payload: `order_${ctx.from.id}`,
        provider_token: PROVIDER_TOKEN,
        currency: 'UZS',
        prices: [{ label: 'Jami', amount: total * 100 }], // Tiynlarda bo'lishi kerak
        start_parameter: 'pay'
    });
});

bot.on('pre_checkout_query', (ctx) => ctx.answerPreCheckoutQuery(true));
bot.on('successful_payment', (ctx) => {
    ctx.reply("To'lov muvaffaqiyatli amalga oshirildi! Buyurtmangiz tayyorlanmoqda. ✅", mainButtons);
    carts[ctx.from.id] = [];
});

bot.launch();

// Render uchun kichik server
http.createServer((req, res) => {
    res.write('Bot is running...');
    res.end();
}).listen(process.env.PORT || 8080);