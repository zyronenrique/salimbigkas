import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Image, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { imageSrc } from '@/Icons/icons';
import { doSendEmailVerification, syncEmailVerifiedToRealtimeDB } from '@/firebase/auth';
import { auth } from '@/firebase/firebase';
import { doSetUserStatus } from '@/api/functions';
import { Toast } from 'toastify-react-native';
import BumalikBtn from '@/components/bumalikBtn';
import { MaterialIcons } from '@expo/vector-icons';
import { useLogRegContext } from '@/hooks/logRegContext';
import { checkUserStatusRealtime } from '@/utils/helpers';

const RESEND_INTERVAL = 30;

const VerifyEmailPage=()=> {
    const router = useRouter();
    const { setIcon, resetState } = useLogRegContext();
    const [isSending, setIsSending] = useState(false);
    const [timer, setTimer] = useState(RESEND_INTERVAL);
    const [canResend, setCanResend] = useState(false);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (timer > 0) {
            intervalRef.current = setTimeout(() => setTimer(timer - 1), 1000);
            setCanResend(false);
        } else {
            setCanResend(true);
        }
        return () => {
            if (intervalRef.current) clearTimeout(intervalRef.current);
        };
    }, [timer]);

    useEffect(() => {
        const interval = setInterval(async () => {
            const user = auth.currentUser;
            if (user) {
                await user.reload();
                await syncEmailVerifiedToRealtimeDB(user);
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const unsubscribe = checkUserStatusRealtime(async (userData, userId) => {
            if (userData.emailVerified) {
                if (userData.disabled) {
                    await doSetUserStatus(userId, userId, true);
                    await auth.signOut();
                    router.replace('/signInWithEmailPassword/restrictedPage');
                    return;
                } else {
                    resetState();
                    router.replace('/(tabs)');
                }
            }
        });
        return () => {
            unsubscribe && unsubscribe();
        };
    }, []);

    const handleSendVerificationEmail = useCallback(async () => {
        if (isSending || !canResend) return;
        setIsSending(true);
        try {
            await doSendEmailVerification();
            setTimer(RESEND_INTERVAL);
            setIcon('checkBox');
            Toast.show({
                type: ('custom' as any),
                text1: 'Verification Email Sent!',
                text2: 'Please check your inbox.',
                autoHide: false,
                progressBarColor: '#8a3903',
            });
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
            setIsSending(false);
        }
    }, [isSending, canResend]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#2C3E50', padding: 16, justifyContent: 'space-between' }}>
            <BumalikBtn
                disabled={isSending}
                style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}
                onPress={() => router.back()}
                size={24}
            />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
                <Image
                    source={imageSrc.email}
                    style={{
                        width: 150,
                        height: 150,
                    }}
                    resizeMode='contain'
                />
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }}>
                    <Text style={{ textAlign: 'center', fontSize: 28, fontWeight: '900', marginBottom: 20, color: '#fff' }}>Verify your email address to get started.</Text>
                    <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#fff' }}>We'll send a verification link to your email.</Text>
                    <View style={{ paddingLeft: 28, paddingRight: 16, gap: 8 }}>
                        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
                            <MaterialIcons name="info" size={24} color="#fff" />
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#e5e7eb', textAlign: 'justify', lineHeight: 18 }}>If you don't see the email, please check your spam folder.</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
                            <MaterialIcons name="info" size={24} color="#fff" />
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#e5e7eb', textAlign: 'justify', lineHeight: 18 }}>Once your email is verified, we will detect your email verification status automatically. Wait for a moment.</Text>
                        </View>
                    </View>
                </View>
            </View>
            <TouchableOpacity 
                disabled={!canResend || isSending}
                onPress={handleSendVerificationEmail} 
                style={{ opacity: (!canResend || isSending) ? 0.5 : 1, width: '100%', backgroundColor: 'white', marginTop: 16, paddingVertical: 20, borderRadius: 8, elevation: 2, alignItems: 'center', justifyContent: 'center' }}
            >
                {isSending ? (
                    <ActivityIndicator size="large" color="#2C3E50" />
                ) : (
                    <Text style={{ fontSize: 18, fontWeight: '900' }}>
                        {canResend ? 'Send verification email' : `Resend in ${timer}s`}
                    </Text>
                )}
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default VerifyEmailPage;
