import React, { useState } from 'react';
import { View, Image, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

export default function SignUpPage() {
    const router = useRouter();
    const pathname = usePathname();
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    const handleNavigation = (path: any) => {
        if (pathname !== path) {
            router.push({
                pathname: path,
            });
        }
    };

    const handleRegister = async () => {
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
          Alert.alert('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
          return;
        }
        if (!isRegistering) {
          setIsRegistering(true);
          try {
            handleNavigation('/homePage');
            // setShowVerificationModal(true);
          } catch (error) {
            Alert.alert('The email address is already in use. Please use a different email.');
          } finally {
            setIsRegistering(false);
          }
        }
      };

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image
                    source={require('../assets/images/sb-symbol.png')}
                    style={styles.logo}
                />
            </View>
            <View style={styles.loginContainer}>
                <Text style={styles.title}>Register</Text>
                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        value={fullname}
                        onChangeText={setFullname}
                        keyboardType="default"
                        autoCapitalize="none"
                    />
                    <Ionicons
                        style={{ position: 'absolute', top: 13, right: 15 }}
                        name="person"
                        size={24}
                        color="black"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <Ionicons
                        style={{ position: 'absolute', top: 73, right: 15 }}
                        name="person"
                        size={24}
                        color="black"
                    />
                    <View style={{ position: 'relative', width: '100%', marginTop: 5 }}>
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            style={{ position: 'absolute', top: 15, right: 15 }}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Ionicons
                                name={showPassword ? "eye-off" : "eye"}
                                size={24}
                                color="black"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity onPress={handleRegister} style={styles.loginButton}>
                    <Text style={styles.loginText}>Register</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    imageContainer: {
        height: '40%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 200,
        height: 200,
        objectFit: 'contain',
    },
    loginContainer: {
        height: '60%',
        backgroundColor: '#2C3E50',
        paddingHorizontal: 40,
        paddingVertical: 30,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        elevation: 5,
    },
    textButton: {
        fontSize: 16,
        color: '#272264',
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'left',
        color: '#FFF',
    },
    form: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    googleButton: {
        backgroundColor: '#F5F5F5',
        padding: 15,
        paddingVertical: 20,
        borderRadius: 5,
        width: '48%',
        alignItems: 'center',
        elevation: 5,
    },
    facebookButton: {
        backgroundColor: '#F5F5F5',
        padding: 15,
        paddingVertical: 20,
        borderRadius: 5,
        width: '48%',
        alignItems: 'center',
        elevation: 5,
    },
    signInWithEmail: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    signInButton: {
        backgroundColor: '#F5F5F5',
        padding: 15,
        paddingVertical: 20,
        borderRadius: 5,
        alignItems: 'center',
        elevation: 5,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    orText: {
        fontSize: 14,
        color: 'gray',
        marginRight: 10,
        marginLeft: 10,
    },
    divider: {
        width: '40%',
        height: 1,
        backgroundColor: 'gray',
        alignSelf: 'center',
        marginVertical: 20,
    },
    signUpButton: {
        backgroundColor: '#F5F5F5',
        padding: 15,
        paddingVertical: 20,
        borderRadius: 5,
        alignItems: 'center',
        elevation: 5,
    },
    input: {
        width: '100%',
        height: 50,
        marginBottom: 12,
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 15,
        elevation: 5,
    },
    loginButton: {
        width: '100%',
        backgroundColor: '#fff',
        marginTop: 10,
        padding: 15,
        paddingVertical: 20,
        borderRadius: 5,
        gap: 10,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
    loginText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});