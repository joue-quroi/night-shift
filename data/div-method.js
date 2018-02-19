'use strict';

var css = `html:before {
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
  background: rgba(red, green, blue, level);
  z-index: 10000;
}`;

var style = document.createElement('style');
style.textContent = css
  .replace('red', Math.round(prefs.red * 255))
  .replace('green', Math.round(prefs.green * 255))
  .replace('blue', Math.round(prefs.blue * 255))
  .replace('level', 1 - prefs.level);
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
    style.textContent = css
      .replace('red', Math.round(prefs.red * 255))
      .replace('green', Math.round(prefs.green * 255))
      .replace('blue', Math.round(prefs.blue * 255))
      .replace('level', 1 - prefs.level);
  }
});
