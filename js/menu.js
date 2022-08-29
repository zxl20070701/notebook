// 地址解析
var urlFormat = function (url) {

    var splitTemp = url.split('?')
    var routerTemp = (splitTemp[0] + "#").split("#")[1].replace(/^\//, '').replace(/\/$/, '').split('/')
    var paramTemp = splitTemp[1] || ""

    var paramResult, paramArray
    if (paramTemp == "") {
        paramResult = {}
    } else {
        paramArray = paramTemp.split("&"), paramResult = {}
        paramArray.forEach(function (item) {
            var temp = item.split("=")
            paramResult[temp[0]] = temp[1]
        })
    }

    var resultData = {
        router: routerTemp[0] == '' ? [] : routerTemp,
        params: paramResult
    }

    return resultData
};

// 加载新的页面
var loadPage = function loadPage(pagename, callback) {

    var xmlhttp = new XMLHttpRequest();

    // 请求完成回调
    xmlhttp.onload = function () {
        if (xmlhttp.readyState == 4) {
            callback(xmlhttp.responseText);
        }
    };


    xmlhttp.open("GET", "./pages/" + pagename + ".html", true);

    // 设置超时时间
    xmlhttp.timeout = 6000;

    xmlhttp.send();
};

var routers = [];
var urlObj = urlFormat(window.location.href);

// 初始化菜单点击事件
var initToggle = function (idName) {

    var spans = document.getElementById(idName + "-id").getElementsByTagName('span'), i;
    for (i = 0; i < spans.length; i++) {
        (function (i) {

            // 如果有孩子，只需要控制菜单打开关闭即可
            if (spans[i].parentElement.getElementsByTagName('li').length > 0) {
                spans[i].parentElement.setAttribute('is-open', 'yes');
                spans[i].addEventListener('click', function () {
                    spans[i].parentElement.setAttribute('is-open', spans[i].parentElement.getAttribute('is-open') == 'no' ? 'yes' : 'no');
                });
            }

            // 否则就要控制打开关闭页面了
            else {
                spans[i].addEventListener('click', function () {

                    // 更新菜单
                    if (idName == 'book') {
                        routers = spans[i].getAttribute('tag').split('-');
                        loadPage(spans[i].getAttribute('tag').replace(/\-/g, '/') + "/menu", function (data) {
                            document.getElementById('menu-id').innerHTML = data;
                            initToggle('menu');
                            window.location.href = "#/" + routers[0] + "/" + routers[1];
                        });

                    }

                    // 打开页面
                    else {
                        var tag = spans[i].getAttribute('tag');
                        loadPage(routers.join('/') + "/" + tag, function (data) {
                            document.getElementById('doc-id').innerHTML = data;
                            window.location.href = "#/" + routers[0] + "/" + routers[1] + "/" + tag;
                        });
                    }
                });

                // 根据路由触发点击
                if ([urlObj.router[2], urlObj.router[0] + "-" + urlObj.router[1]].indexOf(spans[i].getAttribute('tag')) > -1) {
                    spans[i].click();
                }

            }

        })(i);
    }

}

// 初始化菜单
window.initMenu = function () {
    initToggle('book');
};