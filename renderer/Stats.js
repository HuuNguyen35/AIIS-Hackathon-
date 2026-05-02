(function () {
  var bar = document.getElementById('stats-bar');

  bar.innerHTML = [
    '<div class="stats-brand">',
      'BLOCK',
      '<small>Emergency Operations Center</small>',
    '</div>',

    '<div class="v-div"></div>',

    '<div class="stats-group">',
      '<div class="stat-item">',
        '<span class="stat-lbl">Registered</span>',
        '<span class="stat-val" id="s-total"><span class="stat-dot dot-white"></span>&mdash;</span>',
      '</div>',
      '<div class="stat-item">',
        '<span class="stat-lbl">Uncontacted</span>',
        '<span class="stat-val col-red" id="s-uncontacted"><span class="stat-dot dot-red"></span>&mdash;</span>',
      '</div>',
      '<div class="stat-item">',
        '<span class="stat-lbl">Safe</span>',
        '<span class="stat-val col-green" id="s-safe"><span class="stat-dot dot-green"></span>&mdash;</span>',
      '</div>',
    '</div>',

    '<div class="stats-alert">',
      '<span class="alert-lbl"><span class="alert-dot"></span>Active Alert</span>',
      '<span class="alert-name" id="s-alert">&mdash;</span>',
    '</div>',

    '<div class="stats-sync">',
      '<span class="sync-lbl">Last Sync</span>',
      '<span class="sync-val" id="s-sync">&mdash;</span>',
    '</div>',
  ].join('');

  function setStatWithDot(elementId, dotClass, value) {
    var el = document.getElementById(elementId);
    while (el.firstChild) el.removeChild(el.firstChild);
    var dot = document.createElement('span');
    dot.className = 'stat-dot ' + dotClass;
    el.appendChild(dot);
    el.appendChild(document.createTextNode(value));
  }

  window.BlockDashboard.subscribe(function (data) {
    var users = Array.isArray(data) ? data : (data.users || []);

    var total       = users.length;
    var uncontacted = users.filter(function (u) { return u.status === 'uncontacted'; }).length;
    var safe        = users.filter(function (u) { return u.status === 'safe'; }).length;

    setStatWithDot('s-total', 'dot-white', total);
    setStatWithDot('s-uncontacted', 'dot-red', uncontacted);
    setStatWithDot('s-safe', 'dot-green', safe);

    var alertName = 'NO ACTIVE ALERTS';
    if (data && data.alert) {
      alertName = (data.alert.name || '') + (data.alert.county ? ' — ' + data.alert.county : '');
    } else if (data && data.alertName) {
      alertName = data.alertName;
    }
    document.getElementById('s-alert').textContent = alertName;

    var now = new Date();
    document.getElementById('s-sync').textContent = now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  });
}());
