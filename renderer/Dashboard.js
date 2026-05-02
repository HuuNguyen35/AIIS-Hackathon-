(function () {
  /* ── Map init ── */
  var map = L.map('map', {
    zoomControl: true,
    attributionControl: true
  }).setView([29.4241, -98.4936], 12);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map);

  /* Force map to fill its flex container after layout settles */
  setTimeout(function () { map.invalidateSize(); }, 120);

  /* ── Marker state ── */
  var markers = {};

  var STATUS_COLOR = {
    uncontacted:       '#ff2020',
    neighbor_en_route: '#ffc400',
    safe:              '#00cc44'
  };

  var STATUS_LABEL = {
    uncontacted:       'UNCONTACTED',
    neighbor_en_route: 'EN ROUTE',
    safe:              'SAFE'
  };

  function markerOptions(color) {
    return {
      radius:      13,
      fillColor:   color,
      color:       color,
      weight:      2,
      opacity:     1,
      fillOpacity: 0.82
    };
  }

  function updateMarkers(users) {
    var seen = {};

    users.forEach(function (user) {
      if (user.lat == null || user.lng == null) return;

      seen[user.id] = true;
      var color = STATUS_COLOR[user.status] || '#ff2020';

      if (markers[user.id]) {
        markers[user.id].setStyle(markerOptions(color));
        markers[user.id]._blockUser = user;
      } else {
        var m = L.circleMarker([user.lat, user.lng], markerOptions(color)).addTo(map);

        m.bindTooltip(user.name, {
          permanent:  false,
          direction:  'top',
          offset:     [0, -14],
          className:  'marker-tooltip'
        });

        m._blockUser = user;
        m.on('click', function () {
          window.BlockDashboard.openCard(this._blockUser);
        });

        markers[user.id] = m;
      }
    });

    /* Remove stale markers */
    Object.keys(markers).forEach(function (id) {
      if (!seen[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
      }
    });
  }

  /* ── Error banner ── */
  var banner       = document.getElementById('error-banner');
  var errorShowing = false;

  function showError(msg) {
    if (!errorShowing) {
      banner.textContent = '⚠ ' + msg;
      banner.style.display = 'block';
      errorShowing = true;
    }
  }

  function clearError() {
    if (errorShowing) {
      banner.style.display = 'none';
      errorShowing = false;
    }
  }

  /* ── Polling ── */
  function fetchAndUpdate() {
    fetch(window.API_BASE + '/users')
      .then(function (res) {
        if (!res.ok) throw new Error('Server returned ' + res.status);
        return res.json();
      })
      .then(function (data) {
        clearError();
        window.BlockDashboard.emit(data);
        var users = Array.isArray(data) ? data : (data.users || []);
        updateMarkers(users);
      })
      .catch(function (err) {
        showError('API unreachable — ' + err.message + ' (' + window.API_BASE + ')');
      });
  }

  fetchAndUpdate();
  setInterval(fetchAndUpdate, 10000);
}());
