import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen'; 
import SignupScreen from './screens/SignupScreen'; 
import BACScreen from './screens/BACScreen'; 
import HomeScreen from './screens/HomeScreen'; 
import UserInfoScreen from './screens/UserInfoScreen'; 
import MapScreen from './screens/MapScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="BAC" component={BACScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="Settings" component={UserInfoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
