(function () {
  var panel = document.getElementById('transcript-feed');

  panel.innerHTML = [
    '<div class="feed-hdr">',
      '<span class="feed-title">Transcript Feed</span>',
      '<span class="feed-count" id="feed-count">0</span>',
    '</div>',
    '<div id="transcript-list"></div>',
  ].join('');

  var STATUS_CLASS = {
    uncontacted:      'badge-red',
    neighbor_en_route: 'badge-yellow',
    safe:             'badge-green'
  };

  var STATUS_LABEL = {
    uncontacted:       'UNCONTACTED',
    neighbor_en_route: 'EN ROUTE',
    safe:              'SAFE'
  };

  var STATUS_ORDER = { uncontacted: 0, neighbor_en_route: 1, safe: 2 };

  function esc(str) {
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(String(str == null ? '' : str)));
    return d.innerHTML;
  }

  window.BlockDashboard.subscribe(function (data) {
    var users = Array.isArray(data) ? data : (data.users || []);

    var withTx = users.filter(function (u) {
      return u.transcript && u.transcript.trim();
    });

    withTx.sort(function (a, b) {
      return (STATUS_ORDER[a.status] || 0) - (STATUS_ORDER[b.status] || 0);
    });

    document.getElementById('feed-count').textContent = withTx.length;

    var list = document.getElementById('transcript-list');

    list.innerHTML = withTx.map(function (u) {
      var cls   = STATUS_CLASS[u.status] || 'badge-red';
      var lbl   = STATUS_LABEL[u.status] || u.status.toUpperCase();
      var excerpt = (u.transcript || '').substring(0, 100);
      var trail   = u.transcript && u.transcript.length > 100 ? '…' : '';

      return [
        '<div class="feed-item" data-uid="' + esc(u.id) + '">',
          '<div class="feed-item-top">',
            '<span class="feed-name">' + esc(u.name) + '</span>',
            '<span class="badge ' + cls + '">' + lbl + '</span>',
          '</div>',
          '<div class="feed-excerpt">' + esc(excerpt) + trail + '</div>',
        '</div>',
      ].join('');
    }).join('');

    list.querySelectorAll('.feed-item').forEach(function (el) {
      el.addEventListener('click', function () {
        var uid  = this.dataset.uid;
        var user = (window.BlockDashboard.currentUsers || []).find(function (u) {
          return u.id === uid;
        });
        if (user) window.BlockDashboard.openCard(user);
      });
    });
  });
}());
