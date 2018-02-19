'use strict';

var css = `html {
  filter: url(#dsfhYfbhj);
}
html:before {
  content: ' ';
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background: #fff;
  z-index: -1;
}
html:after {
  content: ' ';
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background: rgba(0, 0, 0, level);
  z-index: 10000;
}`;
var matrix = 'red 0 0 0 0 0 green 0 0 0 0 0 blue 0 0 0 0 0 1 0';

var svg = document.createElement('svg');
svg.setAttribute('height', 0);
var filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
filter.id = 'dsfhYfbhj';
var feColorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
feColorMatrix.setAttribute(
  'values',
  matrix.replace('red', prefs.red)
    .replace('green', prefs.green)
    .replace('blue', prefs.blue)
);
filter.appendChild(feColorMatrix);
svg.appendChild(filter);
document.documentElement.appendChild(svg);

var style = document.createElement('style');
style.textContent = css.replace('level', 1 - prefs.level);
document.documentElement.appendChild(style);

chrome.storage.onChanged.addListener(ps => {
  if (ps.red) {
    prefs.red = ps.red.newValue;
  }
  if (ps.green) {
    prefs.green = ps.green.newValue;
  }
  if (ps.blue) {
    prefs.blue = ps.blue.newValue;
  }
  if (ps.level) {
    prefs.level = ps.level.newValue;
  }

  if (ps.red || ps.green || ps.blue || ps.level) {
    feColorMatrix.setAttribute(
      'values',
      matrix.replace('red', prefs.red)
        .replace('green', prefs.green)
        .replace('blue', prefs.blue)
    );
    style.textContent = css.replace('level', 1 - prefs.level);
  }
});
