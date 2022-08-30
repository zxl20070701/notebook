const http = require('http');
const fs = require('fs');

const mineTypes = require('./mime.types.js');
const { log, error } = require('./log');
const { fullPath } = require('./path');

var port = 8080; // 端口号
var basePath = process.cwd(); // 服务器根路径

var index = 0;
var server = http.createServer(function (request, response) {
    try {
        log("[" + index++ + "]" + request.url);

        request.url = request.url.split("?")[0];

        // 请求的文件路径
        var filePath = fullPath(request.url == "/" ? "index.html" : request.url.replace(/^\//, ""), basePath);

        var dotName = /\./.test(filePath) ? filePath.match(/\.([^.]+)$/)[1] : "";

        // 文件类型
        type = mineTypes[dotName];

        if (fs.existsSync(filePath) && !fs.lstatSync(filePath).isDirectory()) {
            response.writeHead(200, {
                'content-type': (type || "text/html") + ";charset=utf-8"
            });
            response.write(fs.readFileSync(filePath));
        } else {
            response.writeHead(404, {
                'content-type': "text/plain;charset=utf-8"
            });
            response.write("404 Not Found!");
        }
    } catch (e) {
        error(e);

        response.writeHead(500, {
            'content-type': "text/plain;charset=utf-8"
        });
        response.write(e + "");
    }

    response.end();
});

server.listen(port);
log('Server running on port:' + port);