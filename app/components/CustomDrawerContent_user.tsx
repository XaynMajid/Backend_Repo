import React from 'react';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function CustomDrawerContent_user(props) {
  const userData = useSelector((state: RootState) => state.userData);

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Text style={styles.username}>
          {userData.fullName ? `Hello, ${userData.fullName}!` : 'Welcome!'}
        </Text>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    marginBottom: 8,
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});