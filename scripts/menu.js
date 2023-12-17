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

var loadPage = function (pagename, callback) {
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

// 记录当前地址栏信息
var urlObj = urlFormat(window.location.href);

var searchObj = [];
var initSearchObj = function () {
    if (window.needCache) {
        var storageData = sessionStorage.getItem("search://notebook/obj");
        if (storageData) {
            searchObj = JSON.parse(storageData);
            return;
        }
    }

    searchObj = [];

    var firstLevelSpans = document.getElementById("book-id").getElementsByTagName("span"), totalCount = firstLevelSpans.length, finshCount = 0;
    for (var index = 0; index < totalCount; index++) {
        (function (index) {
            var firstLevelSpan = firstLevelSpans[index];
            if (firstLevelSpan.getAttribute("tag")) {

                var firstRemarkArray = [firstLevelSpan.innerText];
                var firstPreEl = firstLevelSpan.parentElement;
                while (firstPreEl.getAttribute("id") != "book-id") {
                    firstPreEl = firstPreEl.parentElement;

                    if (firstPreEl.tagName == "LI") {
                        firstRemarkArray.unshift(firstPreEl.firstElementChild.innerText.trim());
                    }
                }

                var firstLevelUrl = firstLevelSpan.getAttribute('tag').replace(/\-/g, '/')
                loadPage("pages/" + firstLevelUrl + "/menu", function (data) {
                    finshCount += 1;

                    var helpUlEl = document.createElement("ul");
                    helpUlEl.innerHTML = data;

                    var secordLevelSpans = helpUlEl.getElementsByTagName("span"), secordLevelSpan, secordRemarkArray, secordPreEl;
                    for (var i = 0; i < secordLevelSpans.length; i++) {
                        secordLevelSpan = secordLevelSpans[i];
                        if (secordLevelSpan.getAttribute("tag")) {
                            secordRemarkArray = [];

                            secordPreEl = secordLevelSpan.parentElement;
                            while (true) {
                                secordPreEl = secordPreEl.parentElement;

                                if (!secordPreEl) {
                                    break;
                                }
                                else if (secordPreEl.tagName == "LI") {
                                    secordRemarkArray.unshift(secordPreEl.firstElementChild.innerText.trim());
                                }
                            }

                            searchObj.push({
                                name: secordLevelSpan.innerText.trim(),
                                path: firstRemarkArray.join("/") + "/" + secordRemarkArray.join("/") + "/" + secordLevelSpan.innerText.trim(),
                                url: firstLevelUrl + "/" + secordLevelSpan.getAttribute("tag")
                            });
                        }
                    }

                    if (finshCount >= totalCount && window.needCache) {
                        sessionStorage.setItem("search://notebook/obj", JSON.stringify(searchObj));
                    }
                });
            } else {
                finshCount += 1;
            }
        })(index);
    }
};

var updateUrl = function () {
    window.noFresh = true;

    var paramsStr = "", key;
    for (key in urlObj.params) {
        paramsStr += key + "=" + urlObj.params[key] + "&";
    }
    window.location.href = "#/" + urlObj.router.join('/') + (paramsStr == "" ? "" : "?" + paramsStr.replace(/\&$/, ''));
};

// 搜索内容
var searchTimeout;
function doSearch(event) {
    event.preventDefault();
    event.stopPropagation();

    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    var doSearchReset = function () {
        window.searchListEl.innerHTML = "";
        window.searchListEl.style.width = "";
    };

    var doSearchNotify = function (template) {
        needReset = true;
        window.searchListEl.innerHTML = template;
        window.searchListEl.style.width = "260px";
        searchTimeout = setTimeout(doSearchReset, 1000);
    };

    doSearchReset();

    if (window.searchListEl) {
        window.searchListEl.innerHTML = "";
        var inputValueOrl = document.getElementById("search-input").value;
        sessionStorage.setItem("search://notebook/value", inputValueOrl);

        var inputValue = inputValueOrl.trim().toLowerCase(), i, itemEl;
        if (!inputValue) {
            doSearchNotify("<div class='notify error'>请输入内容后再检索！</div>");
        } else {
            var rightCount = 0;
            for (i = 0; i < searchObj.length; i++) {
                // 如果匹配到
                if (searchObj[i].path.replace(/ /g, '').toLowerCase().indexOf(inputValue) > -1 || searchObj[i].url.toLowerCase().indexOf(inputValue) > -1) {
                    rightCount += 1;
                    itemEl = document.createElement("div");
                    window.searchListEl.appendChild(itemEl);
                    itemEl.setAttribute("class", "item");

                    // 拼接具体内容
                    itemEl.innerHTML = "<div class='title'>➤《" + searchObj[i].name + "》</div><div class='remark'>" + searchObj[i].path + "</div>";

                    (function (itemEl, itemObj) {
                        itemEl.addEventListener("click", function () {
                            window.location.href = "#/" + itemObj.url + (urlObj.params.model ? "?model=" + urlObj.params.model : "");
                            window.location.reload();
                        });
                    })(itemEl, searchObj[i]);
                }
            }

            if (rightCount <= 0) {
                doSearchNotify("<div class='notify msg'>未匹配到任何内容！</div>");
            }
        }
    }
}

// 记录当前文字
sessionStorage.setItem('lang', urlObj.params.lang || "zh-cn");

// 切换文字
function changeLang(lang) {
    urlObj.params.lang = lang;
    updateUrl();

    window.location.reload();
}

// 初始化菜单点击事件
var initToggle = function (idName) {

    document.getElementsByTagName("body")[0].addEventListener("click", function () {
        if (window.searchListEl) window.searchListEl.innerHTML = "";
    });

    var searchValue = sessionStorage.getItem("search://notebook/value");
    if (searchValue) {
        document.getElementById("search-input").value = searchValue;
    }

    var spans = document.getElementById(idName + "-id").getElementsByTagName('span'), i;
    var autoClickBtn;
    for (i = 0; i < spans.length; i++) {
        (function (i) {

            // 如果有孩子，只需要控制菜单打开关闭即可
            if (spans[i].parentElement.getElementsByTagName('li').length > 0) {
                spans[i].parentElement.setAttribute('is-open', 'no');
                spans[i].addEventListener('click', function () {
                    spans[i].parentElement.setAttribute('is-open', spans[i].parentElement.getAttribute('is-open') == 'no' ? 'yes' : 'no');
                });
            }

            // 否则就要控制打开关闭页面了
            else {
                spans[i].addEventListener('click', function () {

                    var isOpenEl = spans[i];
                    while (isOpenEl) {
                        if (isOpenEl.getAttribute('is-open')) {
                            isOpenEl.setAttribute('is-open', 'yes');
                        }
                        isOpenEl = isOpenEl.parentElement;
                    }

                    // 更新菜单
                    if (idName == 'book') {
                        var oralTag = spans[i].getAttribute('tag');
                        if (oralTag) {
                            var _tag = oralTag.split('-');
                            urlObj.router[0] = _tag[0];
                            urlObj.router[1] = _tag[1];
                            loadPage("pages/" + spans[i].getAttribute('tag').replace(/\-/g, '/') + "/menu", function (data) {
                                document.getElementById('menu-id').innerHTML = data;
                                initToggle('menu');
                            });
                        } else {
                            alert("暂无内容，敬请期待～");
                        }

                    }

                    // 打开页面
                    else {
                        var tag = spans[i].getAttribute('tag'), docEl = document.getElementById('doc-id');
                        urlObj.router[2] = tag;
                        loadPage("pages/" + urlObj.router.join('/'), function (data) {
                            docEl.innerHTML = data;
                            updateUrl();
                            window.doShader(docEl);
                            window.doFormula(docEl);

                            docEl.scrollTop = 0;

                            // 修改标题
                            document.getElementsByTagName('title')[0].innerText = spans[i].innerText + " - notebook 文档笔记";

                            // 弹框
                            var buttons = document.getElementsByTagName('button'), index;
                            for (index = 0; index < buttons.length; index++) {
                                (function (index) {
                                    var pageName = buttons[index].getAttribute('tag');
                                    var pageType = buttons[index].getAttribute('type') || "example";
                                    if (pageName) {

                                        buttons[index].addEventListener('click', function () {

                                            document.getElementsByTagName("body")[0].setAttribute("dialog", 'yes');

                                            // 解释说明
                                            if (pageType == "explain") {
                                                var explainEl = document.getElementById('explain-content-id');
                                                loadPage("explains/" + pageName, function (data) {
                                                    document.getElementById('explain-root').style.display = "block";
                                                    explainEl.innerHTML = data;

                                                    window.doShader(explainEl);
                                                    window.doFormula(explainEl);

                                                    explainEl.scrollTop = 0;

                                                    urlObj.params.dialog = pageName;
                                                    urlObj.params.type = "explain";
                                                    updateUrl();
                                                });
                                            }

                                            // 默认就是例子
                                            else {
                                                loadPage("examples/" + pageName, function (data) {
                                                    document.getElementById('example-root').style.display = "block";
                                                    document.getElementById('source-id').value = data;
                                                    document.getElementById('run-btn').click();

                                                    urlObj.params.dialog = pageName;
                                                    urlObj.params.type = "example";
                                                    updateUrl();
                                                });
                                            }


                                        });

                                        if (pageName == urlObj.params.dialog && pageType == urlObj.params.type) {
                                            buttons[index].click();
                                        }

                                    }
                                })(index);
                            }

                            var searchList = document.createElement('div');
                            var fullBtn = document.createElement('span');
                            var fixedBtn = document.getElementById('fixed-id');
                            var githubBtn = document.getElementById('github-id');

                            // 搜索按钮
                            docEl.appendChild(searchList);
                            searchList.setAttribute('class', 'search-list');
                            window.searchListEl = searchList;

                            // 底部的打开编辑按钮
                            var bottomEditorBtn = document.createElement('a');
                            docEl.appendChild(bottomEditorBtn);
                            bottomEditorBtn.innerHTML = '<svg fill="currentColor" height="20" width="20" viewBox="0 0 40 40" class="iconEdit_Z9Sw" aria-hidden="true"><g><path d="m34.5 11.7l-3 3.1-6.3-6.3 3.1-3q0.5-0.5 1.2-0.5t1.1 0.5l3.9 3.9q0.5 0.4 0.5 1.1t-0.5 1.2z m-29.5 17.1l18.4-18.5 6.3 6.3-18.4 18.4h-6.3v-6.2z"></path></g></svg>在 GitHub 上编辑此页';
                            bottomEditorBtn.setAttribute('class', 'to-editor-btn');
                            bottomEditorBtn.setAttribute('href', "https://github.com/zxl20070701/notebook/edit/master/pages/" + urlObj.router.join('/') + ".html");
                            bottomEditorBtn.setAttribute('target', '_blank');


                            // 打开编辑界面按钮
                            var editorBtn = document.createElement('a');
                            docEl.appendChild(editorBtn);

                            editorBtn.setAttribute('title', '发现错误？想参与编辑？ 在 GitHub 上编辑此页！');

                            editorBtn.setAttribute('class', 'editor-btn');
                            editorBtn.setAttribute('href', "https://github.com/zxl20070701/notebook/edit/master/pages/" + urlObj.router.join('/') + ".html");
                            editorBtn.setAttribute('target', '_blank');

                            // 最大化
                            fullBtn.setAttribute('class', 'full-btn');
                            fullBtn.setAttribute('tag', 'toFull');
                            docEl.appendChild(fullBtn);

                            fullBtn.setAttribute('title', '点击我切换显示模式');
                            docEl.style.position = "fixed";

                            fullBtn.addEventListener('click', function () {
                                var vwVh = window.getVwVh();

                                // 记录当前是否最大化了
                                window.isFull = fullBtn.getAttribute('tag') == 'toFull';

                                // 最大化
                                if (fullBtn.getAttribute('tag') == 'toFull') {
                                    fullBtn.setAttribute('tag', 'toRight');


                                    docEl.style.left = '260px';
                                    docEl.style.backgroundColor = 'white';
                                    docEl.style.boxShadow = "0 0 7px 1px #607d8b";
                                    docEl.style.top = '0';

                                    docEl.style.height = (100 / window.scale) + vwVh.vh;

                                    fixedBtn.style.display = 'block';
                                    githubBtn.setAttribute("tag", "type2");

                                    urlObj.params.model = 'full';

                                    fullBtn.setAttribute("isFull", "yes");
                                    editorBtn.setAttribute("isFull", "yes");

                                    document.body.setAttribute("isFull", "yes");

                                }

                                // 复位
                                else {

                                    fullBtn.setAttribute('tag', 'toFull');
                                    docEl.style.left = '520px';
                                    docEl.style.backgroundColor = 'transparent';
                                    docEl.style.boxShadow = "0 0 0 0 transparent";
                                    docEl.style.top = '50px';

                                    fixedBtn.style.display = 'none';
                                    githubBtn.setAttribute("tag", "type1");

                                    docEl.style.height = "calc(" + (100 / window.scale) + vwVh.vh + " - 50px)";

                                    delete urlObj.params.model;

                                    fullBtn.setAttribute("isFull", "no");
                                    editorBtn.setAttribute("isFull", "no");

                                    document.body.setAttribute("isFull", "no");
                                }

                                updateUrl();
                            });

                            // 分析fixed
                            var els = docEl.children;
                            var fixedMenuEl = document.getElementById('fixed-menu-id');
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

                            if (urlObj.params.model == 'full') {
                                fullBtn.click();
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
    initSearchObj();

    window.isFull = false;
    document.body.setAttribute("isFull", "no");

    initToggle('book');

    var closeDialog = function (idName) {
        document.getElementById(idName).style.display = "none";

        delete urlObj.params.dialog;
        delete urlObj.params.type;

        document.getElementsByTagName("body")[0].setAttribute("dialog", 'no');

        updateUrl();
    };

    // 关闭例子
    document.getElementById('example-close-id').addEventListener('click', function () {
        closeDialog('example-root');
    });

    // 关闭解释说明
    document.getElementById('explain-close-id').addEventListener('click', function () {
        closeDialog('explain-root');
    });
};