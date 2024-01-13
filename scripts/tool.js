//当前正在运动的动画的tick函数堆栈
var $timers = [];
//唯一定时器的定时间隔
var $interval = 13;
//指定了动画时长duration默认值
var $speeds = 400;
//定时器ID
var $timerId = null;

// 动画轮播
function animation(doback, duration, callback) {

    // 如果没有传递时间，使用内置默认值
    if (arguments.length < 2) duration = $speeds;

    var clock = {
        //把tick函数推入堆栈
        "timer": function (tick, duration, callback) {
            if (!tick) {
                throw new Error('Tick is required!');
            }
            var id = new Date().valueOf() + "_" + (Math.random() * 1000).toFixed(0);
            $timers.push({
                "id": id,
                "createTime": new Date(),
                "tick": tick,
                "duration": duration,
                "callback": callback
            });
            clock.start();
            return id;
        },

        //开启唯一的定时器timerId
        "start": function () {
            if (!$timerId) {
                $timerId = setInterval(clock.tick, $interval);
            }
        },

        //被定时器调用，遍历timers堆栈
        "tick": function () {
            var createTime, flag, tick, callback, timer, duration, passTime, needStop,
                timers = $timers;
            $timers = [];
            $timers.length = 0;
            for (flag = 0; flag < timers.length; flag++) {
                //初始化数据
                timer = timers[flag];
                createTime = timer.createTime;
                tick = timer.tick;
                duration = timer.duration;
                callback = timer.callback;
                needStop = false;

                //执行
                passTime = (+new Date() - createTime) / duration;
                if (passTime >= 1) {
                    needStop = true;
                }
                passTime = passTime > 1 ? 1 : passTime;
                tick(passTime);
                if (passTime < 1 && timer.id) {
                    //动画没有结束再添加
                    $timers.push(timer);
                } else if (callback) {
                    callback(passTime);
                }
            }
            if ($timers.length <= 0) {
                clock.stop();
            }
        },

        //停止定时器，重置timerId=null
        "stop": function () {
            if ($timerId) {
                clearInterval($timerId);
                $timerId = null;
            }
        }
    };

    var id = clock.timer(function (deep) {
        //其中deep为0-1，表示改变的程度
        doback(deep);
    }, duration, callback);

    // 返回一个函数
    // 用于在动画结束前结束动画
    return function () {
        var i;
        for (i in $timers) {
            if ($timers[i].id == id) {
                $timers[i].id = undefined;
                return;
            }
        }
    };

};

// 地址解析
function urlFormat(url) {

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

    if (resultData.router.length > 3) {
        var router3 = resultData.router[2], index;
        for (index = 3; index < resultData.router.length; index++) {
            router3 += "/" + resultData.router[index];
        }

        resultData.router = [resultData.router[0], resultData.router[1], router3];
    }

    return resultData;
};


// 加载新的页面

var now = new Date();
var hash = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();

function loadPage(pagename, callback) {
    var processEl = document.getElementById('process');

    if (window.needCache) {
        var storageData = sessionStorage.getItem("cache://notebook/" + pagename);
        if (storageData) {
            callback(zhcnTozhtw(storageData));
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
            callback(zhcnTozhtw(xmlhttp.responseText));
        }
    };

    // 请求进度
    xmlhttp.onprogress = function (event) {
        processEl.style.width = event.total == 0 ? "100%" : (((event.loaded / event.total) * 100).toFixed(2) + '%');
    }

    xmlhttp.open("GET", "./" + pagename + ".html?hash=" + hash, true);

    // 设置超时时间
    xmlhttp.timeout = 6000;

    xmlhttp.send();
};

function updateUrl() {
    window.noFresh = true;

    var paramsStr = "", key;
    for (key in urlObj.params) {
        paramsStr += key + "=" + urlObj.params[key] + "&";
    }
    window.location.href = "#/" + urlObj.router.join('/') + (paramsStr == "" ? "" : "?" + paramsStr.replace(/\&$/, ''));
};

function initFixed(docEl, fixedMenuEl) {
    var els = docEl.children;
    fixedMenuEl.innerHTML = "<h1>导航</h1>";
    for (index = 0; index < els.length; index++) {
        (function (index) {

            if (["H2", "H3", "H4"].indexOf(els[index].nodeName) > -1) {

                var fixedItemEl = document.createElement(els[index].nodeName);
                fixedMenuEl.appendChild(fixedItemEl);
                fixedItemEl.innerHTML = els[index].innerHTML;
                fixedItemEl.addEventListener('click', function () {

                    var offsetTop = els[index].offsetTop;
                    var currentScrollTop = docEl.scrollTop || 0;

                    animation(function (deep) {
                        docEl.scrollTop = (offsetTop - currentScrollTop) * deep + currentScrollTop;
                    }, 500, function () {
                        docEl.scrollTop = offsetTop;
                    });

                });

            }
        })(index);
    }
}