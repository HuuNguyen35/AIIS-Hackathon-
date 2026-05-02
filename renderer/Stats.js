(function () {
  var bar = document.getElementById('stats-bar');

  bar.innerHTML = [
    '<div class="stats-brand">',
      'BLOCK DASHBOARD',
      '<small>EMERGENCY OPERATIONS CENTER</small>',
    '</div>',

    '<div class="v-div"></div>',

    '<div class="stats-group">',
      '<div class="stat-item">',
        '<span class="stat-lbl">Registered</span>',
        '<span class="stat-val" id="s-total">&mdash;</span>',
      '</div>',
      '<div class="stat-item">',
        '<span class="stat-lbl">Uncontacted</span>',
        '<span class="stat-val col-red" id="s-uncontacted">&mdash;</span>',
      '</div>',
      '<div class="stat-item">',
        '<span class="stat-lbl">Safe</span>',
        '<span class="stat-val col-green" id="s-safe">&mdash;</span>',
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

  window.BlockDashboard.subscribe(function (data) {
    var users = Array.isArray(data) ? data : (data.users || []);

    var total       = users.length;
    var uncontacted = users.filter(function (u) { return u.status === 'uncontacted'; }).length;
    var safe        = users.filter(function (u) { return u.status === 'safe'; }).length;

    document.getElementById('s-total').textContent       = total;
    document.getElementById('s-uncontacted').textContent = uncontacted;
    document.getElementById('s-safe').textContent        = safe;

    var alertName = 'HURRICANE BERYL — BEXAR COUNTY, TX';
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
