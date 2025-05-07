import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/index';

export default function UserProfile() {
  const userData = useSelector((state: RootState) => state.userData);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>
      <Text style={styles.info}>Name: {userData.fullName}</Text>
      <Text style={styles.info}>Email: {userData.email}</Text>
      <Text style={styles.info}>Phone: {userData.phoneNumber}</Text>
      <Text style={styles.info}>Address: {userData.residentialAddress}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#2563eb' },
  info: { fontSize: 16, color: '#333', marginBottom: 8 },
});