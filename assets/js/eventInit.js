
function eventInit() {
    let importHdl = document.getElementById("Luckyexcel-demo-file");
    let saveasBtn = document.getElementById("Luckyexcel-downlod-file");
    let saveBtn = document.getElementById("Luckyexcel-save-file")
    let sendBtn = document.getElementById("send-btn");
    let importBtn = document.getElementById("Luckyexcel-import");
    let driverBtn = document.getElementById("Luckyexcel-driver");

    importHdl.addEventListener("change", function (ev) {
        var files = ev.target.files;
        if (files == null || files.length == 0) return notice("请检查选择的文件")

        let name = files[0].name;
        let suffixArr = name.split("."),
            suffix = suffixArr[suffixArr.length - 1];
        if (suffix != "xlsx") return notice("仅支持xlsx文件类型")

        LuckyExcel.transformExcelToLucky(
            files[0],
            function (exportJson, luckysheetfl) {
                if (!exportJson.sheets || !checkluckysheetJson(exportJson.sheets)) return notice('请检查文件格式')
                window.luckysheet.destroy();
                window.luckysheetOptions.data = exportJson.sheets
                window.luckysheetOptions.title = exportJson.info.name
                window.luckysheet.create(window.luckysheetOptions);
                notice('操作成功')
                eventInit()
            }
        );
    });

    importBtn.addEventListener("click", function (ev) {
        importHdl.click();
    });

    saveasBtn.addEventListener("click", function (ev) {
        downloadByUrl("/usr/point", "point.xlsx");
    });

    sendBtn.addEventListener("click", function () {
        let point_data;
        if (luckysheet.sheetmanage.getCurSheet() == 1) {
            point_data = sendPointSheet(luckysheet.getAllSheets()[0])
        } else {
            point_data = sendDCSheet(luckysheet.getAllSheets()[1])
        }
        ajax("/publish", point_data, "POST", function (data) {
            if (data.code != 200) return notice('发布失败')
            notice('发布成功')
        });
    });

    saveBtn.addEventListener("click", function (ev) {
        console.log(ev.target)
        luckysheetfl = luckysheet.getluckysheetfile()

        if (!checkluckysheetJson(luckysheetfl)) return notice('请检查文件格式')

        luckysheetfl.forEach(fl => {
            fl.data = luckysheet.getSheetData({ order: fl.order })
        })
        ajax("/save", luckysheetfl, "POST", function (res) {
            console.log(res);
            notice('操作成功')
        })
    });

    driverBtn.addEventListener("click", genDriver);

    document.body.addEventListener('keydown', function (evt) {
        if (evt.ctrlKey && evt.key == "s") {
            saveBtn.click()
        }
    })

}

function sendDCSheet(sheet) {
    let point_arr = [];
    let resource_id, value, type_id, sort_id;

    sheet.data.forEach((row, i) => {

        if (i <= 4) return false
        resource_id = luckysheet.getCellValue(i, 1);
        if (!resource_id) return false
        console.log(resource_id)
        value = luckysheet.getCellValue(i, 3);
        type_id = resource_id.split("_")[2];
        sort_id = resource_id.split("_")[3];

        point_arr.push({
            sort_id,
            value: value + '',
            resource_id,
            status: 1,
            timestamp: Math.floor(Date.now() / 1000),
            standard_id: `${type_id}_${sort_id}_0`,
        });
    })

    let dev_id = point_arr[0]['resource_id'].split("_")[1];

    return {
        value: "1",
        resource_id: "0_" + dev_id,
        values: point_arr,
    };
}

function sendPointSheet(sheet) {
    let point_arr = dataTransfer(sheet).resArr;

    // console.log(point_arr)

    let res = [];
    let dev_id = point_arr[0][1].split("_")[1];

    point_arr.forEach((point) => {
        // 0_19920_1_1_0
        let resource_id = point[1];
        let value = point[2] + "";
        let type_id = resource_id.split("_")[2];
        let sort_id = resource_id.split("_")[3];

        res.push({
            sort_id,
            value,
            resource_id,
            status: 1,
            timestamp: Math.floor(Date.now() / 1000),
            standard_id: `${type_id}_${sort_id}_0`,
        });
    });

    return {
        value: "1",
        resource_id: "0_" + dev_id,
        values: res,
    };
}

function downloadByUrl(url, name) {
    fetch(url, {
        method: "GET",
    })
        .then((res) => res.blob())
        .then((blob) => {
            // 生成 Blob URL
            const url = URL.createObjectURL(blob);

            // 创建隐藏的链接并点击触发下载
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = name;
            document.body.appendChild(a);
            a.click();

            // 释放 Blob URL
            URL.revokeObjectURL(url);
        })
        .catch((error) => {
            console.error("下载文件时发生错误:", error);
        });
}

function genDriver(ev) {
    if (!checkluckysheetJson(luckysheet.getAllSheets())) {
        console.log(luckysheet.getAllSheets())
        return notice("请检查数据")
    }
    let arr = luckysheet.getAllSheets()[1].data

    let resArr = [];
    let th = [
        "序号",
        "协议测点名称",
        "标准测点名称",
        "变比(乘法）",
        "解析函数",
        "转换函数",
        "状态映射",
        "功能码",
        "寄存器号",
        "寄存器别名",
        "bit位",
        "标准化ID",
        "单位",
        "数据类型",
        "是否展示",
        "优先级",
    ];
    // let standard_id = `${arr[2][3].v}_${arr[3][3].v}_${arr[4][3].v}`
    resArr.push(th);
    arr.forEach((ele, i) => {
        if (i <= 4) return false
        if (!ele[2]) return false

        resArr[i - 4] = [
            i - 4,
            ele[0].v + ele[2].v,
            ele[2].v,
            "",
            "",
            "",
            "",
            "04",
            i - 5 + "",
            "",
            "",
            `${arr[2][3].v}_${i - 4}_${arr[4][3].v}`,
            "", //此处为单位，之后需要加进去
            "float",
            "",
            "",
        ];
    });
    let driver = [];

    for (let r = 0; r < resArr.length; r++) {
        for (let c = 0; c < resArr[r].length; c++) {
            driver.push({
                "r": r,
                "c": c,
                "v": {
                    "ct": {
                        "fa": "General",
                        "t": "s"
                    },
                    "fs": 13,
                    "fc": "#000000",
                    "ff": "宋体",
                    "ht": 0,
                    "vt": 0,
                    "tb": 1,
                    "v": resArr[r][c],
                    "qp": 1
                }
            });
        }
    }

    LuckyExcel.transformExcelToLuckyByUrl(
        "/usr/driver",
        'driver',
        function (exportJson, luckysheetfile) {
            if (
                !exportJson.sheets ||
                !exportJson.sheets.length ||
                exportJson.sheets[0].name != "设备信息表"
            ) {
                console.log(exportJson.sheets)
                return notice("请检查驱动文件模板")
            }

            exportJson.sheets.forEach(sheet => {
                sheet.data = tranCelldataToData(sheet.celldata);
            })

            exportJson.sheets[1].celldata = driver;
            exportJson.sheets[1].data = tranCelldataToData(driver);

            ajax("/driver", exportJson.sheets, "POST", function (res) {
                if (res.code != 200) return notice(res.msg)
                downloadByUrl("/usr/driver", "driver.xlsx");
            })
        }
    );

    function tranCelldataToData(celldata) {
        let resArr = [];
        celldata.forEach(cell => {
            if (!resArr[cell.r]) {
                resArr[cell.r] = []
            }
            resArr[cell.r][cell.c] = cell.v
        })
        return resArr
    }
}

async function notice(msg) {
    let _notice = document.getElementById("simu-notice")
    _notice.innerText = msg
    _notice.setAttribute('status', "on")
    await wait(3000)
    _notice.setAttribute('status', "off")
}

async function wait(time) {
    return new Promise((resolve, reject) => {
        setTimeout(t => {
            resolve()
        }, time)
    })
}

function checkluckysheetJson(luckysheetfl) {

    if (!luckysheetfl ||
        !luckysheetfl.length ||
        luckysheetfl.length != 2 ||
        luckysheetfl[0].name != "测点模拟" ||
        luckysheetfl[1].name != "DC模型模拟"
    ) return false

    return true
}