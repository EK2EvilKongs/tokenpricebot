const { Client, GatewayIntentBits } = require('discord.js');
const { ActivityType } = require('discord.js');
const axios = require('axios');
const { updateBot } = require('./updatePrice');
const keepAlive = require('./keepAlive.js');

const inputs = {
  USE_COINGECKO_PRICING: false,
  TOKEN_NAME: "",
  TOKEN_SYMBOL: "",
  API_URL: 'https://api.geckoterminal.com/api/v2/networks/polygon_pos/pools/0x96430bb97fb0221028869283aa09bbe2cdd3484d',
  WATCHING: 'WATCHING', // Agrega el tipo de actividad de "watching" aquí si es necesario.
};

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once('ready', async () => {
  console.log('¡Listo!');

  try {
    await updateBot(inputs, client);

    setInterval(async () => {
      await updateBot(inputs, client);
    }, 1000 * 60 * 60);

    await displayTokenPrice();
  } catch (error) {
    console.error('Error en el bot:', error.message);
  }
});

async function displayTokenPrice() {
  try {
    const response = await axios.get(inputs.API_URL);

    if (response.status === 200) {
      const tokenPriceUSD = response.data.data.attributes.base_token_price_usd;
      const priceChangePercentage = response.data.data.attributes.price_change_percentage.h24;

      console.log(`Precio del token (USD): ${tokenPriceUSD}`);
      console.log(`Cambio en porcentaje (24h): ${priceChangePercentage}%`);

      // Cambiar dinámicamente el nombre del bot con el precio del token
      client.user.setUsername(`$${tokenPriceUSD}`);

      // Actualizar la actividad del bot con el cambio en porcentaje
      const newActivity = `Change (24h): ${priceChangePercentage}%`;
      client.user.setActivity(newActivity, { type: ActivityType.Watching });

      // Puedes enviar esta información a tu canal de Discord o realizar otras acciones.
    } else {
      console.error('Error en la solicitud. Código de estado:', response.status);
    }
  } catch (error) {
    console.error('Error al obtener el precio del token:', error.message);
  }
}

keepAlive();

// Obtén los tokens desde las variables de entorno
const botToken = process.env.BOT_TOKEN;
const guildId = process.env.GUILD_ID;

if (!botToken || !guildId) {
  console.error('Error: BOT_TOKEN o GUILD_ID no está configurado en las variables de entorno.');
} else {
  client.login(botToken);
}
