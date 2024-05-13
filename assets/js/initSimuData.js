
function initSimuData(luckysheet) {

    // 切换到模拟器页面
    luckysheet.setSheetActive(1)
    refreshDCSheet()

    // 初始的sheet
    luckysheet.setSheetActive(0)
}

function refreshDCSheet() {
    window.updateLocker = true
    console.log('refreshDCSheet')

    let dev_id,  // 设备id
        point_type, // 测点类型
        start_id,  // 起始id
        additional_id,  // 附加
        point_id  // 附加

    // 数据预处理
    let { resArr, resObj } = dataTransfer(luckysheet.getAllSheets()[1])
    dev_id = luckysheet.getCellValue(1, 3)
    point_type = luckysheet.getCellValue(2, 3)
    start_id = parseInt(luckysheet.getCellValue(3, 3))
    additional_id = luckysheet.getCellValue(4, 3)

    console.log(dev_id, point_type, start_id, additional_id)

    // 在lucky中，r和c下标是1
    for (const key in resObj) {

        for (let i = 0; i < resArr.length; i++) {

            let row = resArr[i]

            // 前四行是测点信息
            point_id = `${dev_id}_${point_type}_${start_id + i - 4}_${additional_id}`

            // 针对第一列的每一个分类创建一个对象
            if (!window[row[0]]) window[row[0]] = {};

            // 全局对象赋值
            window[row[0]][row[2]] = row[3];

            // 校验测点ID，从个第三行开始
            if (i >= 4) {
                luckysheet.setCellValue(i + 1, 1, point_id, { isRefresh: false });
            }

            // 针对实时值行需要根据表达式计算
            if (row[4] && row[4] != '-') {
                try {
                    window[row[0]][row[2]] = eval(row[4])
                } catch (error) {

                }

                luckysheet.setCellValue(i + 1, 3, window[row[0]][row[2]], { isRefresh: false });
            }
        };
    }

    // window.updateLocker = false
    // initSimuData()



}


function dataTransfer(sheet) {
    console.log('dataTransfer')
    const resObj = {};
    const resArr = [];

    for (let i = 0; i < sheet.celldata.length; i++) {
        const cell = sheet.celldata[i];

        luckysheet.setCellFormat(cell.r, cell.c, 'ff', '宋体')

        let val = luckysheet.getCellValue(cell.r, cell.c)

        // 需要去掉所有空格
        if (val && val.replace) {
            val = val.replace(/\s/g, '')
            luckysheet.setCellValue(cell.r, cell.c, val, { isRefresh: false })
        }

        // 针对第二列转换成数值
        if (cell.c == 3) {

            // 前五行转成字符串
            if (cell.r < 5) {
                luckysheet.setCellValue(cell.r, cell.c, val, { isRefresh: false })
            } else {
                // 其它行转成数值
                luckysheet.setCellFormat(cell.r, cell.c, 'ct', {
                    fa: "0.00",
                    t: "n",
                })
                // 保留两位小数
                luckysheet.setCellValue(cell.r, cell.c, parseFloat(parseFloat(val).toFixed(2)), { isRefresh: false })

            }
        }

        // 提取第一列所有的分组
        if (cell.c == 0) resObj[val] = true;
        delete resObj['分类']
        delete resObj['设备']

        // 将fl转换为二维数组便于便利
        if (!resArr[cell.r]) resArr[cell.r] = [];
        resArr[cell.r][cell.c] = val;
    };

    return {
        resObj,
        resArr: resArr.slice(1)
    };

}