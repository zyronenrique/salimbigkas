import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Image, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { imageSrc } from '@/Icons/icons';
import { MotiText } from 'moti';
import { checkEmailExists, doSignOut, doVerifyBeforeUpdateEmail } from '@/firebase/auth';
import { useAuth } from '@/hooks/authContext';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Toast } from 'toastify-react-native';
import BumalikBtn from '@/components/bumalikBtn';
import { useLogRegContext } from '@/hooks/logRegContext';
import { useBigkasContext } from '@/hooks/bigkasContext';
import { useClassContext } from '@/hooks/classContext';
import { useQuizContext } from '@/hooks/quizContext';
import { useSeatworkContext } from '@/hooks/seatworkContext';

const ChangeEmailPage = () => {
    const router = useRouter();
    const { userLoggedIn, currentUser } = useAuth();
    const { setIcon } = useLogRegContext();
    const { resetBigkasContext } = useBigkasContext();
    const { resetClassContext } = useClassContext();
    const { resetQuizContext } = useQuizContext();
    const { resetSeatworkContext } = useSeatworkContext();
    const [email, setEmail] = useState('');
    const [isContinue, setIsContinue] = useState(false);
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const isValidEmail = (email: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSignOut = async () => {
        resetBigkasContext();
        resetClassContext();
        resetQuizContext();
        resetSeatworkContext();
        await doSignOut();
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
        setTimeout(() => {
            router.replace('/');
        }, 100);
    };

    const handleEmailChange = async () => {
        if (isContinue) return;
        if (!isValidEmail(email)) {
            setIcon('errorBox');
            Toast.show({
                type: ('custom' as any),
                text1: 'Invalid Email',
                text2: 'Please enter a valid email address.',
                autoHide: false,
                progressBarColor: '#8a3903',
            });
            return;
        }
        setIsContinue(true);
        try {
            const res = await checkEmailExists(email);
            if (!res) {
                await doVerifyBeforeUpdateEmail(email);
                setIcon('checkBox');
                Toast.show({
                    type: ('custom' as any),
                    text1: 'Your email has been updated.',
                    text2: 'Please sign in again with your new email.',
                    onPress: handleSignOut,
                });
                setIsContinue(false);
                return;
            } else {
                setIcon('errorBox');
                Toast.show({
                    type: ('custom' as any),
                    text1: 'Email already in use',
                    text2: 'An account with this email already exists. Please enter a different email.',
                    autoHide: false,
                    progressBarColor: '#8a3903',
                });
            }
            setIsContinue(false);
        } catch (error) {
            setIcon('errorBox');
            Toast.show({
                type: ('custom' as any),
                text1: 'An error occurred',
                text2: 'Please try again.',
                autoHide: false,
                progressBarColor: '#8a3903',
            });
        } finally {
            setIsContinue(false);
        }
    };

    useEffect(() => {
        if (isContinue) return;
        if (!userLoggedIn && !currentUser) {
            router.replace('/');
            return;
        }
    }, [userLoggedIn, currentUser, isContinue]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#2C3E50', padding: 16 }}>
            <KeyboardAvoidingView
                style={{ flex: 1, justifyContent: 'space-between' }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <BumalikBtn 
                    disabled={isContinue}
                    style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}
                    onPress={() => router.back()} 
                    size={24} 
                />
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Image
                        source={imageSrc.email}
                        style={{
                            width: 160,
                            height: 200,
                        }}
                        resizeMode='contain'
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 34, fontWeight: '900', marginBottom: 16, color: '#fff' }}>Enter your new email?</Text>
                    <Text style={{ fontSize: 18, fontWeight: 'semibold', marginBottom: 16, color: '#fff' }}>Please enter a valid email address.</Text>
                    <View style={{ width: '100%', position: 'relative', marginTop: 8 }}>
                        <MotiText
                            animate={{
                                top: isEmailFocused || email ? -14 : 18,
                            }}
                            transition={{
                                type: 'timing',
                                duration: 200,
                            }}
                            style={{
                                position: 'absolute',
                                left: 16,
                                zIndex: 2,
                                backgroundColor: isEmailFocused || email ? '#2C3E50' : 'transparent',
                                paddingHorizontal: 12,
                                paddingVertical: 4,
                                borderRadius: 8,
                                fontSize: isEmailFocused || email ? 16 : 18,
                                fontWeight: '900',
                                color: isEmailFocused ? '#fff' : '#aaa',
                            }}
                        >
                            Email
                        </MotiText>
                        <TextInput
                            style={{
                                height: 70,
                                marginBottom: 12,
                                backgroundColor: 'white',
                                paddingHorizontal: 18,
                                paddingRight: 48,
                                borderRadius: 8,
                                padding: 12,
                                elevation: 2,
                                fontSize: 18,
                            }}
                            maxLength={30}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            onFocus={() => setIsEmailFocused(true)}
                            onBlur={() => setIsEmailFocused(false)}
                            editable={!isContinue}
                        />
                        <MaterialIcons style={{ position: 'absolute', top: 20, right: 12 }} name="email" size={28} color="#2C3E50" />
                    </View>
                </View>
                {isContinue ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, marginBottom: isEmailFocused ? 16 : 0,  }}>
                        <ActivityIndicator size="large" color="#fff" style={{ marginRight: 8 }} />
                        <Text style={{ fontSize: 18, fontWeight: '900', color: '#fff' }}>Verifying</Text>
                    </View>
                ):(
                    <TouchableOpacity 
                        disabled={!isValidEmail(email) || isContinue}
                        onPress={handleEmailChange} 
                        style={{ opacity: !isValidEmail(email) || isContinue ? 0.5 : 1, width: '100%', backgroundColor: 'white', marginTop: 16, marginBottom: isEmailFocused ? 16 : 0, paddingVertical: 20, borderRadius: 8, elevation: 2, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Text style={{ fontSize: 18, fontWeight: '900' }}>Verify and update email</Text>
                    </TouchableOpacity>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ChangeEmailPage;
