(function () {
  var panel     = document.getElementById('person-card-panel');
  var container = document.getElementById('person-card');

  var STATUS_CLASS = {
    uncontacted:       'badge-red',
    neighbor_en_route: 'badge-yellow',
    safe:              'badge-green'
  };

  var STATUS_LABEL = {
    uncontacted:       'UNCONTACTED',
    neighbor_en_route: 'NEIGHBOR EN ROUTE',
    safe:              'SAFE'
  };

  function esc(str) {
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(String(str == null ? '' : str)));
    return d.innerHTML;
  }

  function renderCard(user) {
    var cls  = STATUS_CLASS[user.status] || 'badge-red';
    var lbl  = STATUS_LABEL[user.status] || (user.status || '').toUpperCase();
    var safe = user.status === 'safe';

    var transcriptBlock = '';
    if (user.transcript && user.transcript.trim()) {
      transcriptBlock = [
        '<div class="card-section">',
          '<div class="section-hdr">Call Transcript</div>',
          '<div class="card-transcript">' + esc(user.transcript) + '</div>',
        '</div>',
      ].join('');
    }

    var actionBlock = '';
    if (!safe) {
      actionBlock = [
        '<div class="card-section card-actions">',
          '<button class="btn-safe" id="btn-mark-safe">MARK AS SAFE</button>',
        '</div>',
      ].join('');
    }

    return [
      '<div class="card-wrap">',

        '<div class="card-hdr">',
          '<div>',
            '<div class="card-name">' + esc(user.name) + '</div>',
            '<div class="card-uid">ID: ' + esc(user.id) + '</div>',
          '</div>',
          '<button class="card-close" id="btn-card-close">&#x2715;</button>',
        '</div>',

        '<div class="card-status-row">',
          '<span class="badge badge-lg ' + cls + '">' + lbl + '</span>',
        '</div>',

        '<div class="card-section">',
          '<div class="card-field">',
            '<span class="f-lbl">Address</span>',
            '<span class="f-val">' + esc(user.address || '—') + '</span>',
          '</div>',
          '<div class="card-field">',
            '<span class="f-lbl">Floor</span>',
            '<span class="f-val mono">' + esc(user.floor != null ? user.floor : '—') + '</span>',
          '</div>',
          '<div class="card-field">',
            '<span class="f-lbl">Disability</span>',
            '<span class="f-val">' + esc(user.disability || 'None reported') + '</span>',
          '</div>',
          '<div class="card-field">',
            '<span class="f-lbl">Medications</span>',
            '<span class="f-val">' + esc(user.medications || 'None reported') + '</span>',
          '</div>',
          '<div class="card-field">',
            '<span class="f-lbl">Phone</span>',
            '<span class="f-val mono">' + esc(user.phone || '—') + '</span>',
          '</div>',
          '<div class="card-field">',
            '<span class="f-lbl">Neighbor Phone</span>',
            '<span class="f-val mono">' + esc(user.neighborPhone || '—') + '</span>',
          '</div>',
        '</div>',

        transcriptBlock,
        actionBlock,

      '</div>',
    ].join('');
  }

  function markSafe(user) {
    var btn = document.getElementById('btn-mark-safe');
    if (!btn) return;
    btn.textContent = 'SENDING…';
    btn.disabled = true;

    fetch(window.API_BASE + '/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, status: 'safe' })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        if (btn) {
          btn.textContent = '✓ MARKED SAFE';
        }
      })
      .catch(function () {
        if (btn) {
          btn.textContent = 'RETRY';
          btn.disabled = false;
        }
      });
  }

  window.BlockDashboard.openCard = function (user) {
    container.innerHTML = renderCard(user);
    panel.classList.add('open');

    var closeBtn = document.getElementById('btn-card-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        panel.classList.remove('open');
      });
    }

    var safeBtn = document.getElementById('btn-mark-safe');
    if (safeBtn) {
      safeBtn.addEventListener('click', function () {
        markSafe(user);
      });
    }
  };
}());
