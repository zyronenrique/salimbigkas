import React, { memo, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { View, Image, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { imageSrc } from '@/Icons/icons';
import { getWordImages } from '@/utils/helpers';
import { StatusBar } from 'expo-status-bar';
import { useClassContext } from '@/hooks/classContext';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useRouter } from 'expo-router';
import { LeaderboardText } from '@/components/customText';
import BumalikBtn from '@/components/bumalikBtn';

const LeaderboardSelection = memo(() => {
    const router = useRouter();
    const { setMode } = useClassContext();

    useFocusEffect(
        useCallback(() => {
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
            return undefined;
        }, [])
    );

    const renderPlay = useCallback((mode: string) => (
        <View style={{
            position: 'absolute',
            top: '90%',
            left: mode === 'seatwork' ? '53%' : '70%',
            flexDirection: 'row',
            transform: [{ translateX: -120 }, { translateY: -30 }],
            borderRadius: 5,
            padding: 10,
            backgroundColor: 'transparent',
        }}>
            {getWordImages(mode, true).map((imageSrc, index) => (
                <Image
                    key={index}
                    source={imageSrc}
                    style={{
                        width: 35,
                        height: 30,
                        resizeMode: 'contain',
                        marginLeft: 
                            index > 0 && mode === 'seatwork' 
                                ? -12 
                                : (index > 0 && index <= 1) && mode === 'quiz' 
                                    ? -12
                                    : index > 1 && mode === 'quiz'
                                        ? -16
                                        : 0,
                    }}
                />
            ))}
        </View>
    ), []);

    return (
        <SafeAreaView style={{
            flexGrow: 1,
            backgroundColor: "#FFA600",
            padding: 16,
            justifyContent: "center",
            position: "relative",
        }}>
            <StatusBar style="dark" />
            <BumalikBtn 
                onPress={() => {
                    router.back(); 
                    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
                }}
                size={24}
            />
            <View style={{ flex: 1 }}>
                <View style={{ marginBottom: 16, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                    <View style={{ alignItems: 'center'}}>
                        <LeaderboardText size={32} />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {getWordImages(`selection`, true).map((imageSrc, index) => (
                            <Image
                                key={index}
                                source={imageSrc || ""}
                                style={{ width: 24, height: 24, marginLeft: index > 0 ? -8 : 0 }}
                                resizeMode='contain'
                            />
                        ))}
                    </View>
                </View>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', backgroundColor: '#003311', borderRadius: '100%', borderColor: '#8a3903', borderWidth: 4, padding: 16 }}>
                    <TouchableOpacity 
                        style={{ alignItems: 'center', justifyContent: 'center' }}
                        onPress={() => {
                            setMode('quiz');
                            router.navigate('/leaderboard');
                        }}
                    >
                        <Image
                            source={imageSrc.quiz}
                            style={{
                                width: 300,
                                height: '100%',
                            }}
                            resizeMode="contain"
                        />
                        {renderPlay("quiz")}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ alignItems: 'center', justifyContent: 'center' }}
                        onPress={() => {
                            setMode('seatwork');
                            router.navigate('/leaderboard');
                        }}
                    >
                        <Image
                            source={imageSrc.seatwork}
                            style={{
                                width: 300,
                                height: '100%',
                            }}
                            resizeMode="contain"
                        />
                        {renderPlay("seatwork")}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
});

export default LeaderboardSelection;