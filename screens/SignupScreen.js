import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, ScrollView, Image, Modal, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ref, get, child, set } from 'firebase/database';
import { database } from '../firebaseConfig';

const SignupScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State for Emergency Contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyEmail, setEmergencyEmail] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = () => {
    try {
      if (name === '' || email === '' || password === '' || confirmPassword === '') {
        Alert.alert('Error', 'Please fill in all fields.');
        return;
      }
  
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match.');
        return;
      }
  
      setModalVisible(true);
    } catch (error) {
      Alert.alert('Error', `An error occurred during sign-up: ${error.message}`);
    }
  };
  
  const handleAdd = async () => {
    try {
      if (emergencyName === '' || emergencyEmail === '' || emergencyPhone === '') {
        Alert.alert('Error', 'Please fill in all emergency contact fields.');
        return;
      }
  
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, `users/${name}`));
  
      if (snapshot.exists()) {
        Alert.alert('Error', 'User already exists. Please choose another username.');
      } else {
        await set(ref(database, `users/${name}`), {
          username: name,
          email: email,
          password: password,
          emergencyContact: {
            name: emergencyName,
            email: emergencyEmail,
            phone: emergencyPhone,
          },
        });
        
        Alert.alert('Sign Up Successful', `User ${name} created!`);
  
        // Clear input fields after successful registration
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setEmergencyName('');
        setEmergencyEmail('');
        setEmergencyPhone('');
        setModalVisible(false);
      }
    } catch (error) {
      Alert.alert('Error', `An error occurred: ${error.message}`);
    }
  };
  

  return (
    <ImageBackground source={require('../assets/background_dark.png')} style={styles.backgroundImage}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={30} color="#D5CBB1" />
        </TouchableOpacity>
        <View style={styles.designContainer}>
          <Image source={require('../assets/design.png')} style={[styles.designImage, { resizeMode: 'cover' }]} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Create</Text>
          <Text style={styles.title}>Account</Text>
        </View>
        <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        
        {/* Password Input */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon name={showPassword ? "eye-off" : "eye"} size={24} color="#000" style={styles.eyeIcon} />
          </TouchableOpacity>
        </View>

        {/* Confirm Password Input */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Icon name={showConfirmPassword ? "eye-off" : "eye"} size={24} color="#000" style={styles.eyeIcon} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>SIGN UP</Text>
        </TouchableOpacity>
        <View style={styles.signInContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signInText}>SIGN IN</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Overlay Modal */}
      <Modal transparent={true} animationType="fade" visible={modalVisible}>
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Emergency Contact</Text>
            <TextInput style={styles.input} placeholder="Name" value={emergencyName} onChangeText={setEmergencyName} />
            <TextInput style={styles.input} placeholder="Email" value={emergencyEmail} onChangeText={setEmergencyEmail} keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="Phone Number" value={emergencyPhone} onChangeText={setEmergencyPhone} keyboardType="phone-pad" />
            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  designContainer: {
    position: 'absolute',
    top: -50,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    height: '140%',
  },
  designImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  titleContainer: {
    alignSelf: 'flex-start',
    marginTop: 120,
    marginBottom: 70,
    marginLeft: 20,
  },
  title: {
    fontSize: 45,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: 15,
    marginVertical: 3,
    borderRadius: 30,
    backgroundColor: '#C1B390',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  passwordContainer: {
    width: '100%',
    position: 'relative',
  },
  passwordInput: {
    padding: 15,
    marginVertical: 3,
    borderRadius: 30,
    backgroundColor: '#C1B390',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -45 }],
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 30,
    backgroundColor: '#ffa500',
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signInContainer: {
    alignSelf: 'flex-start',
    marginTop: 10,
    marginLeft: 20,
  },
  signInText: {
    color: '#000',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  addButton: {
    padding: 10,
    borderRadius: 30,
    backgroundColor: '#ffa500',
    alignItems: 'center',
    marginVertical: 10,
  },
  addButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  closeButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#000',
    textDecorationLine: 'underline',
  },
});

export default SignupScreen;
