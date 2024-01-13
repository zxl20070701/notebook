// 记录当前地址栏信息
var urlObj = urlFormat(window.location.href);

function initMenu() {
    var menusEl = document.getElementById("journals-menu-id").children;

    var contentEl = document.getElementById("journals-content-id");
    var navEl = document.getElementById("journals-content-nav-id");
    var viewEl = document.getElementById("journals-content-view-id");

    var routerTag = Array.isArray(urlObj.router) ? urlObj.router.join("/") : "";
    for (var i = 0; i < menusEl.length; i++) {
        (function (menuEl) {
            menuEl.addEventListener("click", function () {
                loadPage("journals/" + menuEl.getAttribute("tag"), function (data) {
                    contentEl.style.display = "block";

                    // 设置内容
                    viewEl.innerHTML = data;
                    doShader(viewEl);
                    doFormula(viewEl);

                    urlObj.router = menuEl.getAttribute("tag").split("/");
                    updateUrl();

                    // 分析fixed
                    initFixed(viewEl, navEl);
                });
            });

            if (routerTag == menuEl.getAttribute("tag")) {
                menuEl.click();
            }
        })(menusEl[i]);
    }

    document.getElementById("journals-content-close-id").addEventListener("click", function () {
        urlObj.router = [];
        updateUrl();

        contentEl.style.display = "none";
        navEl.innerHTML = "";
        viewEl.innerHTML = "";
    });
}