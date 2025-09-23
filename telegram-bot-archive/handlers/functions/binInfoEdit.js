const axios = require("axios");

module.exports = async (number) => {
    try {
        const response = await axios.get(`https://xbins.cc/api/bins/${number}`);
        const data = response.data;

        return `${data.brand ? `\n- Бренд: <b>${data.brand}</b>` : ''}${data.country ? `\n- Страна: <b>${data.country_flag} ${data.country_name}</b>` : ''}${data.bank ? `\n- Банк: <b>${data.bank}</b>` : ''}${data.level ? `\n- Уровень: <b>${data.level}</b>` : ''}${data.type ? `\n- Тип: <b>${data.type}</b>` : ''}\n`;
    } catch (err) {
        return '';
    }
};
