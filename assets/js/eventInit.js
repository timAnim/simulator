
function eventInit() {
    let upload = document.getElementById("Luckyexcel-demo-file");
    let downlodDemo = document.getElementById("Luckyexcel-downlod-file");
    let saveBtn = document.getElementById("Luckyexcel-save-file")
    let sendBtn = document.getElementById("send-btn");
    let uploadBtn = document.getElementById("Luckyexcel-import");
    let driverBtn = document.getElementById("Luckyexcel-driver");

    if (!upload) return false

    upload.addEventListener("change", function (evt) {
        var files = evt.target.files;
        if (files == null || files.length == 0) {
            alert("No files wait for import");
            return;
        }

        let name = files[0].name;
        let suffixArr = name.split("."),
            suffix = suffixArr[suffixArr.length - 1];
        if (suffix != "xlsx") {
            alert("Currently only supports the import of xlsx files");
            return;
        }
        LuckyExcel.transformExcelToLucky(
            files[0],
            function (exportJson, luckysheetfile) {
                if (
                    exportJson.sheets == null ||
                    exportJson.sheets.length == 0
                ) {
                    alert(
                        "Failed to read the content of the excel file, currently does not support xls files!"
                    );
                    return;
                }
                window.luckysheet.destroy();
                window.luckysheetOptions.data = exportJson.sheets
                window.luckysheetOptions.title = exportJson.info.name
                window.luckysheet.create(window.luckysheetOptions);
            }
        );
    });

    uploadBtn.addEventListener("click", function (evt) {
        upload.click();
    });

    downlodDemo.addEventListener("click", function (evt) {
        // exportExcel(luckysheet.getluckysheetfile());

        let luckysheetfl = luckysheet.getluckysheetfile();

        ajax("/saveas", luckysheetfl, "POST", function (res) {
            console.log(res);

            fetch(res, {
                method: "GET",
            })
                .then((response) => response.blob())
                .then((blob) => {
                    // 生成 Blob URL
                    const url = URL.createObjectURL(blob);

                    // 创建隐藏的链接并点击触发下载
                    const a = document.createElement("a");
                    a.style.display = "none";
                    a.href = url;
                    a.download = "file.xlsx";
                    document.body.appendChild(a);
                    a.click();

                    // 释放 Blob URL
                    URL.revokeObjectURL(url);
                })
                .catch((error) => {
                    console.error("下载文件时发生错误:", error);
                });
        });

        return console.log(luckysheetfl);
    });

    sendBtn.addEventListener("click", updateVal);

    saveBtn.addEventListener("click", function (evt) {
        luckysheetfl = luckysheet.getluckysheetfile()
        // luckysheet.getAllSheets()[0]
        luckysheetfl.forEach(fl => {
            fl.data = luckysheet.getSheetData({ order: fl.order })
        })
        ajax("/save", luckysheetfl, "POST", function (res) {
            return console.log(res);
        })
    });

    driverBtn.addEventListener("click", genDriver)

    function updateVal() {
        let point_data;
        if (luckysheet.sheetmanage.getCurSheet() == 1) {
            point_data = sendPointSheet(luckysheet.getAllSheets()[0])
        } else {
            point_data = sendDCSheet(luckysheet.getAllSheets()[1])
        }

        ajax("/update", point_data, "POST", function (data) {
            console.log(data);
        });
    }
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

function genDriver(ev) {
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
        "/config/driver.xlsx",
        'driver',
        function (exportJson, luckysheetfile) {
            if (
                exportJson.sheets == null ||
                exportJson.sheets.length == 0
            ) {
                alert(
                    "Failed to read the content of the excel file, currently does not support xls files!"
                );
                return;
            }

            exportJson.sheets.forEach(sheet=>{
                sheet.data = tranCelldataToData(sheet.celldata);
            })

            exportJson.sheets[1].celldata = driver;
            exportJson.sheets[1].data = tranCelldataToData(driver);

            ajax("/driver", exportJson.sheets, "POST", function (res) {
                return console.log(res);
            })
        }
    );

    function tranCelldataToData(celldata) {
        let resArr = [];
        celldata.forEach(cell => {
            console.log(cell)
            if(!resArr[cell.r]){
                resArr[cell.r] = []
            }
            resArr[cell.r][cell.c] = cell.v
        })
        return resArr
    }

    return

    let csvContent = "data:text/csv;charset=utf-8,";
    resArr.forEach((row) => {
        csvContent += row.join(",") + "\n";
    });

    window.open(csvContent);
}