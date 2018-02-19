'use strict';

document.addEventListener('input', ({target}) => {
  if (target.type === 'range') {
    target.closest('tr').querySelector('span').textContent = parseInt(target.value * 100) + '%';
  }
});

document.addEventListener('input', ({target}) => {
  if (target.id === 'method') {
    return localStorage.setItem('method', target.value);
  }
  chrome.storage.local.set({
    [target.id]: target.type === 'range' ? Number(target.value) : target.value
  });
});

var set = (id, v) => {
  document.getElementById(id).value = v;
  document.getElementById(id).dispatchEvent(new Event('input', {
    bubbles: true
  }));
};

document.getElementById('method').value = localStorage.getItem('method') || 'div-method';
chrome.storage.local.get({
  'day-time': '08:00',
  'night-time': '19:00',
  'day-r-range': 1,
  'day-g-range': 0.95,
  'day-b-range': 0.90,
  'day-level': 0.95,
  'night-r-range': 1,
  'night-g-range': 0.95,
  'night-b-range': 0.90,
  'night-level': 0.9
}, prefs => {
  document.getElementById('day-time').value = prefs['day-time'];
  document.getElementById('night-time').value = prefs['night-time'];

  set('day-r-range', prefs['day-r-range']);
  set('day-g-range', prefs['day-g-range']);
  set('day-b-range', prefs['day-b-range']);
  set('day-level', prefs['day-level']);
  set('night-r-range', prefs['night-r-range']);
  set('night-g-range', prefs['night-g-range']);
  set('night-b-range', prefs['night-b-range']);
  set('night-level', prefs['night-level']);
});
