var CryptoJS = require("./crypto-js.js");
var { Base64 } = require("./base64.js");
const https = require('https');
const http = require("http");

async function getCookie(host, account, pwd, cb) {

	console.log(`开始模拟登录${host}获取Cookie...`);

	const login = function (host, port) {
		const isHttps = /^https:\/\//.test(host);

		if (port === void 0) {
			port = isHttps ? 443 : 80;
		}

		let options = {};
		if (isHttps) {
			const agent = new https.Agent({
				rejectUnauthorized: false
			});
			options.httpsAgent = agent;
		}

		options = {
			host: host.replace('http://', '').replace('https://', ''),
			port: port,
			path: "/api/v3/auth/sso/login",
			method: "POST"
		}

		let req = http.request(options, (res) => {

			let body = "";
			res.on("data", (dt) => {
				body += dt;
			});
			res.on("end", (t) => {
				body = JSON.parse(body)
				if (body.error_code !== "00") return null;
				let data = body.data;
				let cookieObj;
				if (!data) console.log('模拟登录失败')
				// spinner.succeed(chalk.green('模拟登录成功, 获取到的登录信息如下'))
				console.log('模拟登录成功, 获取到的登录信息如下')
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
				cb(cookieObj)
			});
		});

		req.write(getParam());
		req.end();
	};

	const getParam = function () {
		var loginData = {
			account: account,
			password: pwd
		};
		var str = JSON.stringify(loginData);
		var param = { text: AESEncrypto(str) };
		return JSON.stringify(param);
	};

	const AESEncrypto = function (str) {
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

	// spinner.start();
	const data = await login(`${host}`);

	console.log(data)


	let cookieObj;
	if (!data) {
		console.log('模拟登录失败')
	} else {
		// spinner.succeed(chalk.green('模拟登录成功, 获取到的登录信息如下'))
		console.log('模拟登录成功, 获取到的登录信息如下')
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
	}

	return cookieObj;
};

// getCookie('http://td.yunyunwei.com', 'admin', '3DXT@2022') 

module.exports = getCookie


