
// 初始化仅第一次执行
function initSimuData(luckysheet) {
    // 初始的sheet
    luckysheet.setSheetActive(0)
    luckysheet.setHorizontalFrozen(false)

    // 切换到模拟器页面
    luckysheet.setSheetActive(1)
    luckysheet.setHorizontalFrozen(false)
    setStyle()
    setColumnWidth(luckysheet.getAllSheets()[1])

    refreshDCSheet()
}

// 设置值
function refreshDCSheet() {
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

    // console.log(dev_id, point_type, start_id, additional_id)

    let opt = {
        ct: {
            fa: "0.00",
            t: "n",
        }
    }

    for (const key in resObj) {

        for (let i = 0; i < resArr.length; i++) {

            let row = resArr[i]

            // 前四行是测点信息
            point_id = `${dev_id}_${point_type}_${start_id + i - 4}_${additional_id}`

            // 针对第一列的每一个分类创建一个对象
            if (!window[row[0]]) window[row[0]] = {};

            // 全局对象赋值
            if (!row[2]) continue
            window[row[0]][row[2]] = row[3];


            // 校验测点ID，从个第三行开始
            if (i > 4 && point_id) {
                luckysheet.setCellValue(i, 1, point_id, { isRefresh: false });
            }

            // 针对实时值行需要根据表达式计算
            if (row[4] && row[4] != '-') {
                // console.log(luckysheet.getCellValue(i, row[5], { type: "m" }))
                try {
                    window[row[0]][row[2]] = eval(row[4])
                } catch (error) {
                    console.log(`【公式错误】${row[0]}-${row[2]}——${row[4]}`)
                }
                // if (!window[row[0]][row[2]]) console.log(`${row[0]}${row[2]}公式：${row[4]}出现错误`)
                // continue
                // opt.v = window[row[0]][row[2]] || 0
                luckysheet.setCellValue(i + 1, 3, window[row[0]][row[2]], { isRefresh: false });
            }
        };
    }

    // 最后调一次视图更新
    luckysheet.setCellValue(0, 0, '分类', { isRefresh: true });
}

// 设置样式
function setStyle() {
    console.log('setStyle')

    let sheet = luckysheet.getAllSheets()[1]

    let opt

    let ref = {
        isRefresh: false
    }
    let cell, val;
    let precision;

    for (let i = 0; i < sheet.celldata.length; i++) {
        opt = {
            ct: {
                fa: "General",
                t: "g",
            },
            ff: '宋体'
        }

        cell = sheet.celldata[i];
        val = luckysheet.getCellValue(cell.r, cell.c, { type: "m" })

        // 需要去掉所有空格
        if (val && val.replace) val = val.replace(/\s/g, '')

        // 针对第二列转换成数值，前五行转成字符串
        if (cell.c == 3 && cell.r > 4) {

            // 过滤没有值
            if (!val) continue
            // precision = luckysheet.getCellValue(cell.r, 5, { type: "m" })
            // 保留两位小数
            opt.ct = {
                fa: "0.00",
                t: "n",
            }

            opt.v = val
            opt.m = val
            luckysheet.setCellValue(cell.r, cell.c, opt, ref)
        } else if (cell.c == 5 && cell.r > 4) {
            precision = luckysheet.getCellValue(cell.r, 5, { type: "m" }) || '0.00'

            luckysheet.setCellValue(cell.r, 3, {
                ct: {
                    fa: precision,
                    t: "n",
                }
            }, ref)

            // 不处理精度列
        } else {
            opt.v = val
            opt.m = val
            luckysheet.setCellValue(cell.r, cell.c, opt, ref)
        }
    };
}

var setColumnWidth = function (worksheet) {
    let columnwidth = worksheet.config.columnWidth
    for (let key in columnwidth) {
        worksheet.getcolumn(parseInt(key) + 1).width = columnWidth[key] / 7.5
    }
}

// 数据预处理
function dataTransfer(sheet) {
    console.log('dataTransfer')
    const resObj = {};
    const resArr = [];

    for (let i = 0; i < sheet.celldata.length; i++) {
        const cell = sheet.celldata[i];

        let val = luckysheet.getCellValue(cell.r, cell.c)

        // // 需要去掉所有空格

        // 提取第一列所有的分组
        if (cell.c == 0 && val && val.replace) {
            val = val.replace(/\s/g, '')
            resObj[val] = true;
        }
        delete resObj['分类']
        delete resObj['设备']

        // 将fl转换为二维数组便于遍历
        if (!resArr[cell.r]) resArr[cell.r] = [];
        resArr[cell.r][cell.c] = val;
    };

    return {
        resObj,
        resArr: resArr.slice(1)
    };

}