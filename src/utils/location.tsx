export const getPincodeFromLocation = async () => {
  const getLocation = () =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos.coords),
        (err) => reject(err),
        { enableHighAccuracy: true }
      );
    });

  try {
    const coords = await getLocation();
    const lat = coords.latitude;
    const lon = coords.longitude;

    console.log('User location:', lat, lon);

    const reverseResponse = await fetch(`https://jugaad-prod.up.railway.app/reverse?lat=${lat}&lon=${lon}`);
    if (!reverseResponse.ok) throw new Error('Reverse geocode failed');

    const reverseData = await reverseResponse.json();
    return reverseData.pincode;
  } catch (error) {
    console.error('Location or reverse geocoding failed:', error);
    return null; // fallback if failed
  }
};
