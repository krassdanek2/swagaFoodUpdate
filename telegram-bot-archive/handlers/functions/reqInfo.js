const geoIp = require("geoip-lite");
const UAParser = require('ua-parser-js');
const {flag} = require("country-emoji");
const {getName} = require("country-list");

module.exports = async (req) => {
    try {
        var text = ``;
        if(!req) return text
        const ipInfo = await geoIp.lookup(req.headers['x-forwarded-for']);
        const userAgent = req.headers['user-agent'];

        const parser = new UAParser();
        const result = parser.setUA(userAgent).getResult();

        const deviceInfo = formatDeviceInfo(result);

        try {
            text += `${flag(ipInfo.country)} Страна: <b>${getName(ipInfo.country)}</b>`;
        } catch (err) {}
        text += `\n🖥 Устройство: ${deviceInfo}`;
        return `${text}` || '';
    } catch (err) {
        return "";
    }
};

function formatDeviceInfo(result) {
    const { os, browser } = result;

    let osInfo = `${os.name} (${os.version})`;
    let browserInfo = `${browser.name} (${browser.version})`;

    return `${osInfo}, ${browserInfo}`;
}
