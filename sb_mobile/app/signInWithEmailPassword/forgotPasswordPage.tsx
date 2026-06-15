import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Image, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { imageSrc } from '@/Icons/icons';
import { doPasswordReset } from '@/firebase/auth';
import { useLogRegContext } from '@/hooks/logRegContext';
import { Toast } from 'toastify-react-native';
import BumalikBtn from '@/components/bumalikBtn';

const RESEND_INTERVAL = 30;

const ForgotPasswordPage=()=> {
    const router = useRouter();
    const [isSending, setIsSending] = useState(false);
    const [timer, setTimer] = useState(RESEND_INTERVAL);
    const [canResend, setCanResend] = useState(false);
    const intervalRef = useRef<number | null>(null);
    const { email, setIcon } = useLogRegContext();

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

    const handleSendPasswordReset = useCallback(async () => {
        if (isSending || !canResend) return;
        setIsSending(true);
        try {
            await doPasswordReset(email);
            setTimer(RESEND_INTERVAL);
            setIcon('checkBox');
            Toast.show({
                type: ('custom' as any),
                text1: 'Password Reset Email Sent',
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
                    source={imageSrc.password}
                    style={{
                        width: 200,
                        height: 180,
                    }}
                    resizeMode='contain'
                />
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }}>
                    <Text style={{ textAlign: 'center', fontSize: 28, fontWeight: '900', marginBottom: 16, color: '#fff' }}>Reset your password</Text>
                    <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: 'semibold', marginBottom: 16, color: '#fff' }}>We'll send a password reset link to your email.</Text>
                </View>
            </View>
            <TouchableOpacity 
                disabled={!canResend || isSending}
                onPress={handleSendPasswordReset}
                style={{ opacity: (!canResend || isSending) ? 0.5 : 1, width: '100%', backgroundColor: 'white', marginTop: 16, paddingVertical: 20, borderRadius: 8, elevation: 2, alignItems: 'center', justifyContent: 'center' }}
            >
                {isSending ? (
                    <ActivityIndicator size="large" color="#2C3E50" />
                ) : (
                    <Text style={{ fontSize: 18, fontWeight: '900' }}>
                        {canResend ? 'Send password reset email' : `Send in ${timer}s`}
                    </Text>
                )}
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default ForgotPasswordPage;
