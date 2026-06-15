import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Image, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { imageSrc } from '@/Icons/icons';
import { MotiText } from 'moti';
import { checkEmailExists } from '@/firebase/auth';
import { useLogRegContext } from '@/hooks/logRegContext';
import { Toast } from 'toastify-react-native';
import BumalikBtn from '@/components/bumalikBtn';

const EmailPage=()=> {
    const router = useRouter();
    const { email, setEmail, setIcon, setProceedToPassword } = useLogRegContext();
    const [isContinue, setIsContinue] = useState<boolean>(false);
    const [isEmailFocused, setIsEmailFocused] = useState<boolean>(false);
    const isValidEmail = (email: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleLogin = async () => {
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
            setProceedToPassword(res);
            if (!res) {
                router.push('/signInWithEmailPassword/namePage');
                setIsContinue(false);
                return;
            }
            router.push('/signInWithEmailPassword/passwordPage');
            setIsContinue(false);
        } catch (error) {
            setIcon('errorBox');
            Toast.show({
                type: ('custom' as any),
                text1: 'An error occurred.',
                text2: 'Please try again.',
                autoHide: false,
                progressBarColor: '#8a3903',
            });
        } finally {
            setIsContinue(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#2C3E50', padding: 16 }}>
            <KeyboardAvoidingView
                style={{ flex: 1, justifyContent: 'space-between' }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <BumalikBtn
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
                    <Text style={{ fontSize: 34, fontWeight: '900', marginBottom: 16, color: '#fff' }}>What's your email?</Text>
                    <Text style={{ fontSize: 18, fontWeight: 'semibold', marginBottom: 16, color: '#fff' }}>We'll check if you have an account.</Text>
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
                <TouchableOpacity 
                    disabled={!isValidEmail(email) || isContinue}
                    onPress={handleLogin} 
                    style={{ opacity: !isValidEmail(email) || isContinue ? 0.5 : 1, width: '100%', backgroundColor: 'white', marginTop: 16, marginBottom: isEmailFocused ? 16 : 0, paddingVertical: 20, borderRadius: 8, elevation: 2, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Text style={{ fontSize: 18, fontWeight: '900' }}>Continue</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default EmailPage;
