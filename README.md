Pullrrr
=======
Pull to do something...

Install
-------

```bash
npm install pullrrr
```

Example Setup
-------------

### Javascript

```javascript
import Pullrrr from 'pullrrr';

// create an instance with default options
const pullrrr = new Pullrrr({
  threshold: 100, // threshold for the pull action
  max: 150, // not exactly max, but used for pull resistance calculation
  prefix: 'pullrrr', // prefix for classnames
  over: false, // if top/bottom element should go over container
  fade: false, // if top/bottom element should be faded in/out
  maxWidth: false, // if specified, Pullrrr is only applied if window.innerWidth <= maxWidth
});
```

#### Events

You can add the following event listeners:

```javascript
pullrrr.on('pulling', (direction, distance, instance) => {
  // called while pulling
});

pullrrr.on('pulled', (direction, passedThreshold, instance) => {
  // called after pulling
});

pullrrr.on('threshold', (direction, instance) => {
  // called when threshold is passed
});
```


### CSS

These are some example styles for the elements used/created by Pullrrr:

```css
html.pullrrr-use-over:after {
  background: transparent;
  content: '';
  opacity: 0;
  pointer-events: none;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transition: opacity 0.3s ease-out;
  z-index: 1000;
}
html.pullrrr-pulling-up.pullrrr-use-over:after,
html.pullrrr-pulling-down.pullrrr-use-over:after {
  opacity: 1;
}
html.pullrrr-pulling-up.pullrrr-use-over:after {
  background: linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0));
}
html.pullrrr-pulling-down.pullrrr-use-over:after {
  background: linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0));
}

.pullrrr-pull-top,
.pullrrr-pull-bottom {
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  align-content: center;
  font-size: 2rem;
  font-weight: 900;
  overflow: hidden;
  position: fixed;
  left: 0;
  text-align: center;
  text-transform: uppercase;
  text-shadow: 0 0 10px rgba(0,0,0,0.8);
  transition: 0.2s ease-out;
  width: 100%;
  height: 0;
  z-index: 100000;
}
.pullrrr-pull-top:before,
.pullrrr-pull-bottom:before {
  display: inline-block;
  transition: 0.3s ease-out;
}
.pullrrr-pull-top:after,
.pullrrr-pull-bottom:after {
  content: 'pull';
}
.pullrrr-pull-top {
  align-items: center;
  top: 0;
  transform: translateY(-100%);
}
.pullrrr-pull-top.pullrrr-over {
  align-items: flex-end;
  transform: none;
}
.pullrrr-pull-top:before {
  content: '↓';
}
.pullrrr-pull-top.pullrrr-threshold:before {
  transform: rotate(180deg);
}
.pullrrr-pull-top.pullrrr-threshold:after {
  content: 'release';
}
.pullrrr-pull-bottom {
  align-items: center;
  bottom: 0;
  transform: translateY(100%);
}
.pullrrr-pull-bottom.pullrrr-over {
  align-items: flex-start;
  transform: none;
}
.pullrrr-pull-bottom:before {
  content: '↑';
}
.pullrrr-pull-bottom.pullrrr-threshold:before {
  transform: rotate(-180deg);
}
.pullrrr-pull-bottom.pullrrr-threshold:after {
  content: 'release';
}
.pullrrr-pulling-down .pullrrr-pull-top,
.pullrrr-pulling-up .pullrrr-pull-bottom {
  transition: 0s;
}
```

License
-------

[MIT License](LICENSE)
