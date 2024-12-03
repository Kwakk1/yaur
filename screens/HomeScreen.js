import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, StatusBar, TextInput, Alert, Modal } from 'react-native';
import { ref, onValue } from 'firebase/database';
import MapView, { Marker } from 'react-native-maps'; // Import MapView
import { database } from '../firebaseConfig'; // Import Firebase config

const HistoryScreen = ({ navigation, route }) => {
  const { userName } = route.params;
  const [locationMessage, setLocationMessage] = useState(null);
  const [location, setLocation] = useState(null);
  const [lastLocation, setLastLocation] = useState(null);
  const [isMessageShown, setIsMessageShown] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Use Firebase Realtime Database to monitor changes in location
  useEffect(() => {
    try {
      const dbRef = ref(database, `users/${userName}/Location`); // Fixed this line
      const locationListener = onValue(dbRef, (snapshot) => {
        try {
          const locationData = snapshot.val();
          if (locationData) {
            const locationUserName = locationData.userName || userName;

            if (
              lastLocation &&
              (locationData.latitude !== lastLocation.latitude ||
                locationData.longitude !== lastLocation.longitude)
            ) {
              if (!isMessageShown && !isMapOpen) {
                setLocationMessage(`${locationUserName} is sharing location.`);
                Alert.alert(`${locationUserName} is sharing location.`, '', [
                  {
                    text: 'OK',
                    onPress: () => {
                      setIsMapOpen(true);
                      setIsMessageShown(true);
                    },
                  },
                ]);
              }
            }

            setLocation({
              latitude: locationData.latitude,
              longitude: locationData.longitude,
            });

            setLastLocation({
              latitude: locationData.latitude,
              longitude: locationData.longitude,
            });
          }
        } catch (error) {
          console.error("Error fetching location data:", error);
        }
      });

      return () => {
        try {
          locationListener();
        } catch (error) {
          console.error("Error removing listener:", error);
        }
      };
    } catch (error) {
      console.error("Error setting up location listener:", error);
    }
  }, [userName, isMessageShown, isMapOpen, lastLocation]);

  const handleMapClose = () => {
    try {
      setIsMapOpen(false);
      setIsMessageShown(false);
    } catch (error) {
      console.error("Error closing map:", error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#F5F5DC" />

      <TextInput
        style={{ height: 0, width: 0 }}
        value={userName}
        editable={false}
      />

      <View style={styles.circleButtonContainer}>
        <TouchableOpacity
          style={styles.boxButton} // Updated to box button with rounded corners
          onPress={() => navigation.navigate('BAC', { userName })} // Navigate directly to BACScreen
        >
          <Image source={require('../assets/test_tube_icon.png')} style={styles.boxIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings', { name: userName })}
        >
          <Image source={require('../assets/settings_icon.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>

      {/* Map Modal */}
      <Modal
        visible={isMapOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={handleMapClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {location && (
              <MapView
                style={styles.map}
                region={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.002,
                  longitudeDelta: 0.002,
                }}
                showsUserLocation
              >
                <Marker
                  coordinate={location}
                  title={userName}
                >
                  <Image
                    source={require('../assets/car_icon.png')}
                    style={styles.carIcon}
                  />
                </Marker>
              </MapView>
            )}
            <TouchableOpacity onPress={handleMapClose} style={styles.closeButton}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  icon: {
    width: 150,
    height: 150,
    tintColor: '#ffff',
  },

  settingsButton: {
    marginLeft: -25,
    width: 400,
    height: 350,
    top: 340,
    borderRadius: 20,
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 5,
  },

  circleButtonContainer: {
    width: 20,
    position: 'absolute',
    top: 50, // Adjust this to your desired position
    left: '93%',
    transform: [{ translateX: -100 }], // Adjusted for horizontal centering
    alignItems: 'center',
  },

  boxButton: {
    marginLeft: -80,
    width: 400,
    height: 350,
    top: -20,
    borderRadius: 20, // Updated corner radius
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 5,
  },

  boxIcon: {
    width: 200,
    height: 200,
    tintColor: '#fff',
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Transparent black background
  },

  modalContent: {
    height: '80%',
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  map: {
    width: '100%',
    height: '100%',
  },

  carIcon: {
    width: 30,
    height: 30,
  },

  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF4500',
    padding: 10,
    borderRadius: 5,
  },

  closeText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default HistoryScreen;
