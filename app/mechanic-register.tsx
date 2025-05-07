import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { setMechanicData } from './store/mechanicDataSlice'; // Adjust path if needed
import { RootState } from './store';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { API_ENDPOINTS } from './config';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  address: string;
  cnic: string;
  experience: string;
  hourlyRate: string;
  availability: string;
  vehicleTypes: string[];
  serviceRadius: string;
  serviceAreas: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phoneNumber?: string;
  cnic?: string;
  experience?: string;
  hourlyRate?: string;
  vehicleTypes?: string;
  serviceRadius?: string;
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
  isLive?: boolean;
  searching?: boolean;
  startSearch?: () => void;
  cancelSearch?: () => void;
}

const MechanicRegister = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const mechanicData = useSelector((state: RootState) => state.mechanicData) as MechanicData;

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: '',
    cnic: '',
    experience: '',
    hourlyRate: '',
    availability: 'full-time',
    vehicleTypes: [],
    serviceRadius: '',
    serviceAreas: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const vehicleTypeOptions = ['Car', 'Bike'];

  // Log mechanicData whenever it changes
  useEffect(() => {
    console.log('mechanicData updated:', mechanicData);
    console.log('isLive:', mechanicData.isLive);
  }, [mechanicData]);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.cnic.trim()) newErrors.cnic = 'CNIC is required';
    if (!formData.experience.trim()) newErrors.experience = 'Experience is required';
    if (!formData.hourlyRate.trim()) newErrors.hourlyRate = 'Hourly rate is required';
    if (formData.vehicleTypes.length === 0) newErrors.vehicleTypes = 'Please select at least one vehicle type';
    if (!formData.serviceRadius.trim()) newErrors.serviceRadius = 'Service radius is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_ENDPOINTS.MECHANIC_REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          cnic: formData.cnic,
          experience: formData.experience,
          hourlyRate: formData.hourlyRate,
          availability: formData.availability,
          vehicleTypes: formData.vehicleTypes,
          serviceRadius: formData.serviceRadius,
          serviceAreas: formData.serviceAreas
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Response:', data);
        // Store the token in localStorage or secure storage
        // localStorage.setItem('mechanicToken', data.token);
        
        // Update Redux store with mechanic data
        dispatch(setMechanicData({
          fullName: data.mechanic.fullName,
          email: data.mechanic.email,
          phoneNumber: data.mechanic.phoneNumber,
          address: data.mechanic.address,
          cnic: data.mechanic.cnic,
          experience: data.mechanic.experience,
          hourlyRate: data.mechanic.hourlyRate,
          availability: data.mechanic.availability,
          vehicleTypes: data.mechanic.vehicleTypes,
          serviceRadius: data.mechanic.serviceRadius,
          serviceAreas: data.mechanic.serviceAreas,
          isLive: false,
          rating: 0,
          token: data.token
        }));
        Alert.alert('Success', 'Registration successful!');
        router.replace('/(mechanic)/home');
      } else {
        console.log('Error details:', {
          message: 'Registration failed',
          response: await response.json(),
          status: response.status
        });
        Alert.alert('Error', 'Registration failed');
      }
    } catch (error) {
      console.log('Unexpected error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleVehicleType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      vehicleTypes: prev.vehicleTypes.includes(type)
        ? prev.vehicleTypes.filter(item => item !== type)
        : [...prev.vehicleTypes, type]
    }));
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.title}>Mechanic Registration</Text>
          </View>

          <Text style={styles.sectionTitle}>Personal Information</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            value={formData.fullName}
            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
          />
          {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            secureTextEntry
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            secureTextEntry
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
          />
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            keyboardType="phone-pad"
            value={formData.phoneNumber}
            onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
          />
          {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}

          <TextInput
            style={styles.input}
            placeholder="CNIC (XXXXX-XXXXXXX-X)"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            value={formData.cnic}
            onChangeText={(text) => setFormData({ ...formData, cnic: text })}
          />
          {errors.cnic && <Text style={styles.errorText}>{errors.cnic}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Address"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
          />

          <Text style={styles.sectionTitle}>Professional Information</Text>

          <TextInput
            style={styles.input}
            placeholder="Years of Experience"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            keyboardType="numeric"
            value={formData.experience}
            onChangeText={(text) => setFormData({ ...formData, experience: text })}
          />
          {errors.experience && <Text style={styles.errorText}>{errors.experience}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Hourly Rate (PKR)"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            keyboardType="numeric"
            value={formData.hourlyRate}
            onChangeText={(text) => setFormData({ ...formData, hourlyRate: text })}
          />
          {errors.hourlyRate && <Text style={styles.errorText}>{errors.hourlyRate}</Text>}

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Availability</Text>
            <View style={styles.availabilityRow}>
              {[
                { label: 'Full Time', value: 'full-time' },
                { label: 'Part Time', value: 'part-time' },
              ].map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.availabilityButton,
                    formData.availability === option.value && styles.selectedAvailabilityButton,
                  ]}
                  onPress={() => setFormData({ ...formData, availability: option.value })}
                >
                  <Text
                    style={[
                      styles.availabilityButtonText,
                      formData.availability === option.value && styles.selectedAvailabilityButtonText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={styles.sectionTitle}>Vehicle Types Serviced</Text>
          <View style={styles.vehicleTypesContainer}>
            {vehicleTypeOptions.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.vehicleTypeButton,
                  formData.vehicleTypes.includes(type) && styles.selectedVehicleType
                ]}
                onPress={() => toggleVehicleType(type)}
              >
                <Text style={[
                  styles.vehicleTypeText,
                  formData.vehicleTypes.includes(type) && styles.selectedVehicleTypeText
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.vehicleTypes && <Text style={styles.errorText}>{errors.vehicleTypes}</Text>}

          <Text style={styles.sectionTitle}>Service Area</Text>
          <TextInput
            style={styles.input}
            placeholder="Service Radius (in km)"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            keyboardType="numeric"
            value={formData.serviceRadius}
            onChangeText={(text) => setFormData({ ...formData, serviceRadius: text })}
          />
          {errors.serviceRadius && <Text style={styles.errorText}>{errors.serviceRadius}</Text>}
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Service Areas (e.g., City names, areas)"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            multiline
            numberOfLines={4}
            value={formData.serviceAreas}
            onChangeText={(text) => setFormData({ ...formData, serviceAreas: text })}
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Register as Mechanic</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.replace('/(mechanic)/home')}
          >
            <Text style={styles.loginText}>
              Go to Dashboard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.replace('/mechanic-login')}
          >
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginTextBold}>Login</Text>
            </Text>
          </TouchableOpacity>

          {mechanicData.isLive && (
            <View style={styles.buttonAbsolute}>
              {!mechanicData.searching ? (
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={mechanicData.startSearch}
                  activeOpacity={0.8}
                >
                  <FontAwesome name="search" size={22} color="#fff" style={{ marginRight: 10 }} />
                  <Text style={styles.searchButtonText}>Searching Users</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.searchButton, { backgroundColor: '#ff6b6b' }]}
                  onPress={mechanicData.cancelSearch}
                  activeOpacity={0.8}
                >
                  <FontAwesome name="times-circle" size={22} color="#fff" style={{ marginRight: 10 }} />
                  <Text style={styles.searchButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2563eb', // Solid blue background
  },
  scrollContainer: {
    flexGrow: 1,
  },
  formContainer: {
    padding: 20,
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    marginTop: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    color: 'white',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    color: 'white',
    marginBottom: 5,
  },
  availabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  availabilityButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  selectedAvailabilityButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  availabilityButtonText: {
    color: 'white',
    fontSize: 14,
  },
  selectedAvailabilityButtonText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  vehicleTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  vehicleTypeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 10,
    margin: 5,
  },
  selectedVehicleType: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  vehicleTypeText: {
    color: 'white',
  },
  selectedVehicleTypeText: {
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff6b6b',
    marginBottom: 10,
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  loginTextBold: {
    fontWeight: 'bold',
    color: 'white',
  },
  buttonAbsolute: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  searchButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MechanicRegister;