let remind = true

document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission
    var formData = new FormData(this);
    var requestData = {
        username: formData.get('username'),
        password: formData.get('password'),
        server: formData.get('server'),
        port: formData.get('port'),
    };

    // Assuming you're using fetch API to send the request
    fetch('/auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            saveData(requestData)
            return response.json();
        })
        .then(data => {

            if (!data.server) {
                document.getElementById('response').innerText = "账户密码不匹配"
            } else {
                // Assuming the server returns a cookie named "session"
                document.getElementById('response').innerText = 'Login successful!';

                localStorage.setItem('server', data.server);
                window.location = '/';
            }
        })
        .catch(error => {
            document.getElementById('response').innerText = 'Error: ' + error.message;
        });
});

document.getElementById('remind').addEventListener('change', function (ev) {
    console.log(ev.target.checked)
    remind = ev.target.checked
})

// 默认数据

var defaultData = {
    username: "admin",
    password: "3DXT@2022",
    server: "http://td.yunyunwei.com",
    port: "6882",
};

// 获取本地存储中的登录数据
function loadData() {
    const storedData = localStorage.getItem('loginData');
    let loginData;

    if (storedData) {
        loginData = JSON.parse(storedData);
        remind = document.getElementById('remind').checked

    } else {
        loginData = defaultData;
    }

    // 填充数据
    document.getElementById('username').value = loginData.username;
    document.getElementById('password').value = loginData.password;
    document.getElementById('server').value = loginData.server;
    document.getElementById('port').value = loginData.port;

}

// 保存数据到本地存储
function saveData(formData) {
    localStorage.setItem('loginData', JSON.stringify(formData));
}

// 页面加载时调用loadData函数
window.onload = loadData;