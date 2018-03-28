const body = document.body;
const html = document.documentElement;
const head = document.head;

const defaults = {
  threshold: 100,
  max: 150,
  prefix: 'pullrrr',
  over: false,
  fade: false,
  maxWidth: false,
};

const eventOptions = {
  passive: false,
};

let supportsPassive = false;

try {
  window.addEventListener('test', null, {
    get passive() {
      supportsPassive = true;
    },
  });
}
catch (e) {
  // do nothing
}

export default class Pullrrr {

  constructor(options = {}) {
    this.options = Object.assign({}, defaults, options);
    this.dragging = false;
    this.startY = null;
    this.distance = null;
    this.abs = null;
    this.direction = null;
    this.executed = false;
    this.callbacks = {};

    this.classContainer = `${this.options.prefix}-container`;
    this.classPullTop = `${this.options.prefix}-pull-top`;
    this.classPullBottom = `${this.options.prefix}-pull-bottom`;
    this.classUseOver = `${this.options.prefix}-use-over`;
    this.classOver = `${this.options.prefix}-over`;
    this.classPulledDown = `${this.options.prefix}-pulled-down`;
    this.classPulledUp = `${this.options.prefix}-pulled-up`;
    this.classPullingDown = `${this.options.prefix}-pulling-down`;
    this.classPullingUp = `${this.options.prefix}-pulling-up`;
    this.classThreshold = `${this.options.prefix}-threshold`;
    this.classIsTop = `${this.options.prefix}-is-top`;
    this.classIsBottom = `${this.options.prefix}-is-bottom`;

    this.styles = `
    /**
    * Required Pullrrr Styles
    */
    .${this.options.prefix}-container {
      transition: 0.2s ease-out;
    }
    html.${this.options.prefix}-pulling-down .${this.options.prefix}-container,
    html.${this.options.prefix}-is-top .${this.options.prefix}-container {
      touch-action: pan-x pan-down pinch-zoom;
    }
    html.${this.options.prefix}-pulling-up .${this.options.prefix}-container,
    html.${this.options.prefix}-is-bottom .${this.options.prefix}-container {
      touch-action: pan-x pan-up pinch-zoom;
    }
    html.${this.options.prefix}-pulling-up .${this.options.prefix}-container,
    html.${this.options.prefix}-pulling-down .${this.options.prefix}-container {
      transition: 0s;
    }`;

    this.init();
  }

  init() {
    this.style = document.createElement('style');
    this.style.id = `${this.options.prefix}-styles`;
    if (this.options.maxWidth && !isNaN(this.options.maxWidth)) {
      this.style.textContent = `
        @media (max-width: ${this.options.maxWidth}px) {
          ${this.styles}
        }
      `;
    }
    else {
      this.style.textContent = this.styles;
    }
    head.appendChild(this.style);

    if (this.options.container instanceof Node) {
      this.container = this.options.container;
    }
    else if (typeof this.options.container === 'string') {
      this.container = document.querySelector(this.options.container);
    }
    else {
      this.container = body;
    }

    this.container.classList.add(this.classContainer);

    if (this.options.pullTop instanceof Node) {
      this.pullTop = this.options.pullTop;
    }
    else if (typeof this.options.pullTop === 'string') {
      this.pullTop = document.querySelector(this.options.pullTop);
    }
    else {
      this.pullTop = document.querySelector(`.${this.classPullTop}`);
      if (!this.pullTop) {
        this.pullTop = document.createElement('div');
        this.pullTop.classList.add(this.classPullTop);
        this.container.appendChild(this.pullTop);
      }
    }

    if (this.options.pullBottom instanceof Node) {
      this.pullBottom = this.options.pullBottom;
    }
    else if (typeof this.options.pullBottom === 'string') {
      this.pullBottom = document.querySelector(this.options.pullBottom);
    }
    else {
      this.pullBottom = document.querySelector(`.${this.classPullBottom}`);
      if (!this.pullBottom) {
        this.pullBottom = document.createElement('div');
        this.pullBottom.classList.add(this.classPullBottom);
        this.container.appendChild(this.pullBottom);
      }
    }

    if (this.options.over) {
      html.classList.add(this.classUseOver);
      this.pullTop.classList.add(this.classOver);
      this.pullBottom.classList.add(this.classOver);
    }

    this.handlers = {
      touchstart: this.touchstart.bind(this),
      touchmove: this.touchmove.bind(this),
      touchend: this.touchend.bind(this),
      scroll: this.scroll.bind(this),
    };

    window.addEventListener('touchstart', this.handlers.touchstart);
    window.addEventListener('touchmove', this.handlers.touchmove, supportsPassive ? eventOptions : false);
    window.addEventListener('touchend', this.handlers.touchend);
    window.addEventListener('resize', this.handlers.scroll);
    if (this.container === body || this.container === html) {
      window.addEventListener('scroll', this.handlers.scroll);
    }
    else {
      this.container.addEventListener('scroll', this.handlers.scroll);
    }

    this.scroll();

    return this;
  }

  on(e, fn) {
    if (!Array.isArray(this.callbacks[e])) {
      this.callbacks[e] = [];
    }
    this.callbacks[e].push(fn);
    return this;
  }

  get scrollPos() {
    let pos;
    let scroll;
    if (this.container === body || this.container === html) {
      pos = window.pageYOffset / (this.container.scrollHeight - window.innerHeight);
      scroll = window.innerHeight < this.container.scrollHeight;
    }
    else {
      pos = this.container.scrollTop / (this.container.scrollHeight - this.container.clientHeight);
      scroll = this.container.clientHeight < this.container.scrollHeight;
    }
    return scroll ? pos : false;
  }

  get canPull() {
    let can = false;
    let scroll = this.scrollPos;
    if (scroll <= 0) {
      can = 'down';
    }
    else if (scroll >= 1) {
      can = 'up';
    }
    if (scroll === false) {
      can = 'both';
    }
    return can;
  }

  resist(dist = 0) {
    let value = Math.min(1, (dist / this.options.threshold) / 2.5) * Math.min(this.options.max, dist);
    if (dist > this.options.max) {
      value += Math.max(0, (dist - this.options.max) / 6);
    }
    return value;
  }

  isMaxWidth() {
    return this.options.maxWidth && !isNaN(this.options.maxWidth) && window.innerWidth > this.options.maxWidth;
  }

  touchstart(e) {
    if (this.isMaxWidth()) {
      return;
    }
    if (this.canPull) {
      html.classList.remove(this.classPulledUp);
      html.classList.remove(this.classPulledDown);
      this.dragging = true;
      this.startY = e.touches[0].pageY;
    }
  }

  touchmove(e) {
    if (this.isMaxWidth()) {
      return;
    }
    if (this.dragging) {
      let pixels = e.touches[0].pageY - this.startY;
      let el;
      this.direction = this.canPull;
      this.distance = this.resist(Math.abs(pixels));
      this.abs = this.distance;

      if (pixels < 0) {
        this.distance = 0 - this.distance;
      }

      if ((this.direction === 'down' || this.direction === 'both') && pixels > 0) {
        this.direction = 'down';
        el = this.pullTop;
      }
      else if ((this.direction === 'up' || this.direction === 'both') && pixels < 0) {
        this.direction = 'up';
        el = this.pullBottom;
      }
      else {
        this.direction = false;
      }

      if (this.direction) {
        e.preventDefault();
        html.classList.add(this.direction === 'down' ? this.classPullingDown : this.classPullingUp);
        el.style.height = `${this.abs}px`;
        this.options.fade && (el.style.opacity = this.abs/this.options.threshold);
        this.options.over || (this.container.style.transform = `translateY(${this.distance}px)`);
        if (this.abs >= this.options.threshold) {
          el.classList.add(this.classThreshold);
          if (!this.executed) {
            if (Array.isArray(this.callbacks.threshold)) {
              for (let fn of this.callbacks.threshold) {
                /^f/.test(typeof fn) && fn.apply(this, [this.direction, this]);
              }
            }
            this.executed = true;
          }
        }
        else {
          el.classList.remove(this.classThreshold);
        }
        if (Array.isArray(this.callbacks.pulling)) {
          for (let fn of this.callbacks.pulling) {
            /^f/.test(typeof fn) && fn.apply(this, [this.direction, this.abs, this]);
          }
        }
      }
    }
  }

  touchend(e) {
    if (this.isMaxWidth()) {
      return;
    }
    this.dragging = false;
    this.executed = false;
    html.classList.remove(this.classPullingUp);
    html.classList.remove(this.classPullingDown);
    this.container.style.transform = '';
    this.pullTop.classList.remove(this.classThreshold);
    this.pullTop.style.height = '';
    this.pullTop.style.opacity = '';
    this.pullBottom.classList.remove(this.classThreshold);
    this.pullBottom.style.height = '';
    this.pullBottom.style.opacity = '';
    if (this.abs >= this.options.threshold) {
      html.classList.add(this.direction === 'down' ? this.classPulledDown : this.classPulledUp);
      if (Array.isArray(this.callbacks.pulled)) {
        for (let fn of this.callbacks.pulled) {
          /^f/.test(typeof fn) && fn.apply(this, [this.direction, this.abs >= this.options.threshold, this]);
        }
      }
    }
  }

  scroll(e) {
    const can = this.canPull;
    if (this.isMaxWidth()) {
      return;
    }
    if (can === 'down') {
      html.classList.add(this.classIsTop);
      html.classList.remove(this.classIsBottom);
    }
    else if (can === 'up') {
      html.classList.add(this.classIsBottom);
      html.classList.remove(this.classIsTop);
    }
    else {
      html.classList.remove(this.classIsTop);
      html.classList.remove(this.classIsBottom);
    }
  }

  destroy() {
    window.removeEventListener('touchstart', this.handlers.touchstart);
    window.removeEventListener('touchmove', this.handlers.touchmove, supportsPassive ? eventOptions : false);
    window.removeEventListener('touchend', this.handlers.touchend);
    window.removeEventListener('resize', this.handlers.scroll);
    if (this.container === body || this.container === html) {
      window.removeEventListener('scroll', this.handlers.scroll);
    }
    else {
      this.container.removeEventListener('scroll', this.handlers.scroll);
    }
    this.style.parentNode.removeChild(this.style);
  }
}
