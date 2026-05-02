(function () {
  var map = L.map('map', {
    zoomControl: true,
    attributionControl: true
  }).setView([29.4241, -98.4936], 11);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map);

  setTimeout(function () { map.invalidateSize(); }, 120);

  var markers = {};

  var STATUS_COLOR = {
    uncontacted:       '#e63946',
    neighbor_en_route: '#f4a261',
    safe:              '#2a9d8f'
  };

  function markerOptions(color) {
    return {
      radius:      9,
      fillColor:   color,
      color:       '#ffffff',
      weight:      3,
      opacity:     1,
      fillOpacity: 0.9
    };
  }

  function updateMarkers(users) {
    var seen = {};

    users.forEach(function (user) {
      if (user.lat == null || user.lng == null) return;

      seen[user.id] = true;
      var color = STATUS_COLOR[user.status] || '#e63946';

      if (markers[user.id]) {
        markers[user.id].setStyle(markerOptions(color));
        markers[user.id]._blockUser = user;
      } else {
        var m = L.circleMarker([user.lat, user.lng], markerOptions(color)).addTo(map);

        m.bindTooltip(user.name, {
          permanent:  false,
          direction:  'top',
          offset:     [0, -12],
          className:  'marker-tooltip'
        });

        m._blockUser = user;
        m.on('click', function () {
          window.BlockDashboard.openCard(this._blockUser);
        });

        markers[user.id] = m;
      }
    });

    Object.keys(markers).forEach(function (id) {
      if (!seen[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
      }
    });
  }

  var banner       = document.getElementById('error-banner');
  var errorShowing = false;

  function showError(msg) {
    if (!errorShowing) {
      banner.textContent = msg;
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

  function fetchAndUpdate() {
    fetch(window.API_BASE + '/users', {
      headers: { 'ngrok-skip-browser-warning': '1' }
    })
      .then(function (res) {
        console.log('[Block] fetch status:', res.status, res.headers.get('content-type'));
        if (!res.ok) throw new Error('Server returned ' + res.status);
        return res.json();
      })
      .then(function (data) {
        console.log('[Block] data received:', JSON.stringify(data).substring(0, 200));
        clearError();
        window.BlockDashboard.emit(data);
        var users = Array.isArray(data) ? data : (data.users || []);
        console.log('[Block] users to render:', users.length);
        updateMarkers(users);
      })
      .catch(function (err) {
        console.error('[Block] fetch error:', err);
        showError('API unreachable — ' + err.message + ' (' + window.API_BASE + ')');
      });
  }

  fetchAndUpdate();
  setInterval(fetchAndUpdate, 10000);
}());
