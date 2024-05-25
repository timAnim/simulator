const http = require("http");
const https = require("https");

module.exports = async function (data) {

    let reqData = {
        "translate": 1, "where": [{
            "terms": [{
                "field": "resource_id", "operator": "eq", "value": data.resource_id
            }]
        }]
    }

    const options = {
        host: global.NATS_SERVER,
        port: global.KE_PORT,
        path: "/api/v2/cmdb/resources/items",
        method: "POST",
        headers: {
            COOKIE: "DCIM_ACCOUNT=admin",
            'Content-Type': 'application/x-www-form-urlencode;charset=utf-8',
            'Content-Length': Buffer.byteLength(JSON.stringify(reqData))
        },
        rejectUnauthorized: false
    };


    // 等待KE返回值，封装异步对象
    let getLastAsync = new Promise((resolve, reject) => {

        // 根据global的参数定义连接对象
        let requestObj = global.isHttps ? https : http

        // 建立请求
        let keReq = requestObj.request(options, keRes => {
            let resStr = "";
            keRes.on("data", (dt) => {
                resStr += dt;
            });
            keRes.on("end", (t) => {
                let result = JSON.parse(resStr)
                if (result.error_code == '00') resolve(resStr)
                else reject('获取实时值错误')
            });
        })

        // 发送请求
        keReq.write(JSON.stringify(reqData));

        // 关闭请求
        keReq.end()

    })

    // 必须返回一个 Promise 异步对象
    return getLastAsync
}