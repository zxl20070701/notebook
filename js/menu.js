//当前正在运动的动画的tick函数堆栈
var $timers = [];
//唯一定时器的定时间隔
var $interval = 13;
//指定了动画时长duration默认值
var $speeds = 400;
//定时器ID
var $timerId = null;

// 动画轮播
var animation = function (doback, duration, callback) {

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

// 记录当前地址栏信息
var urlObj = urlFormat(window.location.href);

var updateUrl = function () {
    window.noFresh = true;

    var paramsStr = "", key;
    for (key in urlObj.params) {
        paramsStr += key + "=" + urlObj.params[key] + "&";
    }
    window.location.href = "#/" + urlObj.router.join('/') + (paramsStr == "" ? "" : "?" + paramsStr.replace(/\&$/, ''));
};

// 初始化菜单点击事件
var initToggle = function (idName) {

    var spans = document.getElementById(idName + "-id").getElementsByTagName('span'), i;
    var autoClickBtn;
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
                        var _tag = spans[i].getAttribute('tag').split('-');
                        urlObj.router[0] = _tag[0];
                        urlObj.router[1] = _tag[1];
                        loadPage("pages/" + spans[i].getAttribute('tag').replace(/\-/g, '/') + "/menu", function (data) {
                            document.getElementById('menu-id').innerHTML = data;
                            initToggle('menu');
                        });

                    }

                    // 打开页面
                    else {
                        var tag = spans[i].getAttribute('tag'), docEl = document.getElementById('doc-id');
                        urlObj.router[2] = tag;
                        loadPage("pages/" + urlObj.router.join('/'), function (data) {
                            docEl.innerHTML = data;
                            updateUrl();
                            window.doShader(docEl);

                            // 修改标题
                            document.getElementsByTagName('title')[0].innerText = spans[i].innerText + " - notebook 文档笔记";

                            // 例子
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

                                                urlObj.params.example = exampleName;
                                                updateUrl();
                                            });
                                        });

                                        if (exampleName == urlObj.params.example) {
                                            buttons[index].click();
                                        }

                                    }
                                })(index);
                            }

                            var fullBtn = document.createElement('span');
                            var fixedBtn = document.getElementById('fixed-id');
                            var githubBtn = document.getElementById('github-id');

                            // 最大化
                            fullBtn.setAttribute('class', 'full-btn');
                            fullBtn.setAttribute('tag', 'toFull');
                            docEl.appendChild(fullBtn);

                            docEl.style.top = '0';

                            fullBtn.addEventListener('click', function () {

                                // 最大化
                                if (fullBtn.getAttribute('tag') == 'toFull') {
                                    fullBtn.setAttribute('tag', 'toRight');

                                    docEl.style.position = "fixed";
                                    docEl.style.left = '260px';
                                    docEl.style.backgroundColor = 'white';
                                    docEl.style.boxShadow = "0 0 7px 1px #607d8b";

                                    docEl.style.height = '100vh';

                                    fixedBtn.style.display = 'block';
                                    githubBtn.setAttribute("tag", "type2");

                                    urlObj.params.model = 'full';

                                }

                                // 复位
                                else {
                                    fullBtn.setAttribute('tag', 'toFull');
                                    docEl.style.position = "relative";
                                    docEl.style.left = '0';
                                    docEl.style.backgroundColor = 'transparent';
                                    docEl.style.boxShadow = "0 0 0 0 transparent";

                                    fixedBtn.style.display = 'none';
                                    githubBtn.setAttribute("tag", "type1");

                                    docEl.style.height = '';

                                    delete urlObj.params.model;

                                }

                                updateUrl();
                            });

                            if (urlObj.params.model == 'full') {
                                fullBtn.click();
                            }

                            // 打开编辑界面按钮
                            var editorBtn = document.createElement('a');
                            docEl.appendChild(editorBtn);

                            editorBtn.setAttribute('class', 'editor-btn');
                            editorBtn.setAttribute('href', "https://github.com/zxl20070701/notebook/edit/master/pages/" + urlObj.router.join('/') + ".html");
                            editorBtn.setAttribute('target', '_blank');

                            // 分析fixed
                            var els = docEl.children;
                            var fixedMenuEl = document.getElementById('fixed-menu-id');
                            fixedMenuEl.innerHTML = "";
                            for (index = 0; index < els.length; index++) {
                                (function (index) {

                                    if (["H2", "H3", "H4"].indexOf(els[index].nodeName) > -1) {

                                        var fixedItemEl = document.createElement(els[index].nodeName);
                                        fixedMenuEl.appendChild(fixedItemEl);
                                        fixedItemEl.innerText = els[index].innerText;
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

                        });
                    }
                });

                // 如果是第一个或者路由记录的
                if (!autoClickBtn || [urlObj.router[2], urlObj.router[0] + "-" + urlObj.router[1]].indexOf(spans[i].getAttribute('tag')) > -1) {
                    autoClickBtn = spans[i];
                }

            }

        })(i);
    }

    // 初始化主动点击
    autoClickBtn.click();

}

// 初始化菜单
window.initMenu = function () {
    initToggle('book');

    // 关闭例子
    document.getElementById('example-close-id').addEventListener('click', function () {
        document.getElementById('example-root').style.display = "none";

        delete urlObj.params.example;
        updateUrl();
    });
};