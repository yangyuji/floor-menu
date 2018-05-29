/*
* author: "oujizeng",
* license: "MIT",
* name: "floormemu.js",
* version: "1.0.0"
*/

(function (root, factory) {
    if (typeof module != 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        root['floormemu'] = factory();
    }
}(this, function () {

    // 节流函数
    function throttle (method, delay, duration) {
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

    var win = window,
        doc = win.document,
        scopes = [], links = [], linksMore = [];

    var floormemu = function(id) {

        // 楼层定位组件
        var floor = doc.querySelector(id);

        if (floor) {

            // 楼层定位组件的滚动
            // var myScroll = new IScroll('.floor-tabs-inner', {
            //     scrollX: true,
            //     preventDefault: false,
            //     scrollbars: false
            // });

            // 导航标签
            links = floor.querySelectorAll('a.tabs-nav');
            linksMore = floor.querySelectorAll('li.more-item');
            // 导航条高度
            var height = floor.offsetHeight;

            // 标签对应的高度集合

            initLinksScope();

            // sticky的使用
            var isSticky = false;

            function supportSticky() {
                var e = doc.createElement("div");
                return win.CSS && win.CSS.supports ? win.CSS.supports("(position: sticky) or (position: -webkit-sticky)") : (e.style.position = "sticky",
                    "sticky" === e.style.position ? !0 : (e.style.position = "-webkit-sticky", "-webkit-sticky" === e.style.position ? !0 : (e = null, !1)))
            }

            // 支持 sticky
            if (supportSticky()) {
                isSticky = true;
                floor.classList.add('floor-sticky');
            }

            // 监听滚动
            var floorFun = throttle(floorScroll, 0, 1000 / 60);
            win.addEventListener('scroll', floorFun, false);

            // 导航项的点击绑定
            var internal = floor.querySelectorAll('a[href^="#"]:not([href="#"])'), a;
            for (var i = internal.length; a = internal[--i];) {
                a.addEventListener("click", function (ev) {
                    if (!ev.defaultPrevented) {
                        ev.preventDefault();

                        if (location.hash !== this.hash) {
                            history.pushState(null, null, this.hash);
                        }

                        for (var i = 0; i < scopes.length; i++) {
                            if (scopes[i].hash == this.hash) {
                                doc.documentElement.scrollTop = scopes[i].min - height;
                                doc.body.scrollTop = scopes[i].min - height;
                                break;
                            }
                        }
                    }
                }, false);
            }
            floor.querySelector('.floor-icon-down').addEventListener('click', function (ev) {
                floor.querySelector('.floor-more').style.display = 'block';
                ev.stopPropagation();
            });
            floor.querySelector('.floor-more').addEventListener('click', function (ev) {
                this.style.display = 'none';
                ev.preventDefault();
                ev.stopPropagation();
            });

            //　楼层滚动方法
            function floorScroll() {
                if (!isSticky) {
                    // getBoundingClientRect耗费性能，所以用sticky做优化
                    var top = floor.getBoundingClientRect().top;
                    if (top <= 0) {
                        floor.querySelector('.floor-inner').classList.add('floor-fixed');
                    } else {
                        floor.querySelector('.floor-inner').classList.remove('floor-fixed');
                    }
                }

                // 要加上导航条的高度作纠正
                // 加上1像素可以弥补小数点问题
                var scrollTop = doc.documentElement.scrollTop || doc.body.scrollTop + height + 1;
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
        }
    }

    // 初始化页内标签的高度范围
    function initLinksScope() {
        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        for (var i = 0; i < links.length; i++) {
            var range = {hash: links[i].hash};
            range.min = document.querySelector(links[i].hash).getBoundingClientRect().top + scrollTop;
            if (i < links.length - 1) {
                range.max = document.querySelector(links[i + 1].hash).getBoundingClientRect().top + scrollTop;
            } else {
                range.max = document.body.scrollHeight;
            }
            scopes.push(range);
        }
    }

    return floormemu;
}));