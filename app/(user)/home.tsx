import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Animated, TextInput, FlatList, ScrollView } from 'react-native';
import Mapbox, { Camera, UserTrackingMode } from '@rnmapbox/maps';
import * as Location from 'expo-location';
import LineRoute from '../components/LineRoute';
import { useSelector, useDispatch } from 'react-redux';
import { setUserData, clearUserData } from '../store/userDataSlice';
import { RootState } from '../store';

import { Ionicons } from '@expo/vector-icons';
import MapboxService from '../services/mapbox';
import RBSheet from 'react-native-raw-bottom-sheet';
import axios from 'axios';
import { API_ENDPOINTS, BASE_URL } from '../config';

// Initialize Mapbox
Mapbox.setAccessToken('pk.eyJ1IjoiemFpbjAwNzgiLCJhIjoiY205anpmMjdkMGdxczJyb29oZDFrcnlqdSJ9.yq_UgdOd8WM8SbZf16JHgw');

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

// Function to calculate coordinate at distance
function calculateCoordinateAtDistance(startLat: number, startLng: number, distanceKm: number, bearingDegrees: number): [number, number] {
  const R = 6371; // Earth's radius in km
  const d = distanceKm / R; // Distance in radians
  const bearing = bearingDegrees * Math.PI / 180; // Bearing in radians
  
  const lat1 = startLat * Math.PI / 180;
  const lng1 = startLng * Math.PI / 180;
  
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(bearing));
  const lng2 = lng1 + Math.atan2(
    Math.sin(bearing) * Math.sin(d) * Math.cos(lat1),
    Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
  );
  
  return [
    (lng2 * 180 / Math.PI + 540) % 360 - 180, // Convert back to degrees and normalize
    lat2 * 180 / Math.PI
  ] as [number, number];
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

// Function to generate random mechanics
const generateRandomMechanics = (count: number, radius: number) => {
  const names = ['Ali', 'Hamza', 'Ahmed', 'Usman', 'Bilal', 'Zain', 'Omar', 'Yusuf'];
  const specialties = ['Engine', 'Transmission', 'Brakes', 'Suspension', 'Electrical', 'AC', 'Body Work', 'Tires'];
  const ratings = ['4.8', '4.9', '4.7', '4.6', '4.9', '4.8', '4.7', '4.9'];
  const experiences = ['5 years', '8 years', '6 years', '4 years', '7 years', '5 years', '6 years', '9 years'];
  const prices = ['2,500 PKR', '3,000 PKR', '2,800 PKR', '2,000 PKR', '3,500 PKR', '4,000 PKR', '2,200 PKR', '3,200 PKR'];
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98FB98', '#DDA0DD', '#F0E68C', '#87CEEB'];

  const mechanics = [];
  const usedIndices = new Set();

  for (let i = 0; i < count; i++) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * names.length);
    } while (usedIndices.has(randomIndex));
    usedIndices.add(randomIndex);

    mechanics.push({
      id: `mechanic_${i}_${Date.now()}`,
      name: names[randomIndex],
      distance: `${radius} km`,
      color: colors[randomIndex],
      rating: ratings[randomIndex],
      experience: experiences[randomIndex],
      specialties: specialties[randomIndex],
      price: prices[randomIndex],
      status: 'pending'
    });
  }

  return mechanics;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  topContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 2,
  },
  searchBar: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  leftButtons: {
    flex: 1,
    marginRight: 10,
  },
  getLocationButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: '45%',
  },
  locationPickerButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  registerButton: {
    backgroundColor: '#FF5252',
    padding: 15,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: '45%',
  },
  activeButton: {
    opacity: 0.8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  errorText: {
    color: 'white',
    fontSize: 14,
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
  markerHead: {
    width: 16,
    height: 16,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  markerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 4,
  },
  currentLocationDot: {
    backgroundColor: '#2196F3',
    borderWidth: 2,
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
    borderWidth: 2,
    borderColor: 'white',
  },
  distanceContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  distanceText: {
    color: '#2196F3',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 10,
  },
  mechanicsContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    width: '90%',
    alignSelf: 'center',
    height: '70%',
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  mechanicTile: {
    padding: 15,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: '100%',
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: 'white',
  },
  tileContent: {
    // width: '100%',
  },
  mechanicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mechanicName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 5,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  mechanicDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  registerButtonLoading: {
    opacity: 0.8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIcon: {
    marginRight: 10,
  },
  searchResults: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 10,
    maxHeight: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  searchResultItem: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchResultText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  sourceLocationBody: {
    backgroundColor: '#4CAF50',
  },
  mechanicsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 10,
    borderRadius: 10,
  },
  mechanicsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    backgroundColor: '#FF5252',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mechanicsScroll: {
    flex: 1,
    marginTop: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mechanicsCount: {
    marginRight: 15,
    fontSize: 16,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#FF5252',
  },
  actionButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  bottomSheetContent: {
    padding: 20,
    height: '100%',
  },
  bottomSheetScrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  vehicleTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  vehicleTypeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedVehicleType: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  vehicleTypeText: {
    color: '#666',
  },
  selectedVehicleTypeText: {
    color: 'white',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  multilineInput: {
    height: 150,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  offersContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    maxHeight: '60%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  offersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  offersTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  offersCount: {
    fontSize: 16,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  offersList: {
    maxHeight: '100%',
  },
  offerCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  mechanicName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  mechanicDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mechanicDetail: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  offerPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  offerDetails: {
    marginTop: 10,
    gap: 5,
  },
  estimatedTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  offerNotes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontStyle: 'italic',
  },
  mechanicContact: {
    fontSize: 14,
    color: '#666',
  },
  offerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 5,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#FF5252',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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
  },
  mechanicContact: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});

interface Mechanic {
  id: string;
  name: string;
  price: number;
  estimatedTime: number;
  notes?: string;
  status: string;
  phoneNumber: string;
  rating: string;
  experience: string;
  location: any;
}

const MECHANICS = [
  { 
    id: 'location1', 
    name: 'Ali', 
    distance: '5 km', 
    color: '#FF6B6B',
    rating: '4.8',
    experience: '5 years',
    specialties: 'Engine, Transmission',
    price: '2,500 PKR',
    status: 'pending', // pending, accepted, rejected
    phoneNumber: '+923001234567'
  },
  { 
    id: 'location2', 
    name: 'Hamza', 
    distance: '6 km', 
    color: '#4ECDC4',
    rating: '4.9',
    experience: '8 years',
    specialties: 'Brakes, Suspension',
    price: '3,000 PKR',
    status: 'pending',
    phoneNumber: '+923001234568'
  },
  { 
    id: 'location3', 
    name: 'Ahmed', 
    distance: '7 km', 
    color: '#45B7D1',
    rating: '4.7',
    experience: '6 years',
    specialties: 'Electrical, Diagnostics',
    price: '2,800 PKR',
    status: 'pending',
    phoneNumber: '+923001234569'
  },
  { 
    id: 'location4', 
    name: 'Usman', 
    distance: '8 km', 
    color: '#FFA07A',
    rating: '4.6',
    experience: '4 years',
    specialties: 'General Maintenance',
    price: '2,000 PKR',
    status: 'pending',
    phoneNumber: '+923001234570'
  },
  { 
    id: 'location5', 
    name: 'Bilal', 
    distance: '9 km', 
    color: '#98FB98',
    rating: '4.9',
    experience: '7 years',
    specialties: 'AC, Heating',
    price: '3,500 PKR',
    status: 'pending',
    phoneNumber: '+923001234571'
  },
  { 
    id: 'location6', 
    name: 'Zain', 
    distance: '10 km', 
    color: '#DDA0DD',
    rating: '4.8',
    experience: '5 years',
    specialties: 'Body Work, Paint',
    price: '4,000 PKR',
    status: 'pending',
    phoneNumber: '+923001234572'
  },
  { 
    id: 'location7', 
    name: 'Omar', 
    distance: '11 km', 
    color: '#F0E68C',
    rating: '4.7',
    experience: '6 years',
    specialties: 'Tires, Alignment',
    price: '2,200 PKR',
    status: 'pending',
    phoneNumber: '+923001234573'
  },
  { 
    id: 'location8', 
    name: 'Yusuf', 
    distance: '12 km', 
    color: '#87CEEB',
    rating: '4.9',
    experience: '9 years',
    specialties: 'Engine, Performance',
    price: '3,200 PKR',
    status: 'pending',
    phoneNumber: '+923001234574'
  }
];

const INITIAL_RADIUS = 5; // Start with 5km radius
const RADIUS_INCREMENT = 5; // Increase by 5km each time
const MAX_RADIUS = 20; // Maximum search radius

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [showMechanics, setShowMechanics] = useState(false);
  const [visibleMechanics, setVisibleMechanics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [tileAnimations] = useState(() => 
    MECHANICS.map(() => new Animated.Value(-500))
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const [selectedSourceLocation, setSelectedSourceLocation] = useState<[number, number] | null>(null);
  const [isSelectingSource, setIsSelectingSource] = useState(false);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [searchRadius, setSearchRadius] = useState(INITIAL_RADIUS);
  const [isFindingMechanics, setIsFindingMechanics] = useState(false);
  const [foundMechanics, setFoundMechanics] = useState<any[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [vehicleType, setVehicleType] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');
  const bottomSheetRef = useRef<any>(null);
  const { token } = useSelector((state: RootState) => state.userData);
  const mapRef = useRef<Mapbox.MapView>(null);
  const cameraRef = useRef<Mapbox.Camera>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [currentIssueId, setCurrentIssueId] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [hasActiveIssue, setHasActiveIssue] = useState(false);
  const [currentIssue, setCurrentIssue] = useState<any>(null);

  const vehicleTypes = ['Car', 'Motorcycle'];

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation);

      // Center map on current location
      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: [currentLocation.coords.longitude, currentLocation.coords.latitude],
          zoomLevel: 14,
          animationDuration: 2000
        });
      }
    } catch (error) {
      setErrorMsg('Error getting location');
      console.error('Location error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const findMechanicsInRadius = async (radius: number) => {
    if (!location) return [];
    
    // Simulate finding mechanics within radius
    // In a real app, this would be an API call
    return MECHANICS.filter((_, index) => {
      const distance = INITIAL_RADIUS + (index * 2); // Simulate varying distances
      return distance <= radius;
    });
  };

  const showMechanicLocations = async () => {
    if (!location) {
      setErrorMsg('Please get your current location first');
      return;
    }
    
    setIsRegistering(true);
    setIsFindingMechanics(true);
    setShowMechanics(true);
    setVisibleMechanics([]);
    setSearchRadius(INITIAL_RADIUS);
    setFoundMechanics([]);
    
    try {
      let currentRadius = INITIAL_RADIUS;
      let searchInterval = setInterval(async () => {
        if (currentRadius > MAX_RADIUS) {
          clearInterval(searchInterval);
          if (foundMechanics.length === 0) {
            setErrorMsg('No mechanics found in the area');
          }
          setIsFindingMechanics(false);
          return;
        }

        setSearchRadius(currentRadius);
        setErrorMsg(`Searching within ${currentRadius}km radius...`);

        // Randomly decide if we should find mechanics in this radius
        const shouldFindMechanics = Math.random() > 0.8; // 70% chance to find mechanics
        if (shouldFindMechanics) {
          // Random number of mechanics (1-3)
          const numMechanics = Math.floor(Math.random() * 3) + 1;
          const newMechanics = generateRandomMechanics(numMechanics, currentRadius);
          
          // Add new mechanics to the top of the list
          setFoundMechanics(prev => [...newMechanics, ...prev]);
          
          // Animate new mechanics from top
          newMechanics.forEach((mechanic, index) => {
            setVisibleMechanics(prev => [mechanic.id, ...prev]);
            Animated.spring(tileAnimations[index], {
              toValue: 0,
              useNativeDriver: true,
              tension: 50,
              friction: 7,
              delay: index * 200,
            }).start();
          });

          setErrorMsg(`Found ${numMechanics} mechanics within ${currentRadius}km`);
        } else {
          setErrorMsg(`No mechanics found within ${currentRadius}km, searching further...`);
        }

        currentRadius += RADIUS_INCREMENT;
      }, 5000);

      return () => clearInterval(searchInterval);
      
    } catch (error) {
      setErrorMsg('Error finding mechanics');
      console.error('Find mechanics error:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleMechanicPress = async (mechanicId: string) => {
    if (!location) {
      setErrorMsg('Please get your current location first');
      return;
    }
    
    try {
      setIsLoading(true);
      setErrorMsg(null);
      
      // Find the selected mechanic
      const mechanic = MECHANICS.find(m => m.id === mechanicId);
      if (!mechanic) {
        setErrorMsg('Mechanic not found');
        return;
      }

      // Extract distance from the mechanic's distance string (e.g., "5 km" -> 5)
      const distance = parseInt(mechanic.distance);
      
      // Calculate destination based on mechanic's position in the list
      // This creates a circular pattern around the user's location
      const angle = (MECHANICS.indexOf(mechanic) * 45) % 360; // 45 degrees between each mechanic
      
      const newDestination = calculateCoordinateAtDistance(
        location.coords.latitude,
        location.coords.longitude,
        distance,
        angle
      );
      
      setDestination(newDestination);
      
      // Get route coordinates
      const start: [number, number] = [location.coords.longitude, location.coords.latitude];
      const result = await getDirections(start, newDestination);
      
      if (result.routes && result.routes.length > 0) {
        setRouteCoordinates(result.routes[0].geometry.coordinates);
      }
      
      // Center camera on destination
      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: newDestination,
          zoomLevel: 14,
          animationDuration: 2000
        });
      }
    } catch (error) {
      setErrorMsg('Error setting destination');
      console.error('Destination error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const accessToken = 'pk.eyJ1IjoiemFpbjAwNzgiLCJhIjoiY205anpmMjdkMGdxczJyb29oZDFrcnlqdSJ9.yq_UgdOd8WM8SbZf16JHgw';
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${accessToken}&proximity=${location?.coords.longitude},${location?.coords.latitude}&types=poi,address&limit=5`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.features) {
        setSearchResults(data.features);
      }
    } catch (error) {
      console.error('Search error:', error);
      setErrorMsg('Error searching locations');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    // Set new timeout for debouncing
    searchTimeout.current = setTimeout(() => {
      searchLocations(text);
    }, 500);
  };

  const handleLocationSelect = (result: any) => {
    const [longitude, latitude] = result.center;
    setSearchQuery(result.place_name);
    setSearchResults([]);
    
    // Update camera to selected location
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [longitude, latitude],
        zoomLevel: 14,
        animationDuration: 1000
      });
    }
  };

  const handleMapPress = (event: any) => {
    if (isSelectingSource) {
      const { geometry } = event;
      const coordinates: [number, number] = [geometry.coordinates[0], geometry.coordinates[1]];
      setSelectedSourceLocation(coordinates);
      setIsSelectingSource(false);
      
      // Update camera to selected location
      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: coordinates,
          zoomLevel: 14,
          animationDuration: 1000
        });
      }
    }
  };

  const handleCancelTiles = () => {
    setShowMechanics(false);
    setVisibleMechanics([]);
    setDestination(null);
    setRouteCoordinates([]);
    setIsRegistering(false);
    setIsFindingMechanics(false);
    
    // Reset bottom sheet data
    setVehicleType('');
    setIssueDescription('');
    setExpectedPrice('');
  };

  const handleAccept = async (mechanicId: string) => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      setIsNavigating(true);

      // Immediately hide the mechanics tiles
      setShowMechanics(false);
      setVisibleMechanics([]);

      // Find the selected mechanic
      const mechanic = foundMechanics.find(m => m.id === mechanicId);
      if (!mechanic) {
        setErrorMsg('Mechanic not found');
        return;
      }

      // Extract distance from the mechanic's distance string (e.g., "5 km" -> 5)
      const distance = parseInt(mechanic.distance);
      
      // Calculate destination based on mechanic's position in the list
      const angle = (foundMechanics.indexOf(mechanic) * 45) % 360;
      
      const newDestination = calculateCoordinateAtDistance(
        location!.coords.latitude,
        location!.coords.longitude,
        distance,
        angle
      );
      
      setDestination(newDestination);
      
      // Center camera on destination first
      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: newDestination,
          zoomLevel: 14,
          animationDuration: 2000
        });
      }
      
      // Then get route coordinates
      const start: [number, number] = [location!.coords.longitude, location!.coords.latitude];
      const result = await getDirections(start, newDestination);
      
      if (result.routes && result.routes.length > 0) {
        setRouteCoordinates(result.routes[0].geometry.coordinates);
      }

      // Reset bottom sheet data
      setVehicleType('');
      setIssueDescription('');
      setExpectedPrice('');

      // Show success message
      setErrorMsg(`Directions to ${mechanic.name} started! Price: ${mechanic.price}`);

      // Clear error message after delay
      setTimeout(() => {
        setErrorMsg(null);
      }, 3000);

    } catch (error) {
      setErrorMsg('Error starting directions');
      console.error('Directions error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = (mechanicId: string) => {
    // Remove the rejected mechanic from the list
    setFoundMechanics(prevMechanics => 
      prevMechanics.filter(mechanic => mechanic.id !== mechanicId)
    );
    setVisibleMechanics(prev => prev.filter(id => id !== mechanicId));
  };

  const handleCancelNavigation = () => {
    setIsNavigating(false);
    setDestination(null);
    setRouteCoordinates([]);
    setErrorMsg(null);
  };

  const handleRegisterIssue = () => {
    if (!location) {
      getCurrentLocation();
      return;
    }
    bottomSheetRef.current?.open();
  };

  const handleSubmitIssue = async () => {
    if (!vehicleType || !issueDescription || !expectedPrice || !location) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg(null);

      const issueData = {
        location: {
          type: 'Point',
          coordinates: [location.coords.longitude, location.coords.latitude]
        },
        vehicleType,
        description: issueDescription,
        expectedPrice: parseFloat(expectedPrice)
      };

      const response = await axios.post(
        API_ENDPOINTS.CREATE_ISSUE,
        issueData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        setErrorMsg('Issue created successfully!');
        setShowMechanics(false);
        setVehicleType('');
        setIssueDescription('');
        setExpectedPrice('');
        
        // Store the issue ID and start polling
        setCurrentIssueId(response.data._id);
        setCurrentIssue(response.data);
        setHasActiveIssue(true);
        startPollingForOffers(response.data._id);
      }
    } catch (error: any) {
      console.error('Error creating issue:', error);
      setErrorMsg(error.response?.data?.message || 'Error creating issue');
    } finally {
      setIsLoading(false);
    }
  };

  const startPollingForOffers = (issueId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        console.log('Polling for offers, issueId:', issueId);
        const response = await axios.get(
          `${API_ENDPOINTS.GET_ISSUE}/${issueId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Polling response:', JSON.stringify(response.data, null, 2));

        if (response.data) {
          const issue = response.data;
          setCurrentIssue(issue); // Update current issue state
          
          // If issue has offers, show them
          if (issue.offers && issue.offers.length > 0) {
            console.log('Found offers:', JSON.stringify(issue.offers, null, 2));
            const formattedOffers = issue.offers.map((offer: any) => {
              console.log('Processing offer:', JSON.stringify(offer, null, 2));
              return {
                id: offer.mechanic._id,
                name: offer.mechanic.fullName || offer.mechanic.name,
                phoneNumber: offer.mechanic.phoneNumber,
                rating: offer.mechanic.rating || '4.5',
                experience: offer.mechanic.experience || '5 years',
                price: offer.price,
                estimatedTime: offer.estimatedTime,
                notes: offer.notes,
                status: offer.status || 'pending',
                location: offer.mechanic.location
              };
            });
            console.log('Formatted offers:', JSON.stringify(formattedOffers, null, 2));
            setMechanics(formattedOffers);
          } else {
            console.log('No offers found in polling response');
            setMechanics([]);
          }

          // If an offer was accepted, calculate distance and show route
          if (issue.status === 'ACCEPTED' && issue.acceptedOffer) {
            console.log('Issue accepted, finding accepted mechanic...');
            clearInterval(pollInterval);
            const acceptedMechanic = issue.offers.find(
              (offer: any) => offer.mechanic._id === issue.acceptedOffer
            );
            console.log('Accepted mechanic:', JSON.stringify(acceptedMechanic, null, 2));
            
            if (acceptedMechanic && location) {
              const distance = calculateDistance(
                location.coords.latitude,
                location.coords.longitude,
                acceptedMechanic.mechanic.location.coordinates[1],
                acceptedMechanic.mechanic.location.coordinates[0]
              );
              setDistance(distance);
              setDestination([
                acceptedMechanic.mechanic.location.coordinates[0],
                acceptedMechanic.mechanic.location.coordinates[1]
              ]);
              showRoute(acceptedMechanic.mechanic.location.coordinates);
            }
          }
        }
      } catch (error: any) {
        console.error('Error polling for offers:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
      }
    }, 5000);

    setPollingInterval(pollInterval);
  };

  const handleAcceptOffer = async (mechanicId: string) => {
    try {
      setIsLoading(true);
      setErrorMsg(null);

      console.log('Accepting offer from mechanic:', mechanicId);
      console.log('For issue:', currentIssueId);
      console.log('Using token:', token);

      const response = await axios.post(
        `${API_ENDPOINTS.SUBMIT_OFFER}/${currentIssueId}/accept/${mechanicId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Offer acceptance response:', response.data);

      if (response.data) {
        setErrorMsg('Offer accepted successfully!');
        
        // Update the current issue with the accepted offer
        setCurrentIssue(response.data);
        
        // Find the accepted mechanic
        const acceptedMechanic = response.data.offers.find(
          (offer: any) => offer.mechanic._id === mechanicId
        );

        if (acceptedMechanic && location) {
          // Calculate distance to mechanic
          const distance = calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            acceptedMechanic.mechanic.location.coordinates[1],
            acceptedMechanic.mechanic.location.coordinates[0]
          );
          setDistance(distance);

          // Show route to mechanic
          showRoute(acceptedMechanic.mechanic.location.coordinates);
        }

        // Clear success message after 3 seconds
        setTimeout(() => {
          setErrorMsg(null);
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error accepting offer:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setErrorMsg(error.response?.data?.message || 'Error accepting offer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectOffer = async (mechanicId: string) => {
    try {
      setIsLoading(true);
      setErrorMsg(null);

      const response = await axios.post(
        `${API_ENDPOINTS.SUBMIT_OFFER}/${currentIssueId}/reject/${mechanicId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        setErrorMsg('Offer rejected');
        // Remove the mechanic from the list
        setMechanics(prev => prev.filter(m => m.id !== mechanicId));
      }
    } catch (error: any) {
      console.error('Error rejecting offer:', error);
      setErrorMsg(error.response?.data?.message || 'Error rejecting offer');
    } finally {
      setIsLoading(false);
    }
  };

  const showRoute = async (mechanicLocation: [number, number]) => {
    if (!location) return;

    try {
      const directions = await getDirections(
        [location.coords.longitude, location.coords.latitude],
        mechanicLocation
      );

      if (directions && directions.routes && directions.routes[0]) {
        const route = directions.routes[0].geometry.coordinates;
        setRouteCoordinates(route);
      }
    } catch (error) {
      console.error('Error showing route:', error);
      setErrorMsg('Error showing route to mechanic');
    }
  };

  // Clean up polling interval when component unmounts
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Add useEffect to check for existing issues when component mounts
  useEffect(() => {
    checkExistingIssue();
  }, []);

  const checkExistingIssue = async () => {
    try {
      console.log('Checking for existing issues...');
      console.log('Token:', token);
      console.log('API Endpoint:', API_ENDPOINTS.GET_USER_ISSUES);

      const response = await axios.get(
        API_ENDPOINTS.GET_USER_ISSUES,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('API Response:', JSON.stringify(response.data, null, 2));

      if (response.data && response.data.length > 0) {
        // Find the most recent active issue
        const activeIssue = response.data.find((issue: any) => 
          issue.status === 'PENDING' || issue.status === 'ACCEPTED'
        );

        console.log('Active Issue:', JSON.stringify(activeIssue, null, 2));

        if (activeIssue) {
          setHasActiveIssue(true);
          setCurrentIssue(activeIssue);
          setCurrentIssueId(activeIssue._id);
          
          // If issue has offers, show them
          if (activeIssue.offers && activeIssue.offers.length > 0) {
            console.log('Processing offers:', JSON.stringify(activeIssue.offers, null, 2));
            
            const formattedOffers = activeIssue.offers.map((offer: any) => {
              console.log('Processing offer:', JSON.stringify(offer, null, 2));
              return {
                id: offer.mechanic._id,
                name: offer.mechanic.fullName || offer.mechanic.name,
                phoneNumber: offer.mechanic.phoneNumber,
                rating: offer.mechanic.rating || '4.5',
                experience: offer.mechanic.experience || '5 years',
                price: offer.price,
                estimatedTime: offer.estimatedTime,
                notes: offer.notes,
                status: offer.status || 'pending',
                location: offer.mechanic.location
              };
            });
            
            console.log('Formatted offers:', JSON.stringify(formattedOffers, null, 2));
            setMechanics(formattedOffers);
          } else {
            console.log('No offers found for this issue');
            setMechanics([]);
          }

          // If issue was accepted, show route
          if (activeIssue.status === 'ACCEPTED' && activeIssue.acceptedOffer) {
            console.log('Issue is accepted, finding accepted mechanic...');
            const acceptedMechanic = activeIssue.offers.find(
              (offer: any) => offer.mechanic._id === activeIssue.acceptedOffer
            );
            console.log('Accepted mechanic:', JSON.stringify(acceptedMechanic, null, 2));
            
            if (acceptedMechanic && location) {
              const distance = calculateDistance(
                location.coords.latitude,
                location.coords.longitude,
                acceptedMechanic.mechanic.location.coordinates[1],
                acceptedMechanic.mechanic.location.coordinates[0]
              );
              setDistance(distance);
              showRoute(acceptedMechanic.mechanic.location.coordinates);
            }
          } else {
            // Start polling for offers if issue is pending
            console.log('Starting to poll for offers...');
            startPollingForOffers(activeIssue._id);
          }
        } else {
          console.log('No active issues found');
          setHasActiveIssue(false);
          setCurrentIssue(null);
          setCurrentIssueId(null);
        }
      } else {
        console.log('No issues found in response');
        setHasActiveIssue(false);
        setCurrentIssue(null);
        setCurrentIssueId(null);
      }
    } catch (error: any) {
      console.error('Error checking existing issues:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setHasActiveIssue(false);
      setCurrentIssue(null);
      setCurrentIssueId(null);
    }
  };

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street}
        logoEnabled={false}
        compassEnabled={true}
        attributionEnabled={false}
        onDidFinishLoadingMap={() => setIsMapReady(true)}
        onPress={handleMapPress}
      >
        <Mapbox.Camera
          ref={cameraRef}
          zoomLevel={14}
          centerCoordinate={[73.0479, 30.3753]} // Center of Pakistan
          animationMode="flyTo"
          animationDuration={2000}
        />

        {/* Current Location Marker */}
        {location && isMapReady && (
          <Mapbox.MarkerView
            id="currentLocation"
            coordinate={[location.coords.longitude, location.coords.latitude]}
          >
            <View style={styles.markerContainer}>
              <View style={styles.markerBody}>
                <Ionicons name="person" size={24} color="white" />
              </View>
            </View>
          </Mapbox.MarkerView>
        )}

        {/* Destination Marker */}
        {destination && isMapReady && (
          <Mapbox.MarkerView
            id="destination"
            coordinate={destination}
          >
            <View style={styles.markerContainer}>
              <View style={[styles.markerBody, styles.destinationBody]}>
                <Ionicons name="construct" size={24} color="white" />
              </View>
            </View>
          </Mapbox.MarkerView>
        )}

        {/* Route Line */}
        {routeCoordinates.length > 0 && (
          <LineRoute coordinates={routeCoordinates} />
        )}

        {/* Source Location Marker */}
        {selectedSourceLocation && (
          <Mapbox.MarkerView
            id="sourceLocation"
            coordinate={selectedSourceLocation}
          >
            <View style={styles.markerContainer}>
              <View style={[styles.markerBody, styles.sourceLocationBody]}>
                <Ionicons name="pin" size={24} color="white" />
              </View>
            </View>
          </Mapbox.MarkerView>
        )}
      </Mapbox.MapView>

      {/* Search Bar */}
      <View style={styles.topContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={24} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for mechanics or locations..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {isSearching && (
            <Ionicons name="refresh" size={20} color="#666" style={styles.loadingIcon} />
          )}
        </View>
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.searchResults}>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.searchResultItem}
                  onPress={() => handleLocationSelect(item)}
                >
                  <Ionicons name="location" size={20} color="#666" />
                  <Text style={styles.searchResultText}>{item.place_name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* Buttons Container */}
      {!hasActiveIssue && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.getLocationButton}
            onPress={getCurrentLocation}
            disabled={isLoading}
          >
            <Ionicons name="location" size={24} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>
              {isLoading ? 'Getting Location...' : 'Get Location'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.registerButton, isRegistering && styles.registerButtonLoading]}
            onPress={isRegistering ? handleCancelTiles : handleRegisterIssue}
            disabled={isLoading}
          >
            {isRegistering ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="close" size={24} color="white" style={styles.loadingIcon} />
                <Text style={styles.buttonText}>Cancel</Text>
              </View>
            ) : (
              <>
                <Ionicons name="warning" size={24} color="white" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Register Issue</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Show active issue status if there is one */}
      {hasActiveIssue && currentIssue && (
        <View style={styles.activeIssueContainer}>
          <Text style={styles.activeIssueTitle}>
            {currentIssue.status === 'ACCEPTED' 
              ? 'Issue Accepted' 
              : mechanics.length > 0 
                ? 'Received Offers' 
                : 'Waiting for Offers'}
          </Text>
          {currentIssue.status === 'ACCEPTED' && distance !== null && (
            <Text style={styles.distanceText}>
              Distance to mechanic: {distance.toFixed(2)} km
            </Text>
          )}
        </View>
      )}

      {/* Registration Issue Bottom Sheet */}
      <RBSheet
        ref={bottomSheetRef}
        height={600}
        customStyles={{
          container: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: 20,
          },
          wrapper: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
          draggableIcon: {
            backgroundColor: '#666',
            width: 40,
          },
        }}
      >
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>Register Your Issue</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Vehicle Type</Text>
            <View style={styles.vehicleTypeContainer}>
              {vehicleTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.vehicleTypeButton,
                    vehicleType === type && styles.selectedVehicleType,
                  ]}
                  onPress={() => setVehicleType(type)}
                >
                  <Text style={[
                    styles.vehicleTypeText,
                    vehicleType === type && styles.selectedVehicleTypeText,
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Issue Description</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              placeholder="Describe your issue..."
              value={issueDescription}
              onChangeText={setIssueDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Expected Price (PKR)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter expected price"
              value={expectedPrice}
              onChangeText={setExpectedPrice}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitIssue}
          >
            <Text style={styles.submitButtonText}>Find Mechanics</Text>
          </TouchableOpacity>
        </View>
      </RBSheet>

      {/* Mechanics Tiles */}
      {showMechanics && (
        <View style={styles.mechanicsContainer}>
          <View style={styles.mechanicsHeader}>
            <Text style={styles.mechanicsTitle}>
              {isFindingMechanics 
                ? `Searching Mechanics (${searchRadius}km radius)...` 
                : `Available Mechanics (${searchRadius}km radius)`}
            </Text>
            <View style={styles.headerRight}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancelTiles}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <FlatList
            data={foundMechanics.filter(mechanic => visibleMechanics.includes(mechanic.id))}
            keyExtractor={(item) => item.id}
            style={styles.mechanicsScroll}
            showsVerticalScrollIndicator={true}
            renderItem={({ item: mechanic, index }) => (
              <Animated.View
                style={[
                  styles.mechanicTile,
                  { borderLeftColor: mechanic.color, borderLeftWidth: 5 },
                  {
                    transform: [{ translateY: tileAnimations[index] }],
                    marginTop: index === 0 ? 0 : 8,
                  }
                ]}
              >
                <View style={styles.tileContent}>
                  <View style={styles.mechanicHeader}>
                    <Text style={styles.mechanicName}>{mechanic.name}</Text>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color={mechanic.color} />
                      <Text style={[styles.ratingText, { color: mechanic.color }]}>{mechanic.rating}</Text>
                    </View>
                  </View>
                  <View style={styles.mechanicDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="time" size={16} color="#666" />
                      <Text style={styles.detailText}>{mechanic.experience} experience</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="build" size={16} color="#666" />
                      <Text style={styles.detailText}>{mechanic.specialties}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="navigate" size={16} color="#666" />
                      <Text style={styles.detailText}>{mechanic.distance} away</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="cash" size={16} color="#666" />
                      <Text style={styles.detailText}>{mechanic.price}</Text>
                    </View>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={() => handleAccept(mechanic.id)}
                    >
                      <Ionicons name="checkmark" size={20} color="white" />
                      <Text style={styles.actionButtonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleReject(mechanic.id)}
                    >
                      <Ionicons name="close" size={20} color="white" />
                      <Text style={styles.actionButtonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            )}
          />
        </View>
      )}

      {/* Offers List */}
      {mechanics.length > 0 && (
        <View style={[styles.offersContainer, { bottom: 20 }]}>
          <View style={styles.offersHeader}>
            <Text style={styles.offersTitle}>
              {currentIssue?.status === 'ACCEPTED' ? 'Accepted Offer' : 'Mechanic Offers'}
            </Text>
            <Text style={styles.offersCount}>{mechanics.length} offers</Text>
          </View>
          <ScrollView style={styles.offersList}>
            {mechanics.map((mechanic) => (
              <View key={mechanic.id} style={[styles.offerCard, { marginBottom: 10 }]}>
                <View style={styles.offerHeader}>
                  <View>
                    <Text style={styles.mechanicName}>{mechanic.name}</Text>
                    <View style={styles.mechanicDetails}>
                      <Text style={styles.mechanicDetail}>
                        <Ionicons name="star" size={16} color="#FFD700" /> {mechanic.rating}
                      </Text>
                      <Text style={styles.mechanicDetail}>
                        <Ionicons name="time" size={16} color="#666" /> {mechanic.experience}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.offerPrice}>PKR {mechanic.price}</Text>
                </View>
                <View style={styles.offerDetails}>
                  <Text style={styles.estimatedTime}>
                    <Ionicons name="hourglass" size={16} color="#666" /> Estimated Time: {mechanic.estimatedTime} hours
                  </Text>
                  {mechanic.notes && (
                    <Text style={styles.offerNotes}>
                      <Ionicons name="document-text" size={16} color="#666" /> {mechanic.notes}
                    </Text>
                  )}
                  <Text style={styles.mechanicContact}>
                    <Ionicons name="call" size={16} color="#666" /> {mechanic.phoneNumber}
                  </Text>
                </View>
                {currentIssue?.status !== 'ACCEPTED' && (
                  <View style={styles.offerActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={() => handleAcceptOffer(mechanic.id)}
                      disabled={isLoading}
                    >
                      <Ionicons name="checkmark" size={20} color="white" />
                      <Text style={styles.actionButtonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleRejectOffer(mechanic.id)}
                      disabled={isLoading}
                    >
                      <Ionicons name="close" size={20} color="white" />
                      <Text style={styles.actionButtonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Error Message */}
      {errorMsg && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}
    </View>
  );
}