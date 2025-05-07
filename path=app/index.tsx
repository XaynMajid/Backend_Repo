import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';

// Initialize Mapbox
Mapbox.setAccessToken('pk.eyJ1IjoiemFpbjAwNzgiLCJhIjoiY205anpmMjdkMGdxczJyb29oZDFrcnlqdSJ9.yq_UgdOd8WM8SbZf16JHgw');

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [destination, setDestination] = useState({
    longitude: 0,
    latitude: 0,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      
      // Set destination 3km away from current location
      setDestination({
        longitude: currentLocation.coords.longitude + 0.03, // ~3km east
        latitude: currentLocation.coords.latitude + 0.03,   // ~3km north
      });
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street}
        logoEnabled={false}
        compassEnabled={true}
        attributionEnabled={false}
        onDidFinishLoadingMap={() => setIsMapReady(true)}
      >
        {location && (
          <Mapbox.Camera
            zoomLevel={14}
            centerCoordinate={[location.coords.longitude, location.coords.latitude]}
            animationMode="flyTo"
            animationDuration={2000}
          />
        )}

        {/* Current Location Marker */}
        {location && isMapReady && (
          <Mapbox.MarkerView
            id="currentLocation"
            coordinate={[location.coords.longitude, location.coords.latitude]}
          >
            <View style={styles.markerContainer}>
              <View style={styles.markerBody}>
                <View style={styles.markerHead} />
              </View>
              <View style={[styles.markerDot, styles.currentLocationDot]} />
            </View>
          </Mapbox.MarkerView>
        )}

        {/* Destination Marker */}
        {isMapReady && (
          <Mapbox.MarkerView
            id="destination"
            coordinate={[destination.longitude, destination.latitude]}
          >
            <View style={styles.markerContainer}>
              <View style={[styles.markerBody, styles.destinationBody]}>
                <View style={[styles.markerHead, styles.destinationHead]} />
              </View>
              <View style={[styles.markerDot, styles.destinationDot]} />
            </View>
          </Mapbox.MarkerView>
        )}
      </Mapbox.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerBody: {
    width: 20,
    height: 20,
    backgroundColor: '#2196F3',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 5,
  },
  markerHead: {
    width: 8,
    height: 8,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  markerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 2,
  },
  currentLocationDot: {
    backgroundColor: '#2196F3',
    borderWidth: 1,
    borderColor: 'white',
  },
  destinationBody: {
    backgroundColor: '#FF5252',
  },
  destinationHead: {
    backgroundColor: 'white',
  },
  destinationDot: {
    backgroundColor: '#FF5252',
    borderWidth: 1,
    borderColor: 'white',
  },
});