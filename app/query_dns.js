const dns = require('dns');
const url = require('url');

// getIP('td.yunyunwei.com');

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

    console.log('Host:', host);
    console.log('Port:', port);
    console.log('Protocol:', protocol);

    cb({
        host,
        port,
        protocol
    })

    return false

    domain = domain.replace('http://', '').replace('https://', '');

    // 使用resolve()函数查询域名的IP地址
    dns.resolve(domain, (err, addresses) => {
        if (err) {
            console.log('DNS 查询出错:', err.message);
            return;
        }
        // addresses 是一个 IP 地址数组
        addresses.forEach((ip, index) => {
            console.log(`IP地址 ${index + 1}: ${ip}`);
        });
        cb(addresses[0]);
    });
}