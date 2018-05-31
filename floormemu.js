/*
* author: "oujizeng",
* license: "MIT",
* name: "floormemu.js",
* version: "1.0.1"
*/

(function (root, factory) {
    if (typeof module != 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        root['floorMemu'] = factory();
    }
}(this, function () {
    'use strict'

    var utils = {
        getEle: function (scope, dom) {
            return scope.querySelector(dom)
        },
        getAll: function (scope, dom) {
            return scope.querySelectorAll(dom)
        },
        supportSticky: function () {
            var e = document.createElement("div");
            return window.CSS && window.CSS.supports ? window.CSS.supports("(position: sticky) or (position: -webkit-sticky)") : (e.style.position = "sticky",
                "sticky" === e.style.position ? !0 : (e.style.position = "-webkit-sticky", "-webkit-sticky" === e.style.position ? !0 : (e = null, !1)))
        },
        // 节流函数
        throttle: function (method, delay, duration) {
            var timer = null;
            var begin = new Date();
            return function () {
                var context = this,
                    args = arguments;
                var now = new Date();
                clearTimeout(timer);
                if(now - begin >= duration) {
                    method.apply(context, args);
                    begin = now;
                } else {
                    timer = setTimeout(function() {
                        method.apply(context, args);
                    }, delay);
                }
            }
        }
    }

    var floorMemu = {

        init: function(id) {

            var win = window,
                doc = win.document,
                scopes = [], links = [], linksMore = [],
                floorHeight = 0, isSticky = false;

            // 楼层定位组件
            var floor = utils.getEle(doc, id);
            if (!floor) return;

            // 楼层定位组件的滚动
            // var myScroll = new IScroll('.floor-tabs-inner', {
            //     scrollX: true,
            //     preventDefault: false,
            //     scrollbars: false
            // });

            // 导航标签
            links = utils.getAll(floor, 'a.tabs-nav');
            linksMore = utils.getAll(floor, 'li.more-item');
            // 导航条高度
            floorHeight = floor.offsetHeight;

            // 标签对应的高度集合
            initLinksScope();

            // 支持 sticky
            if (utils.supportSticky()) {
                isSticky = true;
                floor.classList.add('floor-sticky');
            }

            eventBind();

            function eventBind() {
                // 监听滚动
                var floorFun = utils.throttle(floorScroll, 0, 1000 / 60);
                win.addEventListener('scroll', floorFun, false);

                // 导航项的点击绑定
                var internal = utils.getAll(floor, 'a[href^="#"]:not([href="#"])'), a;
                for (var i = internal.length; a = internal[--i];) {
                    a.addEventListener("click", function (ev) {
                        if (!ev.defaultPrevented) {
                            ev.preventDefault();

                            if (location.hash !== this.hash) {
                                history.pushState(null, null, this.hash);
                            }

                            for (var i = 0; i < scopes.length; i++) {
                                if (scopes[i].hash == this.hash) {
                                    // 暂时还没找到兼容写法
                                    doc.documentElement.scrollTop = scopes[i].min - floorHeight;
                                    doc.body.scrollTop = scopes[i].min - floorHeight;
                                    break;
                                }
                            }
                        }
                    }, false);
                }
                // 弹出下拉框
                utils.getEle(floor, '.floor-icon-down').addEventListener('click', function (ev) {
                    utils.getEle(floor, '.floor-more').style.display = 'block';
                    ev.stopPropagation();
                });
                // 关闭下拉框
                utils.getEle(floor, '.floor-more').addEventListener('click', function (ev) {
                    this.style.display = 'none';
                    ev.preventDefault();
                    ev.stopPropagation();
                });
            }

            //　楼层滚动方法
            function floorScroll() {
                if (!isSticky) {
                    // getBoundingClientRect耗费性能，所以用sticky做优化
                    var top = floor.getBoundingClientRect().top;
                    if (top <= 0) {
                        utils.getEle(floor, '.floor-inner').classList.add('floor-fixed');
                    } else {
                        utils.getEle(floor, '.floor-inner').classList.remove('floor-fixed');
                    }
                }

                // 要加上导航条的高度作纠正
                // 加上1像素可以弥补小数点问题
                var scrollTop = doc.documentElement.scrollTop || doc.body.scrollTop + floorHeight + 1;
                for (var i = 0; i < scopes.length; i++) {
                    if (scrollTop >= scopes[i].min && scrollTop < scopes[i].max) {
                        links[i].classList.add('active');
                        linksMore[i].classList.add('active');
                        //myScroll.scrollToElement(links[i], 500, 0);
                    } else {
                        links[i].classList.remove('active');
                        linksMore[i].classList.remove('active');
                    }
                }
            }

            // 初始化页内标签的高度范围
            function initLinksScope() {
                var scrollTop = doc.documentElement.scrollTop || doc.body.scrollTop;
                for (var i = 0; i < links.length; i++) {
                    var range = { hash: links[i].hash };
                    range.min = utils.getEle(doc, links[i].hash).getBoundingClientRect().top + scrollTop;
                    if (i < links.length - 1) {
                        range.max = utils.getEle(doc, links[i + 1].hash).getBoundingClientRect().top + scrollTop;
                    } else {
                        range.max = doc.documentElement.scrollHeight || doc.body.scrollHeight;
                    }
                    scopes.push(range);
                }
            }
        }
    }

    return floorMemu;
}));