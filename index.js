// index.js
require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');

const app = express();
app.get('/', (req, res) => res.send('Bot is online'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Webserver listening on port ${PORT}`));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // required to read message content
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

const PREFIX = '!';

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Example commands: !hello, !embed <optional title>, !send <USER_ID> <message>, !announce <text>
client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;

  // Only commands with prefix
  if (!msg.content.startsWith(PREFIX)) return;
  const args = msg.content.slice(PREFIX.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  if (cmd === 'hello') {
    return msg.reply("👋 Hey! I'm alive.");
  }

  if (cmd === 'embed') {
    const title = args.join(' ') || 'Example Embed';
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription('This is an embed created by the bot')
      .setTimestamp()
      .setFooter({ text: `Requested by ${msg.author.tag}` });
    return msg.channel.send({ embeds: [embed] });
  }

  if (cmd === 'send') {
    // usage: !send <USER_ID> <message...>
    const ownerId = process.env.OWNER_ID;
    if (!ownerId) return msg.reply('OWNER_ID not set in .env');
    if (msg.author.id !== ownerId) return msg.reply('❌ Only the owner can use this.');

    const userId = args.shift();
    const text = args.join(' ');
    if (!userId || !text) return msg.reply('Usage: !send <USER_ID> <message>');
    try {
      const user = await client.users.fetch(userId);
      await user.send(text);
      return msg.reply(`✅ Sent DM to <@${userId}>`);
    } catch (err) {
      console.error(err);
      return msg.reply('⚠️ Failed to send. Check the ID and bot permissions.');
    }
  }

  if (cmd === 'announce') {
    // usage: !announce <text> -> forwards to #alerts if exists
    const text = args.join(' ');
    if (!text) return msg.reply('Usage: !announce <text>');
    const target = msg.guild.channels.cache.find(c => c.name === 'alerts' && typeof c.send === 'function');
    if (!target) return msg.reply('No #alerts channel found.');
    await target.send(`📢 Announcement from ${msg.author.tag}: ${text}`);
    return msg.reply('✅ Announced to #alerts');
  }
});

client.login(process.env.BOT_TOKEN);

