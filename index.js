#!/usr/bin/env node
const TelegramBot = require('node-telegram-bot-api');
const submitCards = require('./runner');
const { TELEGRAM_TOKEN, CHAT_ID } = require('./config');

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

console.log(`🤖 Bot đã khởi chạy. Gửi /addcards [JSON] vào Telegram để bắt đầu.`);

bot.onText(/\/addcards (.+)/, async (msg, match) => {
  const jsonRaw = match[1];
  let cards;
  try {
    cards = JSON.parse(jsonRaw);
    if (!Array.isArray(cards)) throw "Not an array";
  } catch {
    return bot.sendMessage(msg.chat.id, '❌ JSON không hợp lệ. Gửi danh sách mảng.');
  }

  await bot.sendMessage(msg.chat.id, `🔄 Bắt đầu xử lý ${cards.length} thẻ...`);
  await submitCards(cards, bot, msg.chat.id);
});