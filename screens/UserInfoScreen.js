import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, ScrollView, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { ref, get, child, update } from 'firebase/database';
import { database } from '../firebaseConfig';
import Icon from 'react-native-vector-icons/Ionicons';

const UserInfoScreen = ({ navigation, route }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyEmail, setEmergencyEmail] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [loading, setLoading] = useState(false);

  // Track initial values
  const [initialData, setInitialData] = useState({});

  useEffect(() => {
    if (route.params && route.params.name) {
      setName(route.params.name);
      fetchUserData(route.params.name);
    }
  }, [route.params]);
  
  const fetchUserData = async (userName) => {
    setLoading(true);
    const dbRef = ref(database);
    try {
      const snapshot = await get(child(dbRef, `users/${userName}`));
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setEmail(userData.email);
        setPassword(userData.password);
        setEmergencyName(userData.emergencyContact.name);
        setEmergencyEmail(userData.emergencyContact.email);
        setEmergencyPhone(userData.emergencyContact.phone);
  
        // Store initial values
        setInitialData({
          email: userData.email,
          password: userData.password,
          emergencyName: userData.emergencyContact.name,
          emergencyEmail: userData.emergencyContact.email,
          emergencyPhone: userData.emergencyContact.phone,
        });
      } else {
        Alert.alert('Error', 'User does not exist.');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to fetch user data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
  
    // Check for changes only since last confirmed save
    let changes = [];
    if (initialData.email !== email) {
      changes.push(`Are you sure you want to change email from "${initialData.email}" to "${email}"?`);
    }
    if (initialData.password !== password) {
      changes.push(`Are you sure you want to change password from "${initialData.password}" to "${password}"?`);
    }
    if (initialData.emergencyName !== emergencyName) {
      changes.push(`Are you sure you want to change emergency contact name from "${initialData.emergencyName}" to "${emergencyName}"?`);
    }
    if (initialData.emergencyEmail !== emergencyEmail) {
      changes.push(`Are you sure you want to change emergency contact email from "${initialData.emergencyEmail}" to "${emergencyEmail}"?`);
    }
    if (initialData.emergencyPhone !== emergencyPhone) {
      changes.push(`Are you sure you want to change emergency contact phone from "${initialData.emergencyPhone}" to "${emergencyPhone}"?`);
    }
  
    if (changes.length > 0) {
      Alert.alert('Confirm Changes', changes.join('\n'), [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const dbRef = ref(database);
              await update(child(dbRef, `users/${name}`), {
                email,
                password,
                emergencyContact: {
                  name: emergencyName,
                  email: emergencyEmail,
                  phone: emergencyPhone,
                },
              });
              Alert.alert('Success', 'Changes saved successfully!');
  
              // Update initialData to match the current state after saving
              setInitialData({
                email,
                password,
                emergencyName,
                emergencyEmail,
                emergencyPhone,
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to save changes: ' + error.message);
            }
          },
        },
      ]);
    }
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to Logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => navigation.navigate('Login') },
      ],
      { cancelable: false }
    );
  };
  
  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }
  
  return (
    <>
      {/* Set the status bar color */}
      <StatusBar barStyle="light-content" backgroundColor="#7E704B" />
      
      <ImageBackground source={require('../assets/background_light.png')} style={styles.backgroundImage}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-back" size={30} color="#1E1E1E" />
          </TouchableOpacity>
          
          <View style={styles.userInfoContainer}>
            <Text style={styles.sectionTitle}>User Information</Text>
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
            <TextInput style={styles.input} placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
          </View>
          
          <View style={styles.emergencyContainer}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            <TextInput style={styles.input} placeholder="Emergency Name" value={emergencyName} onChangeText={setEmergencyName} />
            <TextInput style={styles.input} placeholder="Emergency Email" value={emergencyEmail} onChangeText={setEmergencyEmail} keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="Emergency Phone" value={emergencyPhone} onChangeText={setEmergencyPhone} keyboardType="phone-pad" />
          </View>
          
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </ImageBackground>
    </>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  userInfoContainer: {
    marginBottom: 20,
  },
  emergencyContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 50,
    backgroundColor: '#C1B390',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 30,
    paddingHorizontal: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 1,
  },
  saveButton: {
    backgroundColor: '#FF8C00',
    borderRadius: 30,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  logoutText: {
    color: '#8F8787',
    fontWeight: 'bold',
    marginTop: 60,
    fontSize: 18,
    textAlign: 'center',
  },
});

export default UserInfoScreen;
