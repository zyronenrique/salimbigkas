import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Image, Text, TouchableOpacity, StyleSheet, ActivityIndicator, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { imageSrc } from '@/Icons/icons';
import { doGoogleSignIn } from '@/firebase/auth';
import { MotiView } from "moti";
import Tos from './tos';
import Privacy from './privacy';
import { useAuth } from '@/hooks/authContext';
import { useFocusEffect } from '@react-navigation/native';
import { useLogRegContext } from '@/hooks/logRegContext';
import { Toast } from 'toastify-react-native';
import { checkUserStatus } from '@/utils/helpers';

export default function Index() {
    const router = useRouter();
    const { userLoggedIn, currentUser } = useAuth();
    const { resetState, setIcon } = useLogRegContext();
    const [isGoogleSignIn, setIsGoogleSignIn] = useState(false);
    const [visibleTos, setVisibleTos] = useState(false);
    const [visiblePrivacy, setVisiblePrivacy] = useState(false);

    useEffect(() => {
        if (!currentUser) return;
        if (!currentUser.emailVerified) {
            router.replace('/signInWithEmailPassword/verifyEmailPage');
        } else if (userLoggedIn) {
            checkUserStatus();
        }
    }, [userLoggedIn, currentUser]);

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                BackHandler.exitApp();
                return true;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => {
                subscription.remove();
            };
        }, [])
    );

    const showDialogTos = () => setVisibleTos(true);
    const hideDialogTos = () => setVisibleTos(false);
    const showDialogPrivacy = () => setVisiblePrivacy(true);
    const hideDialogPrivacy = () => setVisiblePrivacy(false);

    const handleGoogleSignIn = useCallback(async () => {
        if (isGoogleSignIn) return;
        setIsGoogleSignIn(true);
        try {
            await doGoogleSignIn();
        } catch (error: any) {
            setIcon('errorBox');
            Toast.show({
                type: ('custom' as any),
                text1: 'Google Sign-In Error',
                text2: error.message || 'An unknown error occurred during Google Sign-In.',
                autoHide: false,
                progressBarColor: '#8a3903',
            });
            setIsGoogleSignIn(false);
        } finally {
            setIsGoogleSignIn(false);
        }
    }, [isGoogleSignIn, setIcon]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.imageContainer}>
                <Image
                    source={imageSrc.aiQuizPeeking}
                    style={styles.logo}
                />
            </View>
            <MotiView
                from={{ translateY: 400, opacity: 0 }}
                animate={{ translateY: 0, opacity: 1 }}
                transition={{ type: 'timing', duration: 1000 }}
                style={styles.popup}
            >
                <Text style={styles.title}>Login or Signup</Text>
                <View style={styles.form}>
                    <View style={styles.socialButtons}>
                        <TouchableOpacity disabled={isGoogleSignIn} style={styles.googleButton} onPress={handleGoogleSignIn}>
                            <View style={styles.logoContainer}>
                                <Image source={imageSrc.googleLogo} style={styles.googleLogo} />
                            </View>
                            {isGoogleSignIn ? (
                                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                    <ActivityIndicator size='small' color="#2C3E50" />
                                    <Text style={styles.textButton}>Signing in...</Text>
                                </View>
                            ):(
                                <Text style={styles.textButton}>Continue with Google</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                    <View style={styles.dividerContainer}>
                        <View style={styles.divider}/>
                        <Text style={styles.orText}>Or</Text>
                        <View style={styles.divider}/>
                    </View>
                    <View style={styles.signInWithEmail}>
                        <TouchableOpacity 
                            disabled={isGoogleSignIn} 
                            style={styles.signInButton} 
                            onPress={()=> {
                                resetState();
                                router.push('/signInWithEmailPassword/emailPage');
                            }}
                        >
                            <View style={styles.logoContainer}>
                                <MaterialIcons name="email" size={30} color="#2C3E50" />
                            </View>
                            <Text style={styles.textButton}>Continue with Email</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.agreementText}>
                        By Continuing, you agree to our{' '}
                        <Text style={styles.linkText} onPress={showDialogTos}>
                            Terms of Service
                        </Text>
                        {' '}and{' '}
                        <Text style={styles.linkText} onPress={showDialogPrivacy}>
                            Privacy Policy
                        </Text>
                    </Text>
                </View>
            </MotiView>
            <Tos visible={visibleTos} hideDialog={hideDialogTos} />
            <Privacy visible={visiblePrivacy} hideDialog={hideDialogPrivacy} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2C3E50',
    },
    imageContainer: {
        flex: 1,
        marginTop: 100,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    logo: {
        width: 250,
        height: 400,
        resizeMode: 'contain',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popup: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
    },
    textButton: {
        flex: 1,
        alignSelf: 'center',
        color: '#ffffff',
        paddingHorizontal: 40,
        fontSize: 16,
        fontWeight: 'bold',
    },
    title: {
        alignSelf: 'flex-start',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'left',
        color: '#2C3E50',
    },
    form: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    socialButtons: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        height: 56,
    },
    googleButton: {
        flex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        gap: 10,
        backgroundColor: '#2980b9',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    logoContainer: {
        height: '100%',
        paddingHorizontal: 20,
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    googleLogo: {
        width: 30,
        height: '100%',
        resizeMode: 'contain',
    },
    facebookButton: {
        backgroundColor: '#2C3E50',
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
        width: '100%',
        height: 56,
        display: 'flex',
        flexDirection: 'row',
        gap: 10,
        backgroundColor: '#2C3E50',
        borderRadius: 5,
        justifyContent: 'center',
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
        backgroundColor: '#2C3E50',
        padding: 15,
        paddingVertical: 20,
        borderRadius: 5,
        alignItems: 'center',
        elevation: 5,
    },
    agreementText: {
        textAlign: 'left',
        color: '#2C3E50',
        fontSize: 13,
    },
    linkText: {
        color: '#2980b9',
        textDecorationLine: 'underline',
    },
});