const getCookie = require("../app/getCookie.js");

module.exports = async function (data) {

    // 将用户输入的url地址转成url对象
    const parsedUrl = new URL(data.server);

    // 获取主机、端口和协议
    // TODO 获取端口号的方法有问题，没有考虑映射的情况
    const host = parsedUrl.hostname;
    const port = parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80);
    const protocol = parsedUrl.protocol.slice(0, -1); // 去掉末尾的冒号


    let cookie = await getCookie(host, port, protocol, data.username, data.password)

    if (!cookie) return JSON.stringify('', 'utf8')
    cookie.server = host
    
    // NATS 的端口号是用户输入的
    global.NATS_PORT = data.port
    
    // KE服务器，是否是HTTS、KE端口号是解析的
    global.KE_PORT = port
    global.NATS_SERVER = host
    global.isHttps = protocol == "https" ? true : false
    
    // 将cookie存到全局
    global.cookie = cookie

    return JSON.stringify(cookie, 'utf8')
}