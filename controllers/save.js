const exportExcel = require("../app/exportExcel.js");


module.exports = async body => {
    await exportExcel(body.data, global.CONFIG.POINT_USER)

    return global.CONFIG.POINT_DOWNLOAD
}