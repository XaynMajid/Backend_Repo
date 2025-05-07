import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const GetStartedScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/logo.png')} // Adjust path if needed
        style={styles.logo}
        resizeMode="cover" 
      />
      
      <Text style={styles.title}>
        Welcome to FixMyRide
      </Text>
      <View style={styles.featuresContainer}>
        <View style={styles.featureRow}>
          <Text style={styles.emoji}>🚗</Text>
          <Text style={styles.featureText}>Quick and Reliable Car Repairs</Text>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.emoji}>⏳</Text>
          <Text style={styles.featureText}>Roadside Assistance</Text>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.emoji}>📍</Text>
          <Text style={styles.featureText}>Find Nearby Mechanics Easily</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.replace('/user-or-mechanic')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#2563eb', // Solid blue background
  },
  logo: {
    height: 100,
    width: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  featuresContainer: {
    marginHorizontal: 20,
    marginBottom: 10,
    width: width * 0.7,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  emoji: {
    fontSize: 22,
  },
  featureText: {
    color: 'white',
    fontSize: 18,
    marginLeft: 10,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GetStartedScreen;