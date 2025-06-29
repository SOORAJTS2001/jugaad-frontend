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

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const reverseResponse = await fetch(`${backendUrl}/reverse?lat=${lat}&lon=${lon}`);
    if (!reverseResponse.ok) throw new Error('Reverse geocode failed');

    const reverseData = await reverseResponse.json();
    return {pincode:reverseData.pincode, lat, lon};
  } catch (error) {
    console.error('Location or reverse geocoding failed:', error);
    return null; // fallback if failed
  }
};
