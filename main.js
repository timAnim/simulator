const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require('child_process');

// 常量
const SERVER_PORT = 20001;
global.NATS_PORT = 6882;
global.KE_PORT = 80;
global.NATS_SERVER = "120.77.54.131";
global.isHttps = false;
global.CONFIG = require('./cnfg.js');
console.log(global.CONFIG)

// 读controller下面的文件，建立相同名字的函数
const controllers = fs.readdirSync(path.resolve(__dirname, "controllers"))
const router = {}
controllers.forEach(ctrl => {
  if (ctrl.endsWith('.js')) {
    router[ctrl.replace('.js', '')] = require(path.resolve(__dirname, "controllers", ctrl))
  }
})

cpConfigFile()

async function handleRequest(req, res) {
  const method = req.method;

  // 处理所有的GET请求
  if (method == "GET") {
    res.statusCode = 200;
    // 处理 /favicon.ico 请求

    // 获取请求的文件路径
    let filePath = path.join(__dirname, req.url);

    // 处理静态文件请求
    if (req.url === "/favicon.ico") return res.end()

    if (req.url === "/") filePath = path.resolve(__dirname, "assets", "index.html")

    if (req.url === "/login") filePath = path.resolve(__dirname, "assets", "login.html")

    // 如果路径是一个目录，则默认返回 index.html 文件
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    // 读取文件
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        // 根据文件扩展名设置 Content-Type
        const extname = path.extname(filePath);
        let contentType = 'text/html';
        switch (extname) {
          case '.js':
            contentType = 'text/javascript';
            break;
          case '.css':
            contentType = 'text/css';
            break;
          case '.json':
            contentType = 'application/json';
            break;
          case '.png':
            contentType = 'image/png';
            break;
          case '.jpg':
            contentType = 'image/jpeg';
            break;
          case '.gif':
            contentType = 'image/gif';
            break;
        }

        // 设置响应头
        res.writeHead(200, { 'Content-Type': contentType });

        // 发送文件内容
        res.end(data);
      }
    })

    return false
  }

  console.log(router)
  if (method == "POST") {
    // 处理所有的POST请求
    for (let key in router) {
      // 路由名与ctrl相同，例如/save，save.js
      if (req.url.replace('/', '') === key) {
        console.log(req.url.replace('/', ''), key)
        // 处理请求返回data，用promise封装
        let bodyStr = "";
        let reqHandlerAsync = new Promise((resolve, reject) => {
          res.statusCode = 200;
          req.on("data", function (dt) {
            bodyStr += dt;
          });
          req.on("end", function () {
            resolve(JSON.parse(bodyStr))
          });
        })

        let body = await reqHandlerAsync

        // 调用save.js中的save函数，统一用Promise封装
        return res.end(await router[key](body))
      }
    }
    return false
  }

}

function cpConfigFile() {
  // 复制配置文件
  let cwd = process.cwd()
  
  let configFile = path.join(__dirname, "./config/point.xlsx");
  let newConfigFile = path.join(cwd, "point.xlsx");

  if (fs.existsSync(configFile) && !fs.existsSync(newConfigFile)) {
    fs.copyFileSync(configFile, newConfigFile);
  }

  configFile = path.join(__dirname, "./config/driver.xlsx");
  newConfigFile = path.join(cwd, "driver.xlsx");

  if (fs.existsSync(configFile) && !fs.existsSync(newConfigFile)) {
    fs.copyFileSync(configFile, newConfigFile);
  }
}

// 创建 HTTP 服务器
const server = http.createServer(handleRequest);

// 启动服务器
server.listen(SERVER_PORT, () => {
  console.log(`Server running at http://localhost:${SERVER_PORT}`);

  // 要打开的网页URL
  const url = `http://localhost:${SERVER_PORT}/login`;

  // 根据操作系统选择合适的命令
  const openCommand = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';

  // 使用exec函数执行系统命令
  exec(`${openCommand} ${url}`, (err, stdout, stderr) => {
    if (err) {
      console.error('打开网页出错:', err);
      return;
    }
    console.log(`成功打开浏览器并访问网页: ${url}`);
  });

})
