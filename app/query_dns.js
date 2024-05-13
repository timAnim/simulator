const dns = require('dns');

// getIP('td.yunyunwei.com');

module.exports = {
    getIP
}

function getIP(domain, cb) {

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