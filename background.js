/* globals webext */
'use strict';

webext.webNavigation.on('committed', ({tabId}) => {
  webext.tabs.executeScript(tabId, {
    runAt: 'document_start',
    code: `
      var prefs = {
        red: ${localStorage.getItem('red') || 1},
        green: ${localStorage.getItem('green') || 0.95},
        blue: ${localStorage.getItem('blue') || 0.90},
        level: ${localStorage.getItem('level') || 0.95}
      };
    `
  }, () => webext.tabs.executeScript(tabId, {
    runAt: 'document_start',
    file: '/data/' + (localStorage.getItem('method') || 'div-method') + '.js'
  }));
}).if(({frameId, url}) => frameId === 0 && (url.startsWith('http') || url.startsWith('file')));

function update(reason) {
  webext.storage.get({
    'day-time': '08:00',
    'night-time': '19:00',
    'day-r-range': 1,
    'day-g-range': 0.95,
    'day-b-range': 0.90,
    'day-level': .95,
    'night-r-range': 1,
    'night-g-range': 0.95,
    'night-b-range': 0.90,
    'night-level': 0.9
  }).then(prefs => {
    const day = prefs['day-time'].split(':').map((s, i) => s * (i === 0 ? 60 : 1)).reduce((p, c) => p + c, 0);
    let night = prefs['night-time'].split(':').map((s, i) => s * (i === 0 ? 60 : 1)).reduce((p, c) => p + c, 0);

    if (night <= day) {
      night += 24 * 60;
    }
    const d = new Date();
    const now = d.getMinutes() + d.getHours() * 60;

    if (now > day && now < night) {
      localStorage.setItem('red', prefs['day-r-range']);
      localStorage.setItem('green', prefs['day-g-range']);
      localStorage.setItem('blue', prefs['day-b-range']);
      localStorage.setItem('level', prefs['day-level']);
    }
    else {
      localStorage.setItem('red', prefs['night-r-range']);
      localStorage.setItem('green', prefs['night-g-range']);
      localStorage.setItem('blue', prefs['night-b-range']);
      localStorage.setItem('level', prefs['night-level']);
    }
    webext.storage.set({
      red: localStorage.getItem('red'),
      green: localStorage.getItem('green'),
      blue: localStorage.getItem('blue'),
      level: localStorage.getItem('level')
    });
  });
}

webext.storage.on('changed', () => update('prefs.changed'))
  .if(ps => ps['night-r-range'] || ps['day-r-range'] ||
    ps['night-g-range'] || ps['day-g-range'] ||
    ps['night-b-range'] || ps['day-b-range'] ||
    ps['day-level'] || ps['night-level'] ||
    ps['night-time'] || ps['day-time']);

function setAlartm(id, val) {
  val = val.split(':');
  const d = new Date();
  d.setSeconds(0);
  d.setHours(val[0]);
  d.setMinutes(val[1]);

  const now = Date.now();
  const when = d.getTime();
  webext.alarms.create(id, {
    when: when <= now ? when + 24 * 60 * 60 * 1000 : when,
    periodInMinutes: 24 * 60
  });
}

webext.storage.on('changed', ps => {
  setAlartm('day-time', ps['day-time'].newValue);
}).if(ps => ps['day-time']);

webext.storage.on('changed', ps => {
  setAlartm('night-time', ps['night-time'].newValue);
}).if(ps => ps['night-time']);

webext.runtime.on('start-up', () => webext.storage.get({
  'day-time': '08:00',
  'night-time': '19:00'
}).then(prefs => {
  setAlartm('day-time', prefs['day-time']);
  setAlartm('night-time', prefs['night-time']);
  update('start.up');
}));

webext.alarms.on('alarm', ({name}) => update('alarm.' + name));
webext.idle.on('changed', () => update('idle.active')).if(state => state === 'active');

// FAQs and Feedback
webext.runtime.on('start-up', () => {
  const {name, version, homepage_url} = webext.runtime.getManifest();
  const page = homepage_url; // eslint-disable-line camelcase
  // FAQs
  webext.storage.get({
    'version': null,
    'faqs': navigator.userAgent.indexOf('Firefox') === -1,
    'last-update': 0,
  }).then(prefs => {
    if (prefs.version ? (prefs.faqs && prefs.version !== version) : true) {
      const now = Date.now();
      const doUpdate = (now - prefs['last-update']) / 1000 / 60 / 60 / 24 > 30;
      webext.storage.set({
        version,
        'last-update': doUpdate ? Date.now() : prefs['last-update']
      }).then(() => {
        // do not display the FAQs page if last-update occurred less than 30 days ago.
        if (doUpdate) {
          const p = Boolean(prefs.version);
          webext.tabs.create({
            url: page + '&version=' + version +
              '&type=' + (p ? ('upgrade&p=' + prefs.version) : 'install'),
            active: p === false
          });
        }
      });
    }
  });
  // Feedback
  webext.runtime.setUninstallURL(
    page + '&rd=feedback&name=' + name + '&version=' + version
  );
});
