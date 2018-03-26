/*!
 * pullrrr - version 0.1.0
 *
 * Made with ❤ by Steve Ottoz so@dev.so
 *
 * Copyright (c) 2018 Steve Ottoz
 */
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module', 'exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports);
    global.Pullrrr = mod.exports;
  }
})(this, function (module, exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var body = document.body;
  var html = document.documentElement;
  var head = document.head;

  var defaults = {
    threshold: 100,
    max: 150,
    prefix: 'pullrrr',
    over: false,
    fade: false,
    maxWidth: false
  };

  var styles = '\n/**\n* Required Pullrrr Styles\n*/\n.pullrrr-container {\n  transition: 0.2s ease-out;\n}\nhtml.pullrrr-pulling-down .pullrrr-container,\nhtml.pullrrr-is-top .pullrrr-container {\n  touch-action: pan-x pan-down pinch-zoom;\n}\nhtml.pullrrr-pulling-up .pullrrr-container,\nhtml.pullrrr-is-bottom .pullrrr-container {\n  touch-action: pan-x pan-up pinch-zoom;\n}\nhtml.pullrrr-pulling-up .pullrrr-container,\nhtml.pullrrr-pulling-down .pullrrr-container {\n  transition: 0s;\n}';

  var eventOptions = {
    passive: false
  };

  var supportsPassive = false;

  try {
    window.addEventListener('test', null, {
      get passive() {
        supportsPassive = true;
      }
    });
  } catch (e) {
    // do nothing
  }

  var Pullrrr = function () {
    function Pullrrr() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, Pullrrr);

      this.options = Object.assign({}, defaults, options);
      this.dragging = false;
      this.startY = null;
      this.distance = null;
      this.abs = null;
      this.direction = null;
      this.executed = false;
      this.callbacks = {};
      this.init();
    }

    _createClass(Pullrrr, [{
      key: 'init',
      value: function init() {
        this.style = document.createElement('style');
        this.style.id = this.options.prefix + '-styles';
        if (this.options.maxWidth && !isNaN(this.options.maxWidth)) {
          this.style.textContent = '\n        @media (max-width: ' + this.options.maxWidth + 'px) {\n          ' + styles + '\n        }\n      ';
        } else {
          this.style.textContent = styles;
        }
        head.appendChild(this.style);

        if (this.options.container instanceof Node) {
          this.container = this.options.container;
        } else if (typeof this.options.container === 'string') {
          this.container = document.querySelector(this.options.container);
        } else {
          this.container = body;
        }

        this.container.classList.add(this.options.prefix + '-container');

        if (this.options.pullTop instanceof Node) {
          this.pullTop = this.options.pullTop;
        } else if (typeof this.options.pullTop === 'string') {
          this.pullTop = document.querySelector(this.options.pullTop);
        } else {
          this.pullTop = document.createElement('div');
          this.pullTop.classList.add(this.options.prefix + '-pull-top');
          this.container.appendChild(this.pullTop);
        }

        if (this.options.pullBottom instanceof Node) {
          this.pullBottom = this.options.pullBottom;
        } else if (typeof this.options.pullBottom === 'string') {
          this.pullBottom = document.querySelector(this.options.pullBottom);
        } else {
          this.pullBottom = document.createElement('div');
          this.pullBottom.classList.add(this.options.prefix + '-pull-bottom');
          this.container.appendChild(this.pullBottom);
        }

        if (this.options.over) {
          html.classList.add(this.options.prefix + '-use-over');
          this.pullTop.classList.add(this.options.prefix + '-over');
          this.pullBottom.classList.add(this.options.prefix + '-over');
        }

        this.handlers = {
          touchstart: this.touchstart.bind(this),
          touchmove: this.touchmove.bind(this),
          touchend: this.touchend.bind(this),
          scroll: this.scroll.bind(this)
        };

        window.addEventListener('touchstart', this.handlers.touchstart);
        window.addEventListener('touchmove', this.handlers.touchmove, supportsPassive ? eventOptions : false);
        window.addEventListener('touchend', this.handlers.touchend);
        window.addEventListener('resize', this.handlers.scroll);
        if (this.container === body || this.container === html) {
          window.addEventListener('scroll', this.handlers.scroll);
        } else {
          this.container.addEventListener('scroll', this.handlers.scroll);
        }

        this.scroll();

        return this;
      }
    }, {
      key: 'on',
      value: function on(e, fn) {
        if (!Array.isArray(this.callbacks[e])) {
          this.callbacks[e] = [];
        }
        this.callbacks[e].push(fn);
        return this;
      }
    }, {
      key: 'resist',
      value: function resist() {
        var dist = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

        var value = Math.min(1, dist / this.options.threshold / 2.5) * Math.min(this.options.max, dist);
        if (dist > this.options.max) {
          value += Math.max(0, (dist - this.options.max) / 6);
        }
        return value;
      }
    }, {
      key: 'isMaxWidth',
      value: function isMaxWidth() {
        return this.options.maxWidth && !isNaN(this.options.maxWidth) && window.innerWidth > this.options.maxWidth;
      }
    }, {
      key: 'touchstart',
      value: function touchstart(e) {
        if (this.isMaxWidth()) {
          return;
        }
        if (this.canPull) {
          html.classList.remove(this.options.prefix + '-pulled-up');
          html.classList.remove(this.options.prefix + '-pulled-down');
          this.dragging = true;
          this.startY = e.touches[0].pageY;
        }
      }
    }, {
      key: 'touchmove',
      value: function touchmove(e) {
        if (this.isMaxWidth()) {
          return;
        }
        if (this.dragging) {
          var pixels = e.touches[0].pageY - this.startY;
          var el = void 0;
          this.direction = this.canPull;
          this.distance = this.resist(Math.abs(pixels));
          this.abs = this.distance;

          if (pixels < 0) {
            this.distance = 0 - this.distance;
          }

          if ((this.direction === 'down' || this.direction === 'both') && pixels > 0) {
            this.direction = 'down';
            el = this.pullTop;
          } else if ((this.direction === 'up' || this.direction === 'both') && pixels < 0) {
            this.direction = 'up';
            el = this.pullBottom;
          } else {
            this.direction = false;
          }

          if (this.direction) {
            e.preventDefault();
            html.classList.add(this.options.prefix + '-pulling-' + this.direction);
            el.style.height = this.abs + 'px';
            this.options.fade && (el.style.opacity = this.abs / this.options.threshold);
            this.options.over || (this.container.style.transform = 'translateY(' + this.distance + 'px)');
            if (this.abs >= this.options.threshold) {
              el.classList.add(this.options.prefix + '-threshold');
              if (!this.executed) {
                if (Array.isArray(this.callbacks.threshold)) {
                  var _iteratorNormalCompletion = true;
                  var _didIteratorError = false;
                  var _iteratorError = undefined;

                  try {
                    for (var _iterator = this.callbacks.threshold[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                      var fn = _step.value;

                      /^f/.test(typeof fn === 'undefined' ? 'undefined' : _typeof(fn)) && fn.apply(this, [this.direction, this]);
                    }
                  } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                  } finally {
                    try {
                      if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                      }
                    } finally {
                      if (_didIteratorError) {
                        throw _iteratorError;
                      }
                    }
                  }
                }
                this.executed = true;
              }
            } else {
              el.classList.remove(this.options.prefix + '-threshold');
            }
            if (Array.isArray(this.callbacks.pulling)) {
              var _iteratorNormalCompletion2 = true;
              var _didIteratorError2 = false;
              var _iteratorError2 = undefined;

              try {
                for (var _iterator2 = this.callbacks.pulling[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  var _fn = _step2.value;

                  /^f/.test(typeof _fn === 'undefined' ? 'undefined' : _typeof(_fn)) && _fn.apply(this, [this.direction, this.abs, this]);
                }
              } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                  }
                } finally {
                  if (_didIteratorError2) {
                    throw _iteratorError2;
                  }
                }
              }
            }
          }
        }
      }
    }, {
      key: 'touchend',
      value: function touchend(e) {
        if (this.isMaxWidth()) {
          return;
        }
        this.dragging = false;
        this.executed = false;
        html.classList.remove(this.options.prefix + '-pulling-up');
        html.classList.remove(this.options.prefix + '-pulling-down');
        this.container.style.transform = '';
        this.pullTop.classList.remove(this.options.prefix + '-threshold');
        this.pullTop.style.height = '';
        this.pullTop.style.opacity = '';
        this.pullBottom.classList.remove(this.options.prefix + '-threshold');
        this.pullBottom.style.height = '';
        this.pullBottom.style.opacity = '';
        if (this.abs >= this.options.threshold) {
          html.classList.add(this.options.prefix + '-pulled-' + this.direction);
          if (Array.isArray(this.callbacks.pulled)) {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
              for (var _iterator3 = this.callbacks.pulled[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var fn = _step3.value;

                /^f/.test(typeof fn === 'undefined' ? 'undefined' : _typeof(fn)) && fn.apply(this, [this.direction, this.abs >= this.options.threshold, this]);
              }
            } catch (err) {
              _didIteratorError3 = true;
              _iteratorError3 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                  _iterator3.return();
                }
              } finally {
                if (_didIteratorError3) {
                  throw _iteratorError3;
                }
              }
            }
          }
        }
      }
    }, {
      key: 'scroll',
      value: function scroll(e) {
        var can = this.canPull;
        if (this.isMaxWidth()) {
          return;
        }
        if (can === 'down') {
          html.classList.add(this.options.prefix + '-is-top');
          html.classList.remove(this.options.prefix + '-is-bottom');
        } else if (can === 'up') {
          html.classList.add(this.options.prefix + '-is-bottom');
          html.classList.remove(this.options.prefix + '-is-top');
        } else {
          html.classList.remove(this.options.prefix + '-is-top');
          html.classList.remove(this.options.prefix + '-is-bottom');
        }
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        window.removeEventListener('touchstart', this.handlers.touchstart);
        window.removeEventListener('touchmove', this.handlers.touchmove, supportsPassive ? eventOptions : false);
        window.removeEventListener('touchend', this.handlers.touchend);
        window.removeEventListener('resize', this.handlers.scroll);
        if (this.container === body || this.container === html) {
          window.removeEventListener('scroll', this.handlers.scroll);
        } else {
          this.container.removeEventListener('scroll', this.handlers.scroll);
        }
        this.style.parentNode.removeChild(this.style);
      }
    }, {
      key: 'scrollPos',
      get: function get() {
        var pos = void 0;
        var scroll = void 0;
        if (this.container === body || this.container === html) {
          pos = window.pageYOffset / (this.container.scrollHeight - window.innerHeight);
          scroll = window.innerHeight < this.container.scrollHeight;
        } else {
          pos = this.container.scrollTop / (this.container.scrollHeight - this.container.clientHeight);
          scroll = this.container.clientHeight < this.container.scrollHeight;
        }
        return scroll ? pos : false;
      }
    }, {
      key: 'canPull',
      get: function get() {
        var can = false;
        var scroll = this.scrollPos;
        if (scroll <= 0) {
          can = 'down';
        } else if (scroll >= 1) {
          can = 'up';
        }
        if (scroll === false) {
          can = 'both';
        }
        return can;
      }
    }]);

    return Pullrrr;
  }();

  exports.default = Pullrrr;
  module.exports = exports['default'];
});