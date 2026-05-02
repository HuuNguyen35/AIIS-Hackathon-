const { readUsers } = require("../db/store");

const RADIUS_METERS = 500;

function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6_371_000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function notifyNearbyUsers(affectedUser) {
  const users = readUsers();

  const nearby = users.filter((u) => {
    if (u.id === affectedUser.id) return false;
    const dist = haversineMeters(affectedUser.lat, affectedUser.lng, u.lat, u.lng);
    return dist <= RADIUS_METERS;
  });

  if (nearby.length === 0) {
    console.log(`No neighbors within ${RADIUS_METERS}m of ${affectedUser.name}`);
    return;
  }

  for (const neighbor of nearby) {
    const message = `${affectedUser.name} at ${affectedUser.address} floor ${affectedUser.floor} needs help. They have ${affectedUser.disability || "no listed disability"}. Here is their location: ${affectedUser.lat},${affectedUser.lng}`;
    console.log(`NOTIFY ${neighbor.phone}: ${message}`);
  }
}

module.exports = { notifyNearbyUsers };
