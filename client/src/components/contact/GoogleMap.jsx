import { useMemo } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

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
  const mapCenter = useMemo(() => center, [center]);

  return (
    <LoadScript googleMapsApiKey={API_KEY} loadingElement={<div className="w-full h-full bg-base-200 animate-pulse rounded-lg" />}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={zoom}
        options={defaultOptions}
      >
        <Marker position={mapCenter} />
      </GoogleMap>
    </LoadScript>
  );
};

export default LocationMap; 