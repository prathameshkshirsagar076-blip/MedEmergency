/**
 * Haversine Formula for distance calculation between two GPS coordinates in Kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return Infinity;
  }

  const p1 = parseFloat(lat1);
  const l1 = parseFloat(lon1);
  const p2 = parseFloat(lat2);
  const l2 = parseFloat(lon2);

  if (isNaN(p1) || isNaN(l1) || isNaN(p2) || isNaN(l2)) {
    return Infinity;''
  }

  const R = 6371; // Earth's mean radius in kilometers
  const dLat = ((p2 - p1) * Math.PI) / 180;
  const dLon = ((l2 - l1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1 * Math.PI) / 180) *
      Math.cos((p2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return Math.round(d * 100) / 100; // Round to 2 decimal places
}

/**
 * Filter and sort stores within a specified radius
 */
function filterStoresByRadius(stores, patientLat, patientLng, radiusKm = 5.0) {
  return stores
    .map((store) => {
      const storeObj = store.toJSON ? store.toJSON() : { ...store };
      const distance = calculateDistance(
        patientLat,
        patientLng,
        storeObj.latitude,
        storeObj.longitude
      );
      return {
        ...storeObj,
        distance_km: distance,
      };
    })
    .filter((store) => store.distance_km <= radiusKm)
    .sort((a, b) => a.distance_km - b.distance_km);
}

module.exports = {
  calculateDistance,
  filterStoresByRadius,
};
