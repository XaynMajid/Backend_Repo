import { Drawer } from 'expo-router/drawer';
import CustomDrawerContent from '../components/CustomDrawerContent_user';
export default function UserDrawerLayout() {
  return (
    <Drawer
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#2563eb' },
        headerTintColor: '#fff',
        drawerActiveTintColor: '#2563eb',
      }}
    />
  );
}