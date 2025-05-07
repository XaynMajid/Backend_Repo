import React from 'react';
import Mapbox from '@rnmapbox/maps';

interface LineRouteProps {
  coordinates: [number, number][];
}

const LineRoute: React.FC<LineRouteProps> = ({ coordinates }) => {
  return (
    <Mapbox.ShapeSource
      id="routeSource"
      shape={{
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coordinates
        }
      }}
    >
      {/* Main route line */}
      <Mapbox.LineLayer
        id="routeLine"
        style={{
          lineColor: '#2196F3',
          lineWidth: 4,
          lineCap: 'round',
          lineJoin: 'round'
        }}
      />
      {/* Route line outline for better visibility */}
      <Mapbox.LineLayer
        id="routeLineOutline"
        style={{
          lineColor: '#1565C0',
          lineWidth: 6,
          lineCap: 'round',
          lineJoin: 'round',
          lineOpacity: 0.5
        }}
        belowLayerID="routeLine"
      />
    </Mapbox.ShapeSource>
  );
};

export default LineRoute; 