import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Image, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { imageSrc } from '@/Icons/icons';
import { MotiText } from 'moti';
import { useLogRegContext } from '@/hooks/logRegContext';
import BumalikBtn from '@/components/bumalikBtn';

const NamePage=()=> {
    const router = useRouter();
    const { fullname, setFullname } = useLogRegContext();
    const [isNameFocused, setIsNameFocused] = useState(false);

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
                        source={imageSrc.name}
                        style={{
                            width: 200,
                            height: 180,
                        }}
                        resizeMode='contain'
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 34, fontWeight: '900', marginBottom: 16, color: '#fff' }}>What's your name?</Text>
                    <Text style={{ fontSize: 18, fontWeight: 'semibold', marginBottom: 16, color: '#fff' }}>Please enter your full name.</Text>
                    <View style={{ width: '100%', position: 'relative', marginTop: 8 }}>
                        <MotiText
                            animate={{
                                top: isNameFocused || fullname ? -14 : 18,
                            }}
                            transition={{
                                type: 'timing',
                                duration: 200,
                            }}
                            style={{
                                position: 'absolute',
                                left: 16,
                                zIndex: 2,
                                backgroundColor: isNameFocused || fullname ? '#2C3E50' : 'transparent',
                                paddingHorizontal: 12,
                                paddingVertical: 4,
                                borderRadius: 8,
                                fontSize: isNameFocused || fullname ? 16 : 18,
                                fontWeight: '900',
                                color: isNameFocused ? '#fff' : '#aaa',
                            }}
                        >
                            Full name
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
                            value={fullname}
                            onChangeText={setFullname}
                            keyboardType="default"
                            autoCapitalize="words"
                            onFocus={() => setIsNameFocused(true)}
                            onBlur={() => setIsNameFocused(false)}
                        />
                        <FontAwesome5 style={{ position: 'absolute', top: 20, right: 12 }} name="user-alt" size={24} color="#2C3E50" />
                    </View>
                </View>
                <TouchableOpacity
                    disabled={!fullname}
                    onPress={() => router.push('/signInWithEmailPassword/rolePage')}
                    style={{ opacity: !fullname ? 0.5 : 1, width: '100%', backgroundColor: 'white', marginTop: 16, marginBottom: isNameFocused ? 16 : 0, paddingVertical: 20, borderRadius: 8, elevation: 2, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Text style={{ fontSize: 18, fontWeight: '900' }}>Continue</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default NamePage;
