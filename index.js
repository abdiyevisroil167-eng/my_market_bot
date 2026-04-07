const { Telegraf, Markup } = require('telegraf');
const http = require('http');

const bot = new Telegraf('8618779342:AAHUWVkWjptqG2bPnGk7er_tGhO9v_NAl2w');
const ADMIN_ID = 6995131511;
const PROVIDER_TOKEN = '398062629:TEST:999999999_F91D8F69C042267444B74CC0B3C747757EB0E065';

let carts = {};
let lastSpin = {};

// 1. 50 TA MAHSULOTLI KATEGORIYALAR
const menuData = {
    '🍕 Pitsalar': [
        { id: 'p1', name: 'Margarita', price: 45000, img: 'https://picsum.photos/500/300?random=1' },
        { id: 'p2', name: 'Peperoni', price: 55000, img: 'https://picsum.photos/500/300?random=2' },
        { id: 'p3', name: 'Go\'shtli', price: 65000, img: 'https://picsum.photos/500/300?random=3' },
        { id: 'p4', name: 'Meksikancha', price: 60000, img: 'https://picsum.photos/500/300?random=4' },
        { id: 'p5', name: 'To\'rt fasl', price: 70000, img: 'https://picsum.photos/500/300?random=5' },
        { id: 'p6', name: 'Qo\'ziqorinli', price: 48000, img: 'https://picsum.photos/500/300?random=6' },
        { id: 'p7', name: 'Pishloqli', price: 42000, img: 'https://picsum.photos/500/300?random=7' },
        { id: 'p8', name: 'Tovuqli', price: 52000, img: 'https://picsum.photos/500/300?random=8' }
    ],
    '🍔 Burgerlar': [
        { id: 'b1', name: 'Chizburger', price: 25000, img: 'https://picsum.photos/500/300?random=9' },
        { id: 'b2', name: 'Gamburger', price: 22000, img: 'https://picsum.photos/500/300?random=10' },
        { id: 'b3', name: 'Dubl Burger', price: 35000, img: 'https://picsum.photos/500/300?random=11' },
        { id: 'b4', name: 'Eldor Burger', price: 40000, img: 'https://picsum.photos/500/300?random=12' },
        { id: 'b5', name: 'Hot-Dog', price: 15000, img: 'https://picsum.photos/500/300?random=13' },
        { id: 'b6', name: 'Shaurma', price: 24000, img: 'https://picsum.photos/500/300?random=14' },
        { id: 'b7', name: 'Lavash Mini', price: 22000, img: 'https://picsum.photos/500/300?random=15' },
        { id: 'b8', name: 'Lavash Katta', price: 30000, img: 'https://picsum.photos/500/300?random=16' }
    ],
    '🍟 Fast-Fud': [
        { id: 'f1', name: 'Fri Kichik', price: 10000, img: 'https://picsum.photos/500/300?random=17' },
        { id: 'f2', name: 'Fri Katta', price: 16000, img: 'https://picsum.photos/500/300?random=18' },
        { id: 'f3', name: 'Naggetslar 6ta', price: 18000, img: 'https://picsum.photos/500/300?random=19' },
        { id: 'f4', name: 'Naggetslar 9ta', price: 25000, img: 'https://picsum.photos/500/300?random=20' },
        { id: 'f5', name: 'Kartoshka Derevnya', price: 14000, img: 'https://picsum.photos/500/300?random=21' },
        { id: 'f6', name: 'Tovuq qanotchalari', price: 28000, img: 'https://picsum.photos/500/300?random=22' },
        { id: 'f7', name: 'Sendvich', price: 15000, img: 'https://picsum.photos/500/300?random=23' },
        { id: 'f8', name: 'Pishloqli tayoqchalar', price: 12000, img: 'https://picsum.photos/500/300?random=24' }
    ],
    '🥤 Ichimliklar': [
        { id: 'i1', name: 'Cola 0.5L', price: 7000, img: 'https://picsum.photos/500/300?random=25' },
        { id: 'i2', name: 'Cola 1.5L', price: 13000, img: 'https://picsum.photos/500/300?random=26' },
        { id: 'i3', name: 'Fanta 0.5L', price: 7000, img: 'https://picsum.photos/500/300?random=27' },
        { id: 'i4', name: 'Pepsi 1.5L', price: 13000, img: 'https://picsum.photos/500/300?random=28' },
        { id: 'i5', name: 'Mors', price: 8000, img: 'https://picsum.photos/500/300?random=29' },
        { id: 'i6', name: 'Sharbat 1L', price: 15000, img: 'https://picsum.photos/500/300?random=30' },
        { id: 'i7', name: 'Kofe Latte', price: 14000, img: 'https://picsum.photos/500/300?random=31' },
        { id: 'i8', name: 'Choy Ko\'k', price: 4000, img: 'https://picsum.photos/500/300?random=32' },
        { id: 'i9', name: 'Suv 0.5L', price: 3000, img: 'https://picsum.photos/500/300?random=33' }
    ],
    '🥗 Salatlar': [
        { id: 's1', name: 'Sezar', price: 25000, img: 'https://picsum.photos/500/300?random=34' },
        { id: 's2', name: 'Grecheskiy', price: 22000, img: 'https://picsum.photos/500/300?random=35' },
        { id: 's3', name: 'Olivye', price: 18000, img: 'https://picsum.photos/500/300?random=36' },
        { id: 's4', name: 'Mujskoy Kapriz', price: 32000, img: 'https://picsum.photos/500/300?random=37' },
        { id: 's5', name: 'Achchiq-chuchuk', price: 10000, img: 'https://picsum.photos/500/300?random=38' },
        { id: 's6', name: 'Bahor', price: 15000, img: 'https://picsum.photos/500/300?random=39' },
        { id: 's7', name: 'Tovuqli salat', price: 24000, img: 'https://picsum.photos/500/300?random=40' }
    ],
    '🍰 Shirinliklar': [
        { id: 'd1', name: 'Medovik', price: 15000, img: 'https://picsum.photos/500/300?random=41' },
        { id: 'd2', name: 'Cheesecake', price: 22000, img: 'https://picsum.photos/500/300?random=42' },
        { id: 'd3', name: 'Muzqaymoq', price: 8000, img: 'https://picsum.photos/500/300?random=43' },
        { id: 'd4', name: 'Tiramisu', price: 25000, img: 'https://picsum.photos/500/300?random=44' },
        { id: 'd5', name: 'Napoleone', price: 18000, img: 'https://picsum.photos/500/300?random=45' },
        { id: 'd6', name: 'Eklayer', price: 7000, img: 'https://picsum.photos/500/300?random=46' },
        { id: 'd7', name: 'Vafli', price: 14000, img: 'https://picsum.photos/500/300?random=47' },
        { id: 'd8', name: 'Donut', price: 10000, img: 'https://picsum.photos/500/300?random=48' },
        { id: 'd9', name: 'Brauni', price: 16000, img: 'https://picsum.photos/500/300?random=49' },
        { id: 'd10', name: 'Mevali tort', price: 20000, img: 'https://picsum.photos/500/300?random=50' }
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

// 3. DINAMIK MENYU (Kategoriyalar)
bot.hears('🍽 Menyu', (ctx) => {
    const categoryButtons = Object.keys(menuData).map(cat => [cat]);
    categoryButtons.push(['⬅️ Orqaga']);
    ctx.reply("Bo'limni tanlang:", Markup.keyboard(categoryButtons).resize());
});

// Kategoriyani tanlaganda mahsulotlarni chiqarish
Object.keys(menuData).forEach(category => {
    bot.hears(category, async (ctx) => {
        const items = menuData[category];
        for (const item of items) {
            await ctx.replyWithPhoto(item.img, {
                caption: `✨ **${item.name}**\n💰 Narxi: ${item.price.toLocaleString()} so'm`,
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([Markup.button.callback("🛒 Qo'shish", `add_${item.id}`)])
            });
        }
    });
});

// 4. SAVATGA QO'SHISH
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
        [Markup.button.contactRequest('📱 Raqamni yuborish')],
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
        return ctx.reply("Ertaga qaytib keling! ⛔️");
    }
    ctx.reply("🎡 G'ildirak aylanmoqda...");
    setTimeout(() => {
        const win = prizes[Math.floor(Math.random() * prizes.length)];
        lastSpin[userId] = now;
        ctx.reply(`🎉 NATIJA: ${win}`);
        bot.telegram.sendMessage(ADMIN_ID, `🎰 YUTUQ: ${ctx.from.first_name} - ${win}`);
    }, 2000);
});

// 6. TO'LOV
bot.on('contact', async (ctx) => {
    const userCart = carts[ctx.from.id] || [];
    if (userCart.length === 0) return ctx.reply("Savat bo'sh!");
    let total = userCart.reduce((sum, f) => sum + f.price, 0);

    await ctx.replyWithInvoice({
        title: 'Eldor Food',
        description: 'Buyurtma uchun to\'lov',
        payload: `order_${ctx.from.id}`,
        provider_token: PROVIDER_TOKEN,
        currency: 'UZS',
        prices: [{ label: 'Jami', amount: total * 100 }],
        start_parameter: 'pay'
    });
});

bot.on('pre_checkout_query', (ctx) => ctx.answerPreCheckoutQuery(true));
bot.on('successful_payment', (ctx) => {
    ctx.reply("To'lov qabul qilindi! ✅");
    carts[ctx.from.id] = [];
});

bot.launch();
http.createServer((req, res) => { res.write('OK'); res.end(); }).listen(process.env.PORT || 8080);