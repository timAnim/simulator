document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission
    var formData = new FormData(this);
    var requestData = {
        username: formData.get('username'),
        password: formData.get('password'),
        server: formData.get('server')
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