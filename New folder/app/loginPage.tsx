import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

export default function LoginPage() {
    const router = useRouter();
    const pathname = usePathname();

    const handleNavigation = (path: any) => {
        if (pathname !== path) {
            router.push({
                pathname: path,
            });
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
                <Text style={styles.title}>Login or Signup</Text>
                <View style={styles.form}>
                    <View style={styles.socialButtons}>
                        <TouchableOpacity style={styles.googleButton}>
                            <Text style={styles.textButton}>Google</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.facebookButton}>
                            <Text style={styles.textButton}>Facebook</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.signInWithEmail}>
                        <TouchableOpacity style={styles.signInButton} onPress={()=> handleNavigation('/signInPage')}>
                            <Text style={styles.textButton}>Mag-login</Text>
                        </TouchableOpacity>
                        <View style={styles.dividerContainer}>
                            <View style={styles.divider}/>
                            <Text style={styles.orText}>O kaya</Text>
                            <View style={styles.divider}/>
                        </View>
                        <TouchableOpacity style={styles.signUpButton} onPress={()=> handleNavigation('/signUpPage')}>
                            <Text style={styles.textButton}>Mag-signup</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
        fontSize: 18,
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
});