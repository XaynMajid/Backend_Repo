// ... existing imports ...
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store'; // Adjust path if needed

export default function MechanicProfileScreen() {
  const mechanic = useSelector((state: RootState) => state.mechanicData);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mechanic Profile</Text>
      <View style={styles.card}>
        <ProfileItem label="Full Name" value={mechanic.fullName} />
        <ProfileItem label="Email" value={mechanic.email} />
        <ProfileItem label="Phone Number" value={mechanic.phoneNumber} />
        <ProfileItem label="CNIC" value={mechanic.cnic} />
        <ProfileItem label="Address" value={mechanic.address} />
        <ProfileItem label="Experience" value={mechanic.experience} />
        <ProfileItem label="Hourly Rate" value={mechanic.hourlyRate} />
        <ProfileItem label="Availability" value={mechanic.availability} />
        <ProfileItem label="Vehicle Types" value={mechanic.vehicleTypes?.join(', ')} />
        <ProfileItem label="Service Radius" value={mechanic.serviceRadius} />
        <ProfileItem label="Service Areas" value={mechanic.serviceAreas} />
      </View>
    </ScrollView>
  );
}

const ProfileItem = ({ label, value }) => (
  <View style={styles.item}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value || '-'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f3f4f6',
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  item: {
    marginBottom: 16,
  },
  label: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 16,
  },
  value: {
    color: '#222',
    fontSize: 16,
    marginTop: 2,
  },
});
