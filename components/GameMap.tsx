import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, CircleMarker, useMap } from 'react-leaflet';
import { LatLng, HexCell, CellStatus } from '../types';
import { COLORS } from '../constants';

interface GameMapProps {
  center: LatLng;
  cells: HexCell[];
  currentPath: LatLng[];
  userLocation: LatLng | null;
}

const MapUpdater: React.FC<{ center: LatLng }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng]);
  }, [center, map]);
  return null;
};

const GameMap: React.FC<GameMapProps> = ({ center, cells, currentPath, userLocation }) => {
  // Performance optimization: memoize polygons
  const polygons = useMemo(() => {
    return cells.map(cell => {
      let color = COLORS.NEUTRAL;
      let fillOpacity = 0.1;

      if (cell.status === CellStatus.OWNED) {
        color = COLORS.OWNED;
        fillOpacity = 0.4;
      } else if (cell.status === CellStatus.RIVAL) {
        color = COLORS.RIVAL;
        fillOpacity = 0.3;
      } else if (cell.status === CellStatus.CONTESTED) {
        color = COLORS.CONTESTED;
        fillOpacity = 0.5;
      }

      return (
        <Polygon
          key={cell.id}
          positions={cell.corners.map(c => [c.lat, c.lng])}
          pathOptions={{
            color: color,
            fillColor: color,
            fillOpacity: fillOpacity,
            weight: 1,
          }}
        />
      );
    });
  }, [cells]);

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={16}
      scrollWheelZoom={false}
      zoomControl={false}
      className="h-full w-full bg-slate-900"
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      
      {/* Map Re-centerer */}
      <MapUpdater center={center} />

      {/* Hex Grid */}
      {polygons}

      {/* User Path */}
      <Polyline
        positions={currentPath.map(p => [p.lat, p.lng])}
        pathOptions={{ color: COLORS.PATH, weight: 4, opacity: 0.8 }}
      />

      {/* User Position */}
      {userLocation && (
        <>
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={8}
            pathOptions={{
              color: '#ffffff',
              fillColor: '#3b82f6',
              fillOpacity: 1,
              weight: 2
            }}
          />
           {/* Pulse Effect */}
           <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={20}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.2,
              weight: 0
            }}
          />
        </>
      )}
    </MapContainer>
  );
};

export default GameMap;