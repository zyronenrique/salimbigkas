import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Image, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { imageSrc } from '@/Icons/icons';
import { MotiText } from 'moti';
import { useLogRegContext } from '@/hooks/logRegContext';
import DropDownPicker from 'react-native-dropdown-picker';
import BumalikBtn from '@/components/bumalikBtn';

const RolePage=()=> {
    const router = useRouter();
    const { role, setRole } = useLogRegContext();
    const [isRoleFocused, setIsRoleFocused] = useState(false);
    const [open, setOpen] = useState(false);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#2C3E50', padding: 16, justifyContent: 'center' }}>
            <BumalikBtn
                style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}
                onPress={() => router.back()}
                size={24}
            />
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={imageSrc.role}
                    style={{
                        width: 280,
                        height: 200,
                    }}
                    resizeMode='contain'
                />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 34, fontWeight: '900', marginBottom: 16, color: '#fff' }}>What's your role?</Text>
                <Text style={{ fontSize: 18, fontWeight: 'semibold', marginBottom: 16, color: '#fff' }}>Please select your role.</Text>
                <View style={{ width: '100%', position: 'relative', marginTop: 8 }}>
                    <MotiText
                        animate={{
                            top: isRoleFocused || role ? -14 : 18,
                        }}
                        transition={{
                            type: 'timing',
                            duration: 200,
                        }}
                        style={{
                            position: 'absolute',
                            left: 16,
                            zIndex: 2,
                            backgroundColor: isRoleFocused || role ? '#2C3E50' : 'transparent',
                            paddingHorizontal: 12,
                            paddingVertical: 4,
                            borderRadius: 8,
                            fontSize: isRoleFocused || role ? 16 : 18,
                            fontWeight: '900',
                            color: isRoleFocused ? '#fff' : '#aaa',
                        }}
                    >
                        Role
                    </MotiText>
                    <DropDownPicker
                        open={open}
                        value={role}
                        items={[
                            { label: 'Student', value: 'Student', icon: () => <MaterialIcons name="school" size={24} color="#2C3E50" /> },
                            { label: 'Teacher', value: 'Teacher', icon: () => <FontAwesome5 name="chalkboard-teacher" size={24} color="#2C3E50" /> },
                            // { label: 'Admin', value: 'Admin', icon: () => <MaterialIcons name="admin-panel-settings" size={24} color="#2C3E50" /> },
                        ]}
                        setOpen={setOpen}
                        setValue={setRole}
                        onOpen={() => setIsRoleFocused(true)}
                        onClose={() => setIsRoleFocused(false)}
                        placeholder={isRoleFocused ? 'Select your role...' : ''}
                        activityIndicatorColor="#2C3E50"
                        activityIndicatorSize={30}
                        ActivityIndicatorComponent={({color, size}) => (
                            <ActivityIndicator color={color} size={size} />
                        )}
                        style={{
                            height: 70,
                            marginBottom: 12,
                            backgroundColor: 'white',
                            borderRadius: 8,
                            paddingHorizontal: 18,
                            borderWidth: 0,
                        }}
                        dropDownContainerStyle={{
                            borderRadius: 8,
                        }}
                        textStyle={{
                            fontSize: 18,
                        }}
                        zIndex={1}
                    />
                    <FontAwesome5 style={{ position: 'absolute', top: 20, right: 12 }} name="user-alt" size={24} color="#2C3E50" />
                </View>
            </View>
            <TouchableOpacity
                disabled={!role}
                onPress={() => {
                    if (role === 'Student') {
                        router.push('/signInWithEmailPassword/gradeLevelPage');
                    } else {
                        router.push('/signInWithEmailPassword/passwordPage');
                    }
                }}
                style={{ opacity: !role ? 0.5 : 1, width: '100%', backgroundColor: 'white', marginTop: 16, paddingVertical: 20, borderRadius: 8, elevation: 2, alignItems: 'center', justifyContent: 'center' }}
            >
                <Text style={{ fontSize: 18, fontWeight: '900' }}>Continue</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default RolePage;
