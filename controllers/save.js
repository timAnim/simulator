const exportExcel = require("../app/exportExcel.js");

module.exports = async body => {
    let res = {
        code: 200,
        msg: "操作成功",
    }

    if (!body.data ||
        !body.data.length ||
        body.data.length != 2) {
        res = {
            code: 500,
            msg: "操作失败",
        }
    }

    let result = await exportExcel(body.data, global.CONFIG.POINT_USER)
    if (!result) {
        res = {
            code: 500,
            msg: "操作失败",
        }
    }

    return res
}