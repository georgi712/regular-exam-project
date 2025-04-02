import { useMemo } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

const API_KEY = "AIzaSyB9Xn_i8XOKSy58XfaVfy4VKSWpspSsfms";

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem'
};

const defaultOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
};

const LocationMap = ({ center = { lat: 42.6977, lng: 23.3219 }, zoom = 15 }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: API_KEY,
  });

  const mapCenter = useMemo(() => center, [center]);

  if (loadError) {
    return <div className="w-full h-full bg-base-200 rounded-lg flex items-center justify-center">Error loading map</div>;
  }

  if (!isLoaded) {
    return <div className="w-full h-full bg-base-200 animate-pulse rounded-lg" />;
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={mapCenter}
      zoom={zoom}
      options={defaultOptions}
    >
      <Marker position={mapCenter} />
    </GoogleMap>
  );
};

export default LocationMap; 