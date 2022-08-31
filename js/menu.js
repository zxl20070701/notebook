// 地址解析
var urlFormat = function (url) {

    var splitTemp = url.split('?');
    var routerTemp = (splitTemp[0] + "#").split("#")[1].replace(/^\//, '').replace(/\/$/, '').split('/');
    var paramTemp = splitTemp[1] || "";

    var paramResult, paramArray;
    if (paramTemp == "") {
        paramResult = {};
    } else {
        paramArray = paramTemp.split("&"), paramResult = {};
        paramArray.forEach(function (item) {
            var temp = item.split("=");
            paramResult[temp[0]] = temp[1];
        })
    }

    var resultData = {
        router: routerTemp[0] == '' ? [] : routerTemp,
        params: paramResult
    };

    return resultData;
};

// 加载新的页面
var loadPage = function (pagename, callback) {
    var processEl = document.getElementById('process');

    if (window.needCache) {
        var storageData = sessionStorage.getItem("cache://notebook/" + pagename);
        if (storageData) {
            callback(storageData);
            return;
        }
    }

    var xmlhttp = new XMLHttpRequest();

    // 请求完成回调
    xmlhttp.onload = function () {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == '404') return;

            if (window.needCache) {
                sessionStorage.setItem("cache://notebook/" + pagename, xmlhttp.responseText);
            }

            processEl.style.width = "0";
            callback(xmlhttp.responseText);
        }
    };

    // 请求进度
    xmlhttp.onprogress = data => {
        processEl.style.width = ((data.loaded / 6112727) * 100).toFixed(2) + 'vw';
    }


    xmlhttp.open("GET", "./" + pagename + ".html?hash=" + new Date().valueOf(), true);

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
                        loadPage("pages/" + spans[i].getAttribute('tag').replace(/\-/g, '/') + "/menu", function (data) {
                            document.getElementById('menu-id').innerHTML = data;
                            initToggle('menu');
                        });

                    }

                    // 打开页面
                    else {
                        var tag = spans[i].getAttribute('tag');
                        loadPage("pages/" + routers.join('/') + "/" + tag, function (data) {
                            document.getElementById('doc-id').innerHTML = data;
                            window.location.href = "#/" + routers[0] + "/" + routers[1] + "/" + tag;
                            window.doShader(document.getElementById('doc-id'));

                            var buttons = document.getElementsByTagName('button'), index;
                            for (index = 0; index < buttons.length; index++) {
                                (function (index) {
                                    var exampleName = buttons[index].getAttribute('tag');
                                    if (exampleName) {
                                        buttons[index].addEventListener('click', function () {
                                            loadPage("examples/" + exampleName, function (data) {
                                                document.getElementById('example-root').style.display = "block";
                                                document.getElementById('source-id').value = data;
                                                document.getElementById('run-btn').click();
                                            });
                                        });
                                    }
                                })(index);
                            }

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