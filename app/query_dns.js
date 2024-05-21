module.exports = {
    getIP
}

function getIP(domain, cb) {

    // 解析URL
    const parsedUrl = new URL(domain);

    // 获取主机、端口和协议
    const host = parsedUrl.hostname;
    const port = parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80);
    const protocol = parsedUrl.protocol.slice(0, -1); // 去掉末尾的冒号

    cb({
        host,
        port,
        protocol
    })

    return false
}