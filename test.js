const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types'); // 需要安装mime-types包

// 设置文件路径，假设test.xlsx位于项目根目录下
const testXlsxFilePath = path.join(__dirname, 'driver.xlsx');

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  // 检查请求的URL是否为根路径
  if (req.url === '/') {
    // 设置HTTP响应头，指定返回类型为xlsx
    const contentType = mime.contentType('.xlsx');
      console.log(contentType)
      res.setHeader('Content-Type', contentType);
    
    // 设置Content-Disposition响应头，用于指定文件名
    res.setHeader('Content-Disposition', 'attachment; filename="test.xlsx"');
    
    // 读取xlsx文件并发送给客户端
    fs.createReadStream(testXlsxFilePath).pipe(res);
  } else {
    // 对于其他路径，返回404错误
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Error: Not found.');
  }
});

// 服务器监听3000端口
server.listen(3000, () => {
  console.log('Server is running at http://localhost:3000/');
});