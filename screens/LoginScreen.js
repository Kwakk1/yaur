import React, { useState, useCallback } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, ImageBackground, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { ref, get, child } from 'firebase/database'; 
import { database } from '../firebaseConfig'; 
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native'; // Import the useFocusEffect hook

const LoginScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state

  // Reset fields when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setName('');
      setPassword('');
    }, [])
  );

  const handleLogin = async () => {
    if (!name || !password) {
      Alert.alert('Error', 'Please fill in both fields.');
      return;
    }
  
    setLoading(true); // Start loading
    
    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, `users/${name}`));
      setLoading(false); // Stop loading

      if (snapshot.exists()) {
        const userData = snapshot.val();
        if (userData.password === password) {
          Alert.alert('Welcome Back!', `Hello, ${name}!`);
          navigation.navigate('Home', { userName: name }); // Navigate to History screen
        } else {
          Alert.alert('Error', 'Incorrect password.');
        }
      } else {
        Alert.alert('Error', 'User does not exist.');
      }
    } catch (error) {
      setLoading(false); // Stop loading
      Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />; // Loading indicator
  }

  return (
    <ImageBackground source={require('../assets/background_light.png')} style={styles.backgroundImage}>
      <StatusBar barStyle="dark-content" translucent={false} backgroundColor="#7E704B" />

      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={30} color="#D5CBB1" />
        </TouchableOpacity>
        <Image source={require('../assets/saferide_logo.png')} style={[styles.image, { marginTop: -20 }]} />
        <Text style={styles.title}>Welcome to SafeRide!</Text>
        <Text style={styles.subtitle}>Drink responsibly</Text>
        <TextInput style={[styles.input, styles.nameInput]} placeholder="Name" value={name} onChangeText={setName} />
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Password"
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.eyeButton}>
            <Icon name={passwordVisible ? 'eye-off' : 'eye'} size={24} color="#000" style={styles.eyeIcon} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleLogin} style={[styles.button, { borderRadius: 30, backgroundColor: '#F5A11F' }]}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>
        <View style={styles.registerContainer}>
          <Text style={styles.registerPrompt}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.register}>Register!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 0,
    
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    paddingTop: 0,
  },
  image: {
    width: 130,
    height: 130,
    marginTop: -20,
    marginBottom: 26,
  },
  title: {
    fontSize: 31.2,
    fontWeight: 'bold',
    marginBottom: 13,
  },
  subtitle: {
    color: '#8F8787',
    marginBottom: 26,
  },
  input: {
    width: '80%',
    height: 52,
    padding: 13,
    marginBottom: 20,
  },
  nameInput: {
    backgroundColor: '#C1B390',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    position: 'relative',
    
  },
  passwordInput: {
    backgroundColor: '#C1B390',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 30,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 1,
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
  },
  eyeIcon: {
    right: 0,
    marginBottom: 20,
  },
  button: {
    padding: 13,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 1,
  },
  buttonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 18,
  },
  forgotPassword: {
    marginTop: 13,
  },
  registerContainer: {
    flexDirection: 'row',
    marginTop: 50,
  },
  registerPrompt: {
    color: '#8F8787',
  },
  register: {
    color: '#1F120C',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
