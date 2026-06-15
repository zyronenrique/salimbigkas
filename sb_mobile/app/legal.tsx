import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Tos from './tos';
import Privacy from './privacy';
import BumalikBtn from '@/components/bumalikBtn';

const Legal = () => {
    const router = useRouter();
    const [visibleTos, setVisibleTos] = useState(false);
    const [visiblePrivacy, setVisiblePrivacy] = useState(false);

    const showDialogTos = () => setVisibleTos(true);
    const hideDialogTos = () => setVisibleTos(false);
    const showDialogPrivacy = () => setVisiblePrivacy(true);
    const hideDialogPrivacy = () => setVisiblePrivacy(false);

    const legal = [
        {
            title: 'Terms of Service',
            description: 'Read our terms and conditions',
            textColor: '#2C3E50',
            onPress: showDialogTos,
        },
        {
            title: 'Privacy Policy',
            description: 'Learn about our privacy practices',
            textColor: '#2C3E50',
            onPress: showDialogPrivacy,
        },
    ];

    return (
        <SafeAreaView style={{
            flex: 1,
            backgroundColor: '#2C3E50',
            paddingHorizontal: 16,
            paddingVertical: 12,
        }}>
            <ScrollView style={{ flex: 1 }} 
                showsVerticalScrollIndicator={false}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <BumalikBtn 
                        style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}
                        onPress={() => router.back()}
                        size={24}
                    />
                    <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff'  }}>Legal</Text>
                        <Text style={{ fontSize: 12, color: '#AAB8C2' }}>View Legal Documents</Text>
                    </View>
                </View>
                {/* Profile Header */}
                <View style={{ flex: 1 }}>
                    {/* Settings Menu */}
                    <View style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'space-evenly',
                        backgroundColor: '#FFA600',
                        borderRadius: 12,
                        elevation: 4,
                    }}>
                        {legal.map((item, idx) => (
                            <TouchableOpacity
                                key={item.title + idx}
                                style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 }}
                                activeOpacity={0.7}
                                onPress={item.onPress}
                            >
                                <View style={{ flex: 1, gap: 4, paddingVertical: 10 }}>
                                    <Text style={{ color: item.textColor, fontWeight: '900', fontSize: 22 }}>{item.title}</Text>
                                    <Text style={{ fontSize: 16, color: '#2C3E50', fontWeight: 'bold' }}>{item.description}</Text>
                                    {idx < legal.length - 1 && (<View style={{ borderBottomWidth: 1, borderBottomColor: '#eee', marginTop: 12 }} />)}
                                </View>
                                <View>
                                    <MaterialIcons name="chevron-right" size={32} color="#2C3E50" />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
            <Tos visible={visibleTos} hideDialog={hideDialogTos} />
            <Privacy visible={visiblePrivacy} hideDialog={hideDialogPrivacy} />
        </SafeAreaView>
    )
}

export default Legal;
