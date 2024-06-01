const exportExcel = require("../app/exportExcel.js");

module.exports = async body => {
    await exportExcel(body.data, global.CONFIG.POINT_USER)

    // async 关键字返回的是异步对象
    return global.CONFIG.POINT_DOWNLOAD
}