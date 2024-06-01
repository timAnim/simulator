function ajax(url, data, method, cb) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.open(method, url, false);
    console.log(url, data, method);
    httpRequest.send(
        JSON.stringify({
            method,
            url,
            data,
        })
    );
    if (cb) cb(JSON.parse(httpRequest.response, 'utf8'));
}