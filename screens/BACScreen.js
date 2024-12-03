import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, StatusBar, Modal, PanResponder, TextInput, ActivityIndicator } from 'react-native';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { ref, get, child, set } from 'firebase/database';
import { database } from '../firebaseConfig';

const BACScreen = ({ navigation, route }) => {
  const [connectModalVisible, setConnectModalVisible] = useState(true);
  const { userName } = route.params;
  const [mapVisible, setMapVisible] = useState(false);
  const [location, setLocation] = useState(null);
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [loading, setLoading] = useState(true);
  const [floatingBoxVisible, setFloatingBoxVisible] = useState(true);
  const [pan, setPan] = useState(0);
  const [floatingBoxPosition, setFloatingBoxPosition] = useState(0);
  const [textBoxValue, setTextBoxValue] = useState('0');
  const [isLoading, setIsLoading] = useState(false); // New state for loading animation
  const locationUpdateInterval = useRef(null);
  const animationRef = useRef(null);
  const [newTextBoxMessage, setNewTextBoxMessage] = useState('');

  const updateNewTextBoxMessage = (value) => {
    try {
      const numValue = parseInt(value, 10);
      if (numValue >= 0 && numValue <= 1) {
        setNewTextBoxMessage('Drive Safely!');
      } else if (numValue >= 2 && numValue <= 4) {
        setNewTextBoxMessage('Sober Up!');
      } else if (numValue >= 5) {
        setNewTextBoxMessage('Do not Drive!');
      }
    } catch (error) {
      console.log("Error updating message: ", error);
    }
  };
  

  // Add getLocation function
  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      const dbRef = ref(database);
      try {
        const snapshot = await get(child(dbRef, `users/${userName}`));
        if (snapshot.exists()) {
          const emergencyEmail = snapshot.val().emergencyContact.email;

          const usersSnapshot = await get(child(dbRef, 'users'));
          if (usersSnapshot.exists()) {
            const usersData = usersSnapshot.val();
            for (const [key, value] of Object.entries(usersData)) {
              if (value.email === emergencyEmail) {
                // Set location update interval to run every 2 seconds
                locationUpdateInterval.current = setInterval(async () => {
                  try {
                    const newLocation = await Location.getCurrentPositionAsync({});
                    const updatedLocationData = {
                      userName,
                      latitude: newLocation.coords.latitude,
                      longitude: newLocation.coords.longitude,
                      timestamp: Date.now(),
                    };
                    await set(ref(database, `users/${key}/Location`), updatedLocationData);
                    console.log('Location updated:', updatedLocationData);
                  } catch (error) {
                    console.log("Error updating location: ", error);
                  }
                }, 2000);
                break;
              }
            }
          }
        }
      } catch (error) {
        console.log("Error updating emergency contact location: ", error);
      }
    } catch (error) {
      console.log("Error getting location: ", error);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (e, gestureState) => Math.abs(gestureState.dy) > 10,
      onPanResponderMove: (e, gestureState) => setPan(gestureState.dy),
      onPanResponderRelease: (e, gestureState) => {
        try {
          if (gestureState.dy > 50) {
            setFloatingBoxPosition(500);
            setFloatingBoxVisible(false);
          } else if (gestureState.dy < -50) {
            setFloatingBoxPosition(0);
            setFloatingBoxVisible(true);
          }
          setPan(0);
        } catch (error) {
          console.log("Error handling pan response: ", error);
        }
      },
    })
  ).current;

  // Fetch emergency contact name
  const fetchEmergencyContactName = async (userName) => {
    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, `users/${userName}`));
      if (snapshot.exists()) {
        setEmergencyContactName(snapshot.val().emergencyContact.name);
      } else {
        console.log("User not found in the database");
      }
    } catch (error) {
      console.log("Error fetching emergency contact: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data from the "Sensor" node
  const fetchSensorData = async () => {
    const dbRef = ref(database);
    try {
      const snapshot = await get(child(dbRef, 'Sensor'));
      if (snapshot.exists()) {
        const sensorData = snapshot.val();
        setTextBoxValue(JSON.stringify(sensorData));
      } else {
        console.log('No sensor data found');
      }
    } catch (error) {
      console.log('Error fetching sensor data: ', error);
    }
  };

  // Handle Start Button Press
  const handleStartButtonPress = () => {
    try {
      console.log('START Button Pressed');
      setIsLoading(true);
      
      // Set a 5-second delay before fetching sensor data
      setTimeout(() => {
        fetchSensorData();
        setIsLoading(false);
      }, 5000);
    } catch (error) {
      console.log('Error handling start button press: ', error);
    }
  };

  useEffect(() => {
    try {
      if (userName) fetchEmergencyContactName(userName);

      return () => {
        if (locationUpdateInterval.current) clearInterval(locationUpdateInterval.current);
      };
    } catch (error) {
      console.log('Error in useEffect: ', error);
    }
  }, [userName]);

  useEffect(() => {
    try {
      updateNewTextBoxMessage(textBoxValue);
    } catch (error) {
      console.log('Error in text box value update: ', error);
    }
  }, [textBoxValue]);
  
  useEffect(() => {
    try {
      if (parseInt(textBoxValue, 10) >= 3) {
        setMapVisible(true);  // Automatically show the map
        getLocation();        // Call getLocation to fetch location data
      }
    } catch (error) {
      console.log('Error in map visibility update: ', error);
    }
  }, [textBoxValue]);
  

  const getCurrentDateTime = () => {
    try {
      const currentDate = new Date();
      return {
        date: currentDate.toLocaleDateString(),
        time: currentDate.toLocaleTimeString(),
      };
    } catch (error) {
      console.log('Error getting current date and time: ', error);
      return { date: '', time: '' }; // return default values if error occurs
    }
  };

  const { date, time } = getCurrentDateTime();
  

  return (
     <ImageBackground source={require('../assets/background_light.png')} style={styles.background}>
      <StatusBar barStyle="dark-content" translucent={false} backgroundColor="#7E704B" />

       {/* Loading Overlay */}
       {isLoading && (
        <View style={styles.loadingOverlay}>
          <LottieView
            ref={animationRef}
            source={require('../assets/loading-animation.json')} // You'll need to add this file
            autoPlay
            loop
            style={styles.loadingAnimation}
          />
          <Text style={styles.loadingText}>Fetching Sensor Data...</Text>
        </View>
      )}

      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={30} color="#1E1E1E" />
        </TouchableOpacity>
        <Text style={styles.userNameText}>{userName}</Text>

        {/* Text Box */}
        <TextInput 
          style={styles.textBox}
          placeholder="Enter text here"
          value={textBoxValue}
          editable={false}
        />

        <TextInput 
          style={styles.textBox1}
          placeholder="Message"
          value={newTextBoxMessage}
          editable={false}
        />


        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.halfButton]} 
            onPress={handleStartButtonPress}
            disabled={isLoading} // Disable button while loading
          >
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.halfButton]} 
            onPress={() => { 
              setMapVisible(true); 
              getLocation(); 
            }}
          >
            <Text style={styles.buttonText}>Share Now</Text>
          </TouchableOpacity>
        </View>
        
      </View>
      <Modal
        visible={mapVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMapVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.closeButtonContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setMapVisible(false)}>
              <Icon name="chevron-back" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
          {location && (
            <MapView
              style={styles.map}
              region={location}
              showsUserLocation={true}
              followsUserLocation={true}
            >
              <Marker coordinate={location} title="You are here" />
            </MapView>
          )}
          {floatingBoxVisible && (
            <View
              style={[styles.floatingBox, { transform: [{ translateY: floatingBoxPosition }] }]}
              {...panResponder.panHandlers}
            >
              <Text style={styles.floatingBoxText}>Sharing Live Location To</Text>
              <Text style={styles.floatingBoxName}>{emergencyContactName}</Text>
              <Text style={styles.floatingBoxDate}>{date} {time}</Text>
            </View>
          )}
        </View>
      </Modal>
    </ImageBackground>
  );
};
const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  bacContainer: {
    width: '90%',
    paddingVertical: 40,
    backgroundColor: '#C1B390',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
    marginTop: 100,
  },
  bacValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000000',
  },
  bacText: {
    fontSize: 24,
    color: '#000000',
    marginBottom: 10,
  },
  warningText: {
    fontSize: 24,
    color: '#FF0000',
    marginBottom: 40,
  },
  userNameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'transparent',
    marginBottom: 20,
  },
  button: {
    width: '80%',
    padding: 15,
    backgroundColor: '#FFA500',
    borderRadius: 30,
    marginTop: 20,
    alignItems: 'center',
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 20,
  },
  halfButton: {
    flex: 1,
    marginHorizontal: 5, // Adds spacing between buttons
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 1,
  },
  buttonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 40,  // Ensures it's above the map
    left: 20,
    zIndex: 10, // To ensure it stays on top
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  map: {
    width: '100%',
    height: '100%',
    zIndex: 0,  // Map should not overlap the close button
  },
  floatingBox: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    margin: 10,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  floatingBoxText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  floatingBoxName: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  floatingBoxDate: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#777',
  },
  textBox: {
    width: '80%',
    height: '20%',
    padding: 15,
    backgroundColor: '#C1B390', // Added the specified fill color
    borderRadius: 10,
    marginTop: -100,
    borderColor: '#000000',
    borderWidth: 1,
    color: '#000000',
    textAlign: 'center', 
    fontSize: 100, 
    fontWeight: 'bold',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 5,
    
  },
  textBox1: {
    width: '80%',
    height: '20%',
    padding: 15,
   
    borderRadius: 10,
    marginTop: 50,
    color: '#000000',
    textAlign: 'center', 
    fontSize: 20, 
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
  },
  loadingAnimation: {
    width: 200,
    height: 200,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#FFFFFF',
  },
});

export default BACScreen;
