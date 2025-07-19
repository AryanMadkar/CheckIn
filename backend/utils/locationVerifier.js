const geolib = require('geolib');

exports.isLocationWithin = (orgLocation, userLocation, tolerance = 50) => {
  return geolib.getDistance(
    { latitude: orgLocation.latitude, longitude: orgLocation.longitude },
    { latitude: userLocation.latitude, longitude: userLocation.longitude }
  ) <= tolerance;
};
