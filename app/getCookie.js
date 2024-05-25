var CryptoJS = require("./crypto-js.js");
var { Base64 } = require("./base64.js");
const https = require('https');
const http = require("http");

async function getCookie(host, port, protocol, account, pwd) {

	console.log(`开始模拟登录${host}获取Cookie...`);

	const login = new Promise((resolve, reject) => {
		const isHttps = (protocol == "https") ? true : false;

		let options = {}

		if (isHttps) {
			const agent = new https.Agent({
				rejectUnauthorized: false
			});
			options.httpsAgent = agent;
			options.httpsAgent.defaultPort = port;
		}

		options.rejectUnauthorized = false
		options.host = host.replace('http://', '').replace('https://', '')
		options.port = port
		options.path = "/api/v3/auth/sso/login"
		options.method = "POST"

		let req

		if (isHttps) {
			req = https.request(options, cookieHandler);
		}
		else {
			req = http.request(options, cookieHandler);
		}

		req.write(getParam());
		req.end();

		function cookieHandler(res) {
			let body = "";
			res.on("data", (dt) => {
				body += dt;
			});
			res.on("end", (t) => {

				body = JSON.parse(body)
				console.log('模拟登录', body)

				if (body.error_code !== "00") resolve(null);
				let data = body.data;
				let cookieObj;
				if (!data) console.log('模拟登录失败', data)
				// spinner.succeed(chalk.green('模拟登录成功, 获取到的登录信息如下'))
				// console.log('模拟登录', body)
				cookieObj = {
					PROXY_HOST: host,
					USER_ID: data.id,
					USER_NAME_DECODE: data.name,
					USER_NAME: Base64.encode(data.name).toString(),
					ACCOUNT: Base64.encode(data.account).toString(),
					ACCOUNT_DECODE: data.account,
					X_GU_SID: data.session,
					THEME: !!data.pickedSkin ? data.pickedSkin : "default"
				};
				resolve(cookieObj)
			})

		};
	});

	function getParam() {
		var loginData = {
			account: account,
			password: pwd
		};
		var str = JSON.stringify(loginData);
		var param = { text: AESEncrypto(str) };
		return JSON.stringify(param);
	};

	function AESEncrypto(str) {
		var key = CryptoJS.enc.Utf8.parse("gongjikeji201909");
		// 加密结果返回的是CipherParams object类型
		var encrypted = CryptoJS.AES.encrypt(str, key, {
			iv: key,
			mode: CryptoJS.mode.CBC,
			padding: CryptoJS.pad.Pkcs7
		});
		// ciphertext是密文，toString()内传编码格式，比如Base64，这里用了16进制
		return encrypted.toString();
	};

	return await login;
};

// getCookie('http://td.yunyunwei.com', 'admin', '3DXT@2022') 

module.exports = getCookie


