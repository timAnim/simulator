const exportExcel = require("../app/exportExcel.js");

module.exports = async function (body) {
    await exportExcel(body.data, global.CONFIG.DRIVER_USER)

    return global.CONFIG.DRIVER_DOWNLOAD
}