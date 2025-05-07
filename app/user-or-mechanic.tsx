import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const UserOrMechanic = () => {
  const router = useRouter();

  const handleUserTypeSelection = (type: 'mechanic' | 'user') => {
    if (type === 'mechanic') {
      router.push('/mechanic-register');
    } else {
      router.push('/user-register');
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.title}>FixMyRide</Text>
          <Text style={styles.subtitle}>Your roadside assistance companion</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => handleUserTypeSelection('mechanic')}
            >
              <View style={styles.buttonInner}>
                <FontAwesome5 name="tools" size={24} color="white" style={styles.icon} />
                <Text style={styles.buttonText}>Be a Mechanic</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.button}
              onPress={() => handleUserTypeSelection('user')}
            >
              <View style={styles.buttonInner}>
                <FontAwesome5 name="user" size={24} color="white" style={styles.icon} />
                <Text style={styles.buttonText}>Continue as a User</Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>24/7 Support • Trusted Mechanics • Quick Response</Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#2563eb', // Solid blue background
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: width * 0.9,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 40,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default UserOrMechanic;