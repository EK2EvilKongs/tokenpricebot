require('isomorphic-fetch');

//fetch price Coingecko
async function fetchPrice_coingecko(name) {
  const name_l = name.toLowerCase();
  const url = 'https://api.geckoterminal.com/api/v2/networks/polygon_pos/pools/0x96430bb97fb0221028869283aa09bbe2cdd3484d';

  let priceInfo = null;
  try {
    const response = await fetch(url);
    const res_data = await response.json();
    priceInfo = res_data;
  } catch (err) {
    console.log('Fetch Error :-S');
    throw err;
  }

  if (!priceInfo) {
    return;
  }

  const currentprice = parseFloat(priceInfo['prices'][1][1]).toFixed(12);

  return { price: currentprice, change: "" };
}

// Jupiter fetch price
async function fetchPrice(symbol) {
  const url = 'https://price.jup.ag/v1/price?id=' + symbol;

  try {
    const response = await fetch(url);
    const priceInfo = await response.json();

    if (priceInfo && priceInfo.data && priceInfo.data.price) {
      return { price: priceInfo.data.price, change: "" };
    } else {
      console.error('Error: Data or price not available in the response.');
      return null;
    }
  } catch (err) {
    console.error('Fetch Error:', err.message);
    throw err;
  }
}

//update the bot
async function updateBot(inputs, client) {
  let guilds = client.guilds.cache.map(x => x.id);

  for (let guild_id of guilds) {
    try {
      let guild = client.guilds.cache.get(guild_id);
      let member = guild.members.cache.get(client.user.id);

      if (inputs.USE_COINGECKO_PRICING) {
        let priceinfo = await fetchPrice_coingecko(inputs.TOKEN_NAME);
        if (priceinfo) {
          member.setNickname("$ " + priceinfo.price);
        } else {
          console.error('Error: Price information not available.');
        }
      } else {
        let priceinfo = await fetchPrice(inputs.TOKEN_SYMBOL);
        if (priceinfo) {
          member.setNickname("$ " + priceinfo.price);
          client.user.setActivity(inputs.WATCHING, { type: 'WATCHING' });
        } else {
          console.error('Error: Price information not available.');
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  return;
}

module.exports = {
  updateBot
};
