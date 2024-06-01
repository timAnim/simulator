const exportExcel = require("../app/exportExcel.js");

module.exports = async function (body) {
    let result = await exportExcel(body.data, global.CONFIG.DRIVER_USER)
    
    if (!result) return {
        code: 500,
        msg: 'driver.xlsx被打开, 关闭后重试',
        data: null
    }

    return {
        code: 200,
        msg: '操作成功',
        data: global.CONFIG.DRIVER_USER
    }
}