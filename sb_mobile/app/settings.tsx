import { View, Text, TouchableOpacity,Image, ScrollView, RefreshControl } from 'react-native'
import React, { useState } from 'react'
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/authContext';
import { MaterialIcons } from '@expo/vector-icons';
import { doSignOut } from '@/firebase/auth';
import { useLogRegContext } from '@/hooks/logRegContext';
import DialogComponent from '../components/dialogComponent';
import BumalikBtn from '@/components/bumalikBtn';
import { useBigkasContext } from '@/hooks/bigkasContext';
import { useClassContext } from '@/hooks/classContext';
import { useQuizContext } from '@/hooks/quizContext';
import { useSeatworkContext } from '@/hooks/seatworkContext';

const Settings = () => {
    const router = useRouter();
    const { currentUser, gradeLevel, refreshUser } = useAuth();
    const { resetState, setEmail, setReauthenticate } = useLogRegContext();
    const { resetBigkasContext } = useBigkasContext();
    const { resetClassContext } = useClassContext();
    const { resetQuizContext } = useQuizContext();
    const { resetSeatworkContext } = useSeatworkContext();
    const [refreshing, setRefreshing] = useState(false);
    const [visible, setVisible] = useState(false);

    const showDialog = () => setVisible(true);
    const hideDialog = () => setVisible(false);
    
    const handleSignOut = async () => {
        resetState();
        resetBigkasContext();
        resetClassContext();
        resetQuizContext();
        resetSeatworkContext();
        await doSignOut();
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
    };
    
    const handleChangePassword = () => {
        setEmail(currentUser?.email || '');
        setReauthenticate(false);
        router.push('/profile/reauthenticatePage');
    };
    
    const settingsMenu = [
        {
            title: 'Edit Profile',
            description: 'Update your personal information',
            textColor: '#2C3E50',
            onPress: () => router.push('/profile/viewProfile'),
        },
        {
            title: 'Change Password',
            description: 'Secure your account',
            textColor: '#2C3E50',
            onPress: handleChangePassword,
        },
        {
            title: 'Notifications',
            description: 'Manage notification settings',
            textColor: '#2C3E50',
            onPress: () => router.push('/notification'),
        },
        {
            title: 'Legal',
            description: 'Terms of Service & Privacy Policy',
            textColor: '#2C3E50',
            onPress: () => router.push('/legal'),
        },
        {
            title: 'Log out',
            description: 'Sign out of your account',
            textColor: '#8B0000',
            onPress: showDialog,
        },
    ];

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshUser();
        setRefreshing(false);
    };

    return (
        <SafeAreaView style={{
            flex: 1,
            backgroundColor: '#2C3E50',
            paddingHorizontal: 16,
            paddingVertical: 12,
        }}>
            <ScrollView style={{ flex: 1 }} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#2C3E50']}
                        tintColor="#2C3E50"
                    />
                }
            >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <BumalikBtn
                        style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}
                        onPress={() => router.back()}
                        size={24}
                    />
                    <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff'  }}>Settings</Text>
                        <Text style={{ fontSize: 12, color: '#AAB8C2' }}>Manage your account settings</Text>
                    </View>
                </View>
                {/* Profile Header */}
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}>
                        <Image
                            source={currentUser?.photoURL ? { uri: currentUser.photoURL } : require('@/assets/images/man.png')}
                            style={{ width: 112, height: 112, borderRadius: 56, borderWidth: 2, borderColor: '#fff' }}
                            resizeMode="contain"
                        />
                        <View style={{ marginLeft: 16, flex: 1 }}>
                            <View style={{ position: 'relative', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <Text style={{ fontSize: 32, fontWeight: '600', color: '#fff' }} numberOfLines={1}>{currentUser?.displayName}</Text>
                                {gradeLevel && (<Text style={{ fontSize: 18, fontWeight: '900', color: '#2C3E50', backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }} numberOfLines={1}>{gradeLevel}</Text>)}
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 }}>
                                <MaterialIcons name="email" size={24} color="#fff" />
                                <Text style={{ fontSize: 18, color: '#AAB8C2', fontWeight: 'bold' }}>{currentUser?.email}</Text>
                            </View>
                        </View>
                    </View>
                    {/* Settings Menu */}
                    <View style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'space-evenly',
                        backgroundColor: '#FFA600',
                        borderRadius: 12,
                        elevation: 4,
                    }}>
                        {settingsMenu.map((item, idx) => (
                            <TouchableOpacity
                                key={item.title + idx}
                                style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 }}
                                activeOpacity={0.7}
                                onPress={item.onPress}
                            >
                                <View style={{ flex: 1, gap: 4, paddingVertical: 10 }}>
                                    <Text style={{ color: item.textColor, fontWeight: '900', fontSize: 22 }}>{item.title}</Text>
                                    <Text style={{ fontSize: 16, color: '#2C3E50', fontWeight: 'bold' }}>{item.description}</Text>
                                    {idx < settingsMenu.length - 1 && (<View style={{ borderBottomWidth: 1, borderBottomColor: '#eee', marginTop: 12 }} />)}
                                </View>
                                <View>
                                    <MaterialIcons name="chevron-right" size={32} color="#2C3E50" />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
            {/* Logout Confirmation Dialog */}
            <DialogComponent 
                icon="alert"
                title="Confirm logout"
                content="Are you sure you want to log out?"
                visible={visible}
                hideDialog={hideDialog}
                handleConfirm={handleSignOut}
            />
        </SafeAreaView>
    )
}

export default Settings;
