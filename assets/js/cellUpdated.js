window.updateSeed = 0
let lastTime = 0
const interval = 2000

function cellUpdated(r, c, oldValue, newValue, isRefresh) {

    if (!isRefresh || oldValue == newValue) return false

    console.log('update')

    // 2.1.获取当前事件触发时的时间
    const nowTime = new Date().getTime()
    // 2.2.使用当前触发的时间和之前的时间间隔以及上一次开始的时间, 计算出还剩余多长时间需要去触发函数

    const remainTime = interval - (nowTime - lastTime)
    //第一次会执行，原因是nowTime刚开始是一个很大的数字，结果为负数
    //若最后一次没能满足条件，不会执行
    if (remainTime <= 0) {
        // 2.3.真正触发函数
        if (luckysheet.sheetmanage.getCurSheet() == 1) {
            updatePointSheet(r, c, oldValue, newValue, isRefresh)
        } else {
            updateDCSheet(r, c, oldValue, newValue, isRefresh)
        }
        // 2.4.保留上次触发的时间
        lastTime = nowTime
    }
}

function updatePointSheet(r, c, oldValue, newValue, isRefresh) {
    console.log('updatePointSheet')
    newValue = luckysheet.getCellValue(r, c)
    if (c != 1) return;

    ajax(
        "/last",
        { resource_id: newValue },
        "POST",
        (res) => {
            res = JSON.parse(res);
            if (res.data && res.data.resources) {
                console.log(res.data.resources);
                luckysheet.setCellValue(r, 0, "通过");
                luckysheet.setCellValue(
                    r,
                    3,
                    res.data.resources[0].attributes._location_translated
                );
            } else {
                console.log(res.data.resources);
            }

        }
    );
}

function updateDCSheet(r, c, oldValue, newValue, isRefresh) {
    console.log('updateDCSheet')
    luckysheet.sheetmanage.getCurSheet() == 1
    if (c == 3 || c == 4) window.refreshDCSheet()
    if (c == 5) setStyle()
}