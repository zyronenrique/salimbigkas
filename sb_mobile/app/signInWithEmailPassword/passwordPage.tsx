import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Image, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { imageSrc } from '@/Icons/icons';
import { MotiText } from 'moti';
import { useLogRegContext } from '@/hooks/logRegContext';
import { doCreateUserWithEmailAndPassword, doSignInWithEmailAndPassword } from '@/firebase/auth';
import { Toast } from 'toastify-react-native';
import BumalikBtn from '@/components/bumalikBtn';
import PasswordRequirements from '@/components/passwordRequirements';

const PasswordPage=()=> {
    const router = useRouter();
    const { proceedToPassword, email, fullname, role, gradeLevel, password, setPassword, setIcon } = useLogRegContext();
    const ptp = proceedToPassword;
    const [showPassword, setShowPassword] = useState(false);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    const passwordRequirements = [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[a-z]/.test(password),
        /\d/.test(password),
        /[@$!%*?&]/.test(password),
    ];
    const allPasswordValid = passwordRequirements.every(Boolean);
    const canProceed = password.length > 0;
    
    const handleLoginRegister = async () => {
        if (isSigningIn) return;
        setIsSigningIn(true);
        try {
            if (ptp) {
                await doSignInWithEmailAndPassword(email, password);

            } else {
                await doCreateUserWithEmailAndPassword(
                    email,
                    password,
                    fullname,
                    role,
                    null,
                    gradeLevel,
                );
            }
            setIsSigningIn(false);
        } catch (error) {
            setIcon('errorBox');
            const code = (error as any).code;
            let errorTitle = "";
            let errorMsg = "";
            if (ptp) {
                errorTitle = "Login Failed";
                if (code === "auth/user-not-found" || code === "auth/wrong-password") {
                    errorMsg = "Invalid email or password. Please try again.";
                } else if (code === "auth/user-disabled") {
                    router.replace('/signInWithEmailPassword/restrictedPage');
                    return;
                } else if (code === "auth/too-many-requests") {
                    errorMsg = "Too many unsuccessful login attempts. Please try again later.";
                } else {
                    errorMsg = `We couldn't find your account. Please check your email and password.`;
                }
            } else {
                errorTitle = "Registration Failed";
                if (code === "auth/email-already-in-use") {
                    errorMsg = "The email address is already in use. Please use a different email.";
                } else if (code === "auth/operation-not-allowed") {
                    errorMsg = "Registration is currently disabled. Please contact support.";
                } else if (code === "auth/user-disabled") {
                    router.replace('/signInWithEmailPassword/restrictedPage');
                    return;
                } else {
                    errorMsg = "Registration failed. Please try again.";
                }
            }
            Toast.show({
                type: ('custom' as any),
                text1: errorTitle,
                text2: errorMsg,
                autoHide: false,
                progressBarColor: '#8a3903',
            })
            setIsSigningIn(false);
        } finally {
            setIsSigningIn(false);
        }
    };

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
                    <Text style={{ fontSize: 34, fontWeight: '900', marginBottom: 16, color: '#fff' }}>Enter your password.</Text>
                    <Text style={{ fontSize: ptp ? 16 : 20, fontWeight: 'semibold', marginBottom: 16, color: '#fff' }}>
                        {ptp ? <>Log in with your password to <Text style={{ fontWeight: 'bold' }}>{email}</Text></> : 'Please enter your password to continue.'}
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
                        {!ptp && isPasswordFocused && !allPasswordValid && (
                            <PasswordRequirements password={password} />
                        )}
                    </View>
                    {ptp && (
                        <TouchableOpacity 
                            disabled={isSigningIn}
                            style={{ alignSelf: 'flex-start', marginBottom: 20 }} 
                            onPress={() => router.push('/signInWithEmailPassword/forgotPasswordPage')}
                        >
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#ffa600', textAlign: 'right' }}>Forgot password?</Text>
                        </TouchableOpacity>
                    )}
                </View>
                {isSigningIn ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, marginBottom: isPasswordFocused ? 16 : 0,  }}>
                        <ActivityIndicator size="large" color="#fff" style={{ marginRight: 8 }} />
                        <Text style={{ fontSize: 18, fontWeight: '900', color: '#fff' }}>{ptp ? 'Logging in...' : 'Creating Account...'}</Text>
                    </View>
                ):(
                    <TouchableOpacity 
                        disabled={!ptp && !allPasswordValid || !canProceed || isSigningIn}
                        onPress={handleLoginRegister} 
                        style={{ opacity: !ptp && !allPasswordValid || !canProceed || isSigningIn ? 0.5 : 1, width: '100%', flexDirection: 'row', backgroundColor: 'white', marginTop: 16, marginBottom: isPasswordFocused ? 16 : 0, paddingVertical: 20, borderRadius: 8, elevation: 2, alignItems: 'center', justifyContent: 'center' }}
                    >
                        
                        <Text style={{ fontSize: 18, fontWeight: '900' }}>
                            {ptp ? 'Log in' : 'Create Account' }
                        </Text>
                    </TouchableOpacity>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default PasswordPage;
