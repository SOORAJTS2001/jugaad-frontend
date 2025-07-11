export const getPincodeFromLocation = async () => {
  const getLocation = () =>
    new Promise<GeolocationCoordinates>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Geolocation timeout after 10s"));
      }, 10000);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timeoutId);
          resolve(pos.coords);
        },
        (err) => {
          clearTimeout(timeoutId);
          reject(err);
        },
        { enableHighAccuracy: true }
      );
    });

  try {
    const coords = await getLocation();
    if (!coords?.latitude || !coords?.longitude) {
      console.warn("Incomplete coordinates, skipping reverse geocoding");
      return null;
    }

    const lat = coords.latitude;
    const lon = coords.longitude;

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const reverseResponse = await fetch(`${backendUrl}/reverse?lat=${lat}&lon=${lon}`);
    if (!reverseResponse.ok) {
      console.warn("Reverse geocoding failed with status:", reverseResponse.status);
      return null;
    }

    const reverseData = await reverseResponse.json();
    return { pincode: reverseData.pincode, lat, lon };

  } catch (error) {
    console.warn("getPincodeFromLocation failed:", error);
    return null;
  }
};
