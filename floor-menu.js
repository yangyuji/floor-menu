/**
* author: "oujizeng",
* license: "MIT",
* github: "https://github.com/yangyuji/floor-menu",
* name: "floor-menu.js",
* version: "1.2.5"
*/

(function (root, factory) {
    if (typeof module != 'undefined' && module.exports) {
        module.exports = factory();
    } else if (typeof define == 'function' && define.amd) {
        define( function () { return factory(); } );
    } else {
        root['floorMenu'] = factory();
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
        getPageHeight: function () {
            var doc = document,
                body = doc.body,
                el = doc.documentElement,
                page = doc.compatMode == "CSS1Compat" ? el : body;
            return Math.max(el.scrollHeight, body.scrollHeight, page.clientHeight);
        },
        supportSticky: function () {
            var e = document.createElement("div");
            return window.CSS && window.CSS.supports ? window.CSS.supports("(position: sticky) or (position: -webkit-sticky)") : (e.style.position = "sticky",
                "sticky" === e.style.position ? !0 : (e.style.position = "-webkit-sticky", "-webkit-sticky" === e.style.position ? !0 : (e = null, !1)))
        }
    };

    function floorMenu (el) {
        this.floor = typeof el == 'string' ? document.querySelector(el) : el;
        // 页面高度
        this.pageHeight = utils.getPageHeight();
        // 导航条高度
        this.floorHeight = this.floor.offsetHeight;
        // 初始化
        this.init();
    }

    floorMenu.prototype = {
        version: '1.2.5',
        // 初始化
        init: function () {
            if (!this.floor) return;

            this.links = utils.getAll(this.floor, 'a[href^="#"]:not([href="#"]).tabs-nav');
            this.linksMore = utils.getAll(this.floor, 'li.more-item');

            // 楼层定位组件的滚动
            this.iScroll = new IScroll('.floor-tabs-inner', {
                scrollX: true,
                preventDefault: false,
                scrollbars: false
            });

            var self = this;
            setTimeout(function () {
                self.scopes = self._initScopes();
            });

            // 支持 sticky
            if (utils.supportSticky()) {
                this.floor.classList.add('floor-sticky');
            }
        },
        // 更新scopes的值，动态加载内容可以执行一下update
        update: function () {
            this.scopes = this._initScopes();
        },
        _initScopes: function () {
            var self = this, scopes = [],
                offsetY = window.pageYOffset;
            try {
                for (var i = 0; i < self.links.length; i++) {
                    var range = {hash: self.links[i].hash};
                    range.min = utils.getEle(document, self.links[i].hash).getBoundingClientRect().top + offsetY;
                    if (i < self.links.length - 1) {
                        range.max = utils.getEle(document, self.links[i + 1].hash).getBoundingClientRect().top + offsetY;
                    } else {
                        range.max = self.pageHeight;
                    }
                    scopes.push(range);
                }
                // 绑定事件
                self._bindEvents.call(self);
                return scopes;
            } catch (err) {
                console.warn(err);
                window.alert('楼层定位组件配置错误，请核对配置！');
            }
        },
        _bindEvents: function () {
            var self = this;
            // 监听滚动
            window.addEventListener('scroll', function () {
                window.requestAnimationFrame(self._onScroll.bind(self));
            }, false);
            // 执行一次
            window.requestAnimationFrame(self._onScroll.bind(self));

            // 导航项的点击绑定
            var internal = utils.getAll(self.floor, 'a[href^="#"]:not([href="#"])'), a;
            for (var i = internal.length; a = internal[--i];) {
                a.addEventListener("click", function (ev) {
                    if (!ev.defaultPrevented) {
                        ev.preventDefault();

                        if (location.hash !== this.hash) {
                            history.pushState(null, null, this.hash);
                        }

                        for (var i = 0; i < self.scopes.length; i++) {
                            if (self.scopes[i].hash == this.hash) {
                                window.scroll(0, self.scopes[i].min - self.floorHeight);
                                break;
                            }
                        }
                    }
                }, false);
            }
            // 弹出下拉框
            utils.getEle(self.floor, '.floor-icon-down').addEventListener('click', function (ev) {
                utils.getEle(self.floor, '.floor-more').style.display = 'block';
                ev.stopPropagation();
            });
            // 关闭下拉框
            utils.getEle(self.floor, '.floor-more').addEventListener('click', function (ev) {
                this.style.display = 'none';
                ev.preventDefault();
                ev.stopPropagation();
            });
        },
        _onScroll: function () {
            var self = this;
            if (!self.floor.classList.contains('floor-sticky')) {
                // getBoundingClientRect耗费性能，所以用sticky做优化
                var top = self.floor.getBoundingClientRect().top;
                if (top <= 0) {
                    utils.getEle(self.floor, '.floor-inner').classList.add('floor-fixed');
                } else {
                    utils.getEle(self.floor, '.floor-inner').classList.remove('floor-fixed');
                }
            }
            // 要加上导航条的高度作纠正
            var scrollTop = window.pageYOffset + self.floorHeight;
            for (var i = 0; i < self.scopes.length; i++) {
                if (scrollTop >= self.scopes[i].min && scrollTop < self.scopes[i].max) {
                    self.links[i].classList.add('active');
                    self.linksMore[i].classList.add('active');
                    self.iScroll.scrollToElement(self.links[i], 500, 0);
                } else {
                    self.links[i].classList.remove('active');
                    self.linksMore[i].classList.remove('active');
                }
            }
        }
    }

    return floorMenu;
}));