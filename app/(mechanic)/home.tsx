import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated, Dimensions, ActivityIndicator, ScrollView, Alert } from 'react-native';
import Mapbox, { Camera } from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import OfferModal from '../components/OfferModal';
import { BASE_URL, API_ENDPOINTS } from '../config';
import { setLiveStatus } from '../store/liveStatusSlice';
import LineRoute from '../components/LineRoute';

Mapbox.setAccessToken('pk.eyJ1IjoiemFpbjAwNzgiLCJhIjoiY205anpmMjdkMGdxczJyb29oZDFrcnlqdSJ9.yq_UgdOd8WM8SbZf16JHgw');

const DUMMY_CUSTOMERS = [
  { id: '1', name: 'Omer Ali', issue: 'Flat Tire', price: 1200, distance: 5 },
  { id: '2', name: 'Ahmed Raza', issue: 'Engine Overheat', price: 2500, distance: 10 },
  { id: '3', name: 'Fatima Noor', issue: 'Battery Dead', price: 1800, distance: 15 },
  { id: '4', name: 'Ayesha Khan', issue: 'Brake Issue', price: 1600, distance: 20 },
  { id: '5', name: 'Bilal Saeed', issue: 'Oil Change', price: 900, distance: 25 },
  { id: '6', name: 'Hassan Tariq', issue: 'Radiator Leak', price: 2100, distance: 30 },
  { id: '7', name: 'Sana Malik', issue: 'AC Repair', price: 1700, distance: 35 },
  { id: '8', name: 'Zainab Iqbal', issue: 'Suspension Issue', price: 2200, distance: 40 },
];

const TILE_WIDTH = Dimensions.get('window').width * 0.9;

interface Customer {
  id: string;
  name: string;
  issue: string;
  price: number;
  distance: number;
}

interface Issue {
  _id: string;
  vehicleType: string;
  description: string;
  expectedPrice: number;
  location: {
    type: string;
    coordinates: [number, number];
  };
  offers?: Array<{
    mechanic: string;
    price: number;
    estimatedTime: string;
    notes: string;
  }>;
  user?: {
    fullName: string;
  };
}

interface MechanicData {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  cnic: string;
  experience: string;
  hourlyRate: string;
  availability: string;
  vehicleTypes: string[];
  serviceRadius: string;
  serviceAreas: string;
  isLive: boolean;
  rating?: number;
  token?: string;
  _id?: string;
}

// Function to calculate distance between two points in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Function to get directions using Mapbox Directions API
async function getDirections(start: [number, number], end: [number, number]) {
  const accessToken = 'pk.eyJ1IjoiemFpbjAwNzgiLCJhIjoiY205anpmMjdkMGdxczJyb29oZDFrcnlqdSJ9.yq_UgdOd8WM8SbZf16JHgw';
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${accessToken}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching directions:', error);
    throw error;
  }
}

export default function MechanicHomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nearbyIssues, setNearbyIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isOfferModalVisible, setIsOfferModalVisible] = useState(false);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [acceptedIssue, setAcceptedIssue] = useState<any>(null);
  const cameraRef = useRef<Mapbox.Camera>(null);
  const mechanicData = useSelector((state: RootState) => state.mechanicData);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation);
    })();
  }, []);

  useEffect(() => {
    if (isLive && location) {
      // Update mechanic's location
      const updateLocation = async () => {
        try {
          console.log('Updating mechanic location:', {
            longitude: location.coords.longitude,
            latitude: location.coords.latitude
          });
          console.log('Using endpoint:', API_ENDPOINTS.UPDATE_MECHANIC_LOCATION);
          console.log('Using token:', mechanicData.token);

          const response = await axios.post(
            API_ENDPOINTS.UPDATE_MECHANIC_LOCATION,
            {
              location: {
                type: 'Point',
                coordinates: [location.coords.longitude, location.coords.latitude]
              }
            },
            {
              headers: {
                'Authorization': `Bearer ${mechanicData.token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          console.log('Location update response:', response.data);
        } catch (error: any) {
          console.error('Error updating location:', error);
          console.error('Error response:', error.response?.data);
          console.error('Error status:', error.response?.status);
          console.error('Error config:', error.config);
          setErrorMsg(error.response?.data?.message || 'Error updating location');
        }
      };

      // Initial location update
      updateLocation();

      // Set up location update interval
      const locationInterval = setInterval(updateLocation, 30000); // Update every 30 seconds

      return () => clearInterval(locationInterval);
    }
  }, [isLive, location]);

  const fetchNearbyIssues = async () => {
    if (!isLive || !location) return;
    
    try {
      setIsLoading(true);
      setErrorMsg(null);
      
      console.log('Fetching nearby issues with location:', {
        longitude: location.coords.longitude,
        latitude: location.coords.latitude
      });

      console.log('Using endpoint:', API_ENDPOINTS.GET_NEARBY_ISSUES);
      console.log('Using token:', mechanicData.token);

      const response = await axios.get(
        API_ENDPOINTS.GET_NEARBY_ISSUES,
        {
          headers: {
            'Authorization': `Bearer ${mechanicData.token}`,
            'Content-Type': 'application/json'
          },
          params: {
            longitude: location.coords.longitude,
            latitude: location.coords.latitude,
            maxDistance: 10000 // 10km radius
          }
        }
      );

      console.log('Nearby issues response:', response.data);

      if (response.data) {
        // Filter out issues that already have an offer from this mechanic
        const filteredIssues = response.data.filter((issue: Issue) => {
          if (!issue.offers) return true;
          return !issue.offers.some(offer => offer.mechanic === mechanicData._id);
        });
        
        console.log('Filtered issues:', filteredIssues);
        setNearbyIssues(filteredIssues);
      }
    } catch (error: any) {
      console.error('Error fetching nearby issues:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setErrorMsg(error.response?.data?.message || 'Error fetching nearby issues');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLive) {
      // Initial fetch
      fetchNearbyIssues();
      
      // Set up polling every 5 seconds
      const interval = setInterval(fetchNearbyIssues, 5000);
      
      return () => clearInterval(interval);
    } else {
      // Clear issues when going offline
      setNearbyIssues([]);
    }
  }, [isLive]);

  // Add polling for accepted offers
  useEffect(() => {
    if (isLive) {
      const pollInterval = setInterval(async () => {
        try {
          const response = await axios.get(
            `${API_ENDPOINTS.GET_MECHANIC_OFFERS}`,
            {
              headers: {
                'Authorization': `Bearer ${mechanicData.token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.data) {
            // Find accepted offers
            const acceptedOffers = response.data.filter((offer: any) => 
              offer.status === 'ACCEPTED' && offer.issue.status === 'ACCEPTED'
            );

            if (acceptedOffers.length > 0) {
              const latestAcceptedOffer = acceptedOffers[0];
              setAcceptedIssue(latestAcceptedOffer.issue);

              // If we have location data, calculate route
              if (location && latestAcceptedOffer.issue.location?.coordinates) {
                const [userLon, userLat] = latestAcceptedOffer.issue.location.coordinates;
                
                // Calculate distance
                const distance = calculateDistance(
                  location.coords.latitude,
                  location.coords.longitude,
                  userLat,
                  userLon
                );
                setDistance(distance);

                // Set destination
                const destinationCoords: [number, number] = [userLon, userLat];
                setDestination(destinationCoords);

                // Get and set route
                const start: [number, number] = [location.coords.longitude, location.coords.latitude];
                const directions = await getDirections(start, destinationCoords);
                
                if (directions && directions.routes && directions.routes[0]) {
                  const route = directions.routes[0].geometry.coordinates;
                  setRouteCoordinates(route);
                }

                // Set navigating state
                setIsNavigating(true);
              }
            }
          }
        } catch (error) {
          console.error('Error polling for accepted offers:', error);
        }
      }, 5000);

      return () => clearInterval(pollInterval);
    }
  }, [isLive, location, mechanicData.token]);

  // Update location periodically
  useEffect(() => {
    let locationInterval: NodeJS.Timeout;

    const updateLocation = async () => {
      try {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(currentLocation);

        // If we're navigating, update the route
        if (isNavigating && destination) {
          const start: [number, number] = [currentLocation.coords.longitude, currentLocation.coords.latitude];
          const directions = await getDirections(start, destination);
          
          if (directions && directions.routes && directions.routes[0]) {
            const route = directions.routes[0].geometry.coordinates;
            setRouteCoordinates(route);
          }
        }
      } catch (error) {
        console.error('Error updating location:', error);
      }
    };

    if (isLive) {
      // Update location every 10 seconds
      locationInterval = setInterval(updateLocation, 10000);
      updateLocation(); // Initial update
    }

    return () => {
      if (locationInterval) {
        clearInterval(locationInterval);
      }
    };
  }, [isLive, isNavigating, destination]);

  const handleToggleLive = () => {
    setIsLive(!isLive);
    dispatch(setLiveStatus(!isLive));
  };

  const handleGiveOffer = async (issueId: string, price: number, estimatedTime: number, notes: string) => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      
      console.log('Submitting offer for issue:', issueId);
      console.log('Offer details:', { price, estimatedTime, notes });
      console.log('Using token:', mechanicData.token);

      const response = await axios.post(
        `${API_ENDPOINTS.SUBMIT_OFFER}/${issueId}/offer`,
        {
          price,
          estimatedTime,
          notes
        },
        {
          headers: {
            'Authorization': `Bearer ${mechanicData.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Offer submission response:', response.data);

      if (response.data) {
        setSuccessMsg('Offer submitted successfully!');
        // Remove the issue from the list
        setNearbyIssues(prev => prev.filter(issue => issue._id !== issueId));
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMsg(null);
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error submitting offer:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setErrorMsg(error.response?.data?.message || 'Error submitting offer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectIssue = (issueId: string) => {
    // Remove the issue from the list
    setNearbyIssues(prev => prev.filter(issue => issue._id !== issueId));
  };

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street}
        logoEnabled={false}
        compassEnabled={true}
        attributionEnabled={false}
      >
        <Mapbox.Camera
          ref={cameraRef}
          zoomLevel={14}
          centerCoordinate={location ? [location.coords.longitude, location.coords.latitude] : [73.0479, 30.3753]}
          animationMode="flyTo"
          animationDuration={2000}
        />

        {/* Current Location Marker */}
        {location && (
          <Mapbox.MarkerView
            id="currentLocation"
            coordinate={[location.coords.longitude, location.coords.latitude]}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={[styles.markerContainer, { transform: [{ scale: 1.2 }] }]}>
              <View style={[styles.markerBody, { width: 45, height: 45 }]}>
                <FontAwesome name="wrench" size={28} color="white" />
              </View>
            </View>
          </Mapbox.MarkerView>
        )}

        {/* Destination Marker */}
        {destination && (
          <Mapbox.MarkerView
            id="destination"
            coordinate={destination}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={[styles.markerContainer, { transform: [{ scale: 1.2 }] }]}>
              <View style={[styles.markerBody, styles.destinationBody, { width: 45, height: 45 }]}>
                <FontAwesome name="user" size={28} color="white" />
              </View>
            </View>
          </Mapbox.MarkerView>
        )}

        {/* Route Line */}
        {routeCoordinates.length > 0 && (
          <LineRoute coordinates={routeCoordinates} />
        )}
      </Mapbox.MapView>

      {/* Show active issue status if there is one */}
      {acceptedIssue && (
        <View style={styles.activeIssueContainer}>
          <Text style={styles.activeIssueTitle}>
            Active Issue
          </Text>
          <Text style={styles.issueDescription}>
            {acceptedIssue.description}
          </Text>
          {distance !== null && (
            <Text style={styles.distanceText}>
              Distance to user: {distance.toFixed(2)} km
            </Text>
          )}
        </View>
      )}

      {/* Status Message */}
      {!isLive && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>You are currently offline</Text>
          <Text style={styles.statusSubText}>Go live to see nearby issues</Text>
        </View>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Fetching nearby issues...</Text>
        </View>
      )}

      {/* Error Message */}
      {errorMsg && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {/* Success Message */}
      {successMsg && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>{successMsg}</Text>
        </View>
      )}

      {/* Nearby Issues List */}
      {isLive && nearbyIssues.length > 0 && (
        <View style={styles.issuesContainer}>
          <Text style={styles.issuesTitle}>Nearby Issues</Text>
          <ScrollView style={styles.issuesScroll}>
            {nearbyIssues.map((issue) => (
              <View key={issue._id} style={styles.issueTile}>
                <View style={styles.issueHeader}>
                  <View>
                    <Text style={styles.issueVehicleType}>{issue.vehicleType}</Text>
                    <Text style={styles.userName}>User: {issue.user?.fullName || 'Unknown User'}</Text>
                  </View>
                  <Text style={styles.issuePrice}>PKR {issue.expectedPrice}</Text>
                </View>
                <Text style={styles.issueDescription}>{issue.description}</Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.offerButton]}
                    onPress={() => {
                      setSelectedIssue(issue);
                      setIsOfferModalVisible(true);
                    }}
                  >
                    <Text style={styles.actionButtonText}>Give Offer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleRejectIssue(issue._id)}
                  >
                    <Text style={styles.actionButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Find Issues Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.findIssuesButton, isLive && styles.findIssuesButtonActive]}
          onPress={handleToggleLive}
          disabled={isLoading}
        >
          <FontAwesome name={isLive ? "times-circle" : "search"} size={22} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.findIssuesButtonText}>
            {isLive ? 'Stop Finding Issues' : 'Find Issues'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add the OfferModal */}
      <OfferModal
        visible={isOfferModalVisible}
        onClose={() => {
          setIsOfferModalVisible(false);
          setSelectedIssue(null);
        }}
        onSubmit={(price, estimatedTime, notes) => {
          if (selectedIssue) {
            handleGiveOffer(selectedIssue._id, price, estimatedTime, notes);
            setIsOfferModalVisible(false);
            setSelectedIssue(null);
          }
        }}
        issuePrice={selectedIssue?.expectedPrice || 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  statusContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  statusSubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  loadingContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2563eb',
  },
  errorContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
  },
  successContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  successText: {
    color: 'white',
    fontSize: 16,
  },
  issuesContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    maxHeight: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 15,
  },
  issuesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  issuesScroll: {
    maxHeight: '100%',
  },
  issueTile: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  issueVehicleType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  issuePrice: {
    fontSize: 16,
    color: '#666',
  },
  issueDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  offerButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  findIssuesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    elevation: 2,
  },
  findIssuesButtonActive: {
    backgroundColor: '#f44336',
  },
  findIssuesButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerBody: {
    width: 40,
    height: 40,
    backgroundColor: '#2196F3',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 5,
  },
  destinationBody: {
    backgroundColor: '#FF5252',
  },
  activeIssueContainer: {
    position: 'absolute',
    top: 90,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 3,
  },
  activeIssueTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  userName: {
    fontSize: 14,
    color: '#888',
  },
  distanceText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
    marginTop: 5,
  },
});