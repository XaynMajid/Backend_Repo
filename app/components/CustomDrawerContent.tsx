import React, { useEffect } from 'react';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store'; // adjust path as needed
import { setLiveStatus, toggleLiveStatus } from '../store/liveStatusSlice';
import { FontAwesome } from '@expo/vector-icons';

export default function CustomDrawerContent(props) {
  const isLive = useSelector((state: RootState) => state.liveStatus.isLive);
  const mechanic = useSelector((state: RootState) => state.mechanicData);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('Mechanic is now', isLive ? 'ONLINE' : 'OFFLINE');
  }, [isLive]);

  // Fallback initials if no image
  const initials = mechanic.fullName
    ? mechanic.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'M';

  // Example: static rating, replace with real value if you have it
  const rating = mechanic.rating || 4.8;

  return (
    <DrawerContentScrollView {...props}>
      {/* Mechanic Info Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          {/* If you have an image, use <Image source={{uri: mechanic.imageUrl}} ... /> */}
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{mechanic.fullName || 'Mechanic Name'}</Text>
          <View style={styles.ratingRow}>
            <FontAwesome name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        </View>
      </View>

      <DrawerItemList {...props} />
      <DrawerItem
        label={() => (
          <View style={styles.liveRow}>
            <Text style={styles.liveLabel}>{isLive ? 'Getting Orders' : 'Be Live'}</Text>
            <Switch
              value={isLive}
              onValueChange={value => dispatch(setLiveStatus(value))}
              thumbColor={isLive ? '#2563eb' : '#ccc'}
              trackColor={{ false: '#ccc', true: '#2563eb' }}
            />
          </View>
        )}
        onPress={() => dispatch(toggleLiveStatus())}
        style={styles.liveItem}
      />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#222',
    fontWeight: 'bold',
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  liveLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  liveItem: {
    marginLeft: 0,
    marginRight: 0,
    paddingLeft: 16,
    paddingRight: 16,
  },
});