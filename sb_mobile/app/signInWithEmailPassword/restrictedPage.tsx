import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Image, Text, TouchableOpacity, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import { imageSrc } from '@/Icons/icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useLogRegContext } from '@/hooks/logRegContext';

const RestrictedPage = () => {
    const router = useRouter();
    const { resetState } = useLogRegContext();

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

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#2C3E50', padding: 16, justifyContent: 'space-between' }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
                <Image
                    source={imageSrc.restricted}
                    style={{
                        width: 200,
                        height: 200,
                    }}
                    resizeMode='contain'
                />
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }}>
                    <Text style={{ textAlign: 'center', fontSize: 30, fontWeight: '900', marginBottom: 16, color: '#fff' }}>Account Restricted</Text>
                    <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: '900', marginBottom: 8, color: '#fff' }}>Your account is pending verification.</Text>
                    <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: 'semibold', color: '#e5e7eb' }}>Please wait for approval from the school administrator.</Text>
                </View>
            </View>
            <TouchableOpacity 
                onPress={() => {
                    resetState();
                    router.replace('/');
                }}
                style={{ width: '100%', backgroundColor: 'white', marginTop: 16, paddingVertical: 20, borderRadius: 8, elevation: 2, alignItems: 'center', justifyContent: 'center' }}
            >
                <Text style={{ fontSize: 18, fontWeight: '900' }}>Return</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default RestrictedPage;
