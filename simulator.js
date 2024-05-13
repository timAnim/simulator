const { connect, StringCodec } = require("nats");
const http = require("http");
const fs = require("fs");
const path = require("path");
const exportExcel = require("./assets/luckysheet/exportExcel.js");
const NATS_PORT = 6882;
const SERVER_PORT = 20001;
let NATS_SERVER = "120.77.54.131";
const getCookie = require("./app/getCookie.js");
const { getIP } = require('./app/query_dns.js')
const { exec } = require('child_process');


async function Publish(data) {
  // to create a connection to a nats-server:
  const nc = await connect({ servers: `${NATS_SERVER}:${NATS_PORT}` });
  // create a codec
  const sc = StringCodec();

  // 此处需要 字符串格式
  nc.publish("xboard", sc.encode(JSON.stringify(data)));

  await nc.drain();
}

async function handleRequest(req, res) {
  const method = req.method;

  if (req.url === "/favicon.ico") {
    // 处理 /favicon.ico 请求
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.url === "/save") {
    // 处理 /favicon.ico 请求
    res.statusCode = 200;

    let body = "";
    req.on("data", function (dt) {
      body += dt;
    });
    req.on("end", function () {
      exportExcel(JSON.parse(body).data).then(msg => {
        // return console.log(JSON.parse(body).data)
        return res.end("Success")
      })
    });
    // return res.end("Success")
    return;
  }

  if (req.url === "/saveas") {
    // 处理 /favicon.ico 请求
    res.statusCode = 200;

    let body = "";
    req.on("data", function (dt) {
      body += dt;
    });
    req.on("end", function () {
      console.log(JSON.parse(body).data)
      exportExcel(JSON.parse(body).data).then(msg => {
        return res.end("/config/point.xlsx")
      })
    });
    return;
  }

  if (req.url === "/") {
    let data = fs.readFileSync(
      path.resolve(__dirname, "assets", "index.html")
    );
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
    return;
  }

  if (req.url === "/login") {
    let flpath = path.join(__dirname, "assets", "login.html")
    let data = fs.readFileSync(flpath);
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
    return;
  }

  if (req.url === "/last") {
    // 处理 /favicon.ico 请求
    res.statusCode = 200;

    let body = "";
    req.on("data", function (dt) {
      body += dt;
    });
    req.on("end", function () {
      let resource_id = JSON.parse(body).data.resource_id
      let reqData = {
        "translate": 1, "where": [{
          "terms": [{
            "field": "resource_id", "operator": "eq", "value": resource_id
          }]
        }]
      }

      const options = {
        host: NATS_SERVER,
        port: 80,
        path: "/api/v2/cmdb/resources/items",
        method: "POST",
        headers: {
          COOKIE: "DCIM_ACCOUNT=admin",
          'Content-Type': 'application/x-www-form-urlencode;charset=utf-8',
          'Content-Length': Buffer.byteLength(JSON.stringify(reqData))
        },
      };

      const ke_request = http.request(options, (ke_response) => {
        let items = "";
        ke_response.on("data", (dt) => {
          items += dt;
        });
        ke_response.on("end", (t) => {
          return res.end(items.toString("utf8"));
        });
        return
      });
      ke_request.write(JSON.stringify(reqData));
      ke_request.end()
      return
    });
    return
  }

  if (req.url === '/auth') {
    res.statusCode = 200;

    let body = "";
    req.on("data", function (dt) {
      body += dt;
    });
    req.on("end", function () {
      let data = JSON.parse(body)
      getCookie(data.server, data.username, data.password, cookie => {
        getIP(data.server, ip => {
          NATS_SERVER = ip
          cookie.server = ip
          return res.end(JSON.stringify(cookie))
        })
      })
    });
    return
  }

  if (method == "GET") {

    // 获取请求的文件路径
    let filePath = path.join(__dirname, req.url);

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
  }

  if (method == "PUT") {
    let body = "";
    req.on("data", function (dt) {
      body += dt;
    });
    req.on("end", function () {
      fetchItems((item) => {
        res.statusCode = 200;
        res.end(item);
      });
    });
  }

  if (req.url == "/update") {
    let body = "";
    req.on("data", function (dt) {
      body += dt;
    });
    req.on("end", function () {
      try {
        // 连接 nats
        console.log(JSON.parse(body).data, `${NATS_SERVER}:${NATS_PORT}`)
        Publish(JSON.parse(body).data);
        res.statusCode = 200;
        res.end("Success");
      } catch (error) {
        console.error(error);
        res.statusCode = 500;
        res.end(error.toString("utf8"));
      } finally {
      }
    });
  }

  if (req.url == "/driver") {
    let body = "";
    req.on("data", function (dt) {
      body += dt;
    });
    req.on("end", function () {
      res.statusCode = 200;
      res.end(body);
    })
  }

  return false;

  // 解析 URL 参数
  const urlParams = new URLSearchParams(req.url.slice(1));
  // 获取前端传递的参数
  const dev_id = urlParams.get("dev_id");
  console.log(dev_id);
  if (!dev_id) {
    console.error("dev_id is null");
    res.statusCode = 400;
    res.end("dev_id is null");
    return;
  }
}

function fetchItems(cb) {
  const dt = {
    resource_id: "0_20279",
    relation_code: "5",
    where: [
      {
        terms: [
          { field: "ci_type", operator: "eq", value: "3" },
          { field: "spot_type", operator: "eq", value: "2" },
          { field: "data_source", operator: "eq", value: "0" },
        ],
      },
    ],
    page: { number: 1, size: 200 },
  };

  const options = {
    host: NATS_SERVER,
    port: 80,
    path: "/api/v2/cmdb/resources/relations",
    method: "POST",
    headers: {
      COOKIE: "DCIM_ACCOUNT=admin",
    },
  };

  const req = http.request(options, (res) => {
    let body = "";
    res.on("data", (dt) => {
      body += dt;
    });
    res.on("end", (t) => {
      cb(body.toString("utf8"));
    });
  });

  req.write(JSON.stringify(dt));
  req.end();
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

});
