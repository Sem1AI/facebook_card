const puppeteer = require('puppeteer');

async function submitCards(cards, bot, chatId) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://m.facebook.com/settings/payment');

  await bot.sendMessage(chatId, '🔐 Hãy login Facebook nếu chưa. Khi xong, gửi bất kỳ tin nhắn nào để tiếp tục.');

  return new Promise(resolve => {
    bot.once('message', async () => {
      try {
        const fb_dtsg = await page.$eval('input[name="fb_dtsg"]', el => el.value);
        const jazoest = await page.$eval('input[name="jazoest"]', el => el.value);

        const results = [];

        for (const c of cards) {
          const payload = new URLSearchParams({
            fb_dtsg,
            jazoest,
            card_number: c.number,
            expiry_month: c.expMonth,
            expiry_year: c.expYear,
            cvv: c.cvv,
            country: c.country,
            zip: c.zip,
            __a: '1'
          });

          try {
            const res = await page.evaluate(async (payloadStr) => {
              return await fetch("https://www.facebook.com/payments/add_credit_card/", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: payloadStr
              }).then(r => r.text());
            }, payload.toString());

            results.push(`✅ ${c.number.slice(-4)} thành công`);
          } catch {
            results.push(`❌ ${c.number.slice(-4)} lỗi`);
          }

          await new Promise(r => setTimeout(r, 1000));
        }

        await bot.sendMessage(chatId, `📦 Kết quả:\n` + results.join('\n'));
        await browser.close();
        resolve();
      } catch (err) {
        console.error(err);
        await bot.sendMessage(chatId, '❌ Lỗi khi lấy token Facebook.');
        await browser.close();
        resolve();
      }
    });
  });
}

module.exports = submitCards;