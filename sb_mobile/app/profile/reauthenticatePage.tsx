import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Image, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { imageSrc } from '@/Icons/icons';
import { MotiText } from 'moti';
import { useLogRegContext } from '@/hooks/logRegContext';
import { doReauthenticateWithEmail } from '@/firebase/auth';
import { useAuth } from '@/hooks/authContext';
import { Toast } from 'toastify-react-native';
import BumalikBtn from '@/components/bumalikBtn';

const ReauthenticatePage = () => {
    const router = useRouter();
    const { userLoggedIn, currentUser } = useAuth();
    const { email, reauthenticate, setIcon } = useLogRegContext();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    const handleReauthenticate = useCallback(async () => {
        if (isSigningIn) return;
        setIsSigningIn(true);
        try {
            await doReauthenticateWithEmail(email, password);
            reauthenticate
                ? router.navigate('/profile/changeEmailPage')
                : router.navigate('/profile/changePasswordPage')
        } catch (error) {
            setIcon('errorBox');
            Toast.show({
                type: ('custom' as any),
                text1: 'Reauthentication Failed',
                text2: 'Incorrect password. Please try again.',
                autoHide: false,
                progressBarColor: '#8a3903',
            });
            setIsSigningIn(false);
        } finally {
            setIsSigningIn(false);
        }
    }, [email, password, isSigningIn]);

    useEffect(() => {
        if (isSigningIn) return;
        if (!userLoggedIn && !currentUser) {
            router.replace('/');
            return;
        }
    }, [userLoggedIn, currentUser, isSigningIn]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#2C3E50', padding: 16 }}>
            <KeyboardAvoidingView
                style={{ flex: 1, justifyContent: 'space-between' }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <BumalikBtn
                    disabled={isSigningIn}
                    style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}
                    onPress={() => router.back()}
                    size={24}
                />
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Image
                        source={imageSrc.password}
                        style={{
                            width: 200,
                            height: 180,
                        }}
                        resizeMode='contain'
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 34, fontWeight: '900', marginBottom: 16, color: '#fff' }}>Reauthenticate with your email.</Text>
                    <Text style={{ fontSize: 20, fontWeight: 'semibold', marginBottom: 16, color: '#fff' }}>
                        'Please enter your password to continue.'
                    </Text>
                    <View style={{ width: '100%', position: 'relative', marginTop: 8 }}>
                        <MotiText
                            animate={{
                                top: isPasswordFocused || password ? -14 : 18,
                            }}
                            transition={{
                                type: 'timing',
                                duration: 200,
                            }}
                            style={{
                                position: 'absolute',
                                left: 16,
                                zIndex: 2,
                                backgroundColor: isPasswordFocused || password ? '#2C3E50' : 'transparent',
                                paddingHorizontal: 12,
                                paddingVertical: 4,
                                borderRadius: 8,
                                fontSize: isPasswordFocused || password ? 16 : 18,
                                fontWeight: '900',
                                color: isPasswordFocused ? '#fff' : '#aaa',
                            }}
                        >
                            Password
                        </MotiText>
                        <TextInput
                            style={{
                                height: 70,
                                marginBottom: 12,
                                color: '#2C3E50',
                                backgroundColor: 'white',
                                paddingHorizontal: 18,
                                paddingRight: 48,
                                borderRadius: 8,
                                padding: 12,
                                elevation: 2,
                                fontSize: 18,
                                lineHeight: 34,
                            }}
                            maxLength={20}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            keyboardType="default"
                            autoCapitalize="none"
                            onFocus={() => setIsPasswordFocused(true)}
                            onBlur={() => setIsPasswordFocused(false)}
                            editable={!isSigningIn}
                        />
                        <TouchableOpacity
                            style={{ position: 'absolute', top: 20, right: 12 }}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Ionicons
                                name={showPassword ? "eye-off" : "eye"}
                                size={28}
                                color="#2C3E50"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                {isSigningIn ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, marginBottom: isPasswordFocused ? 16 : 0,  }}>
                        <ActivityIndicator size="large" color="#fff" style={{ marginRight: 8 }} />
                        <Text style={{ fontSize: 18, fontWeight: '900', color: '#fff' }}>Authenticating...</Text>
                    </View>
                ):(
                    <TouchableOpacity 
                        disabled={isSigningIn}
                        onPress={handleReauthenticate} 
                        style={{ opacity: isSigningIn ? 0.5 : 1, width: '100%', flexDirection: 'row', backgroundColor: 'white', marginTop: 16, marginBottom: isPasswordFocused ? 16 : 0, paddingVertical: 20, borderRadius: 8, elevation: 2, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Text style={{ fontSize: 18, fontWeight: '900' }}>
                            Continue
                        </Text>
                    </TouchableOpacity>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ReauthenticatePage;
