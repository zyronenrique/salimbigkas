import React, { useEffect, useState } from 'react'
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { View, TouchableOpacity, Image, Text, ScrollView } from 'react-native';
import { Octicons } from '@expo/vector-icons';
import { useLessonsState } from '@/hooks/useLessonsState';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { imageSrc } from '@/Icons/icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useClassContext } from '@/hooks/classContext';
import { StatusBar } from 'expo-status-bar';

const LessonFiles = () => {
    const router = useRouter();
    const { setVideoUrl } = useClassContext();
    const { state } = useLessonsState();
    const [isPortrait, setIsPortrait] = useState(true);

    useEffect(() => {
        const checkOrientation = async () => {
            const orientation = await ScreenOrientation.getOrientationAsync();
            setIsPortrait(
                orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
                orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
            );
        };
        checkOrientation();
        const subscription = ScreenOrientation.addOrientationChangeListener(() => {
            checkOrientation();
        });
        return () => {
            ScreenOrientation.removeOrientationChangeListener(subscription);
        };
    }, []);

    const formatSize = (size: number) =>
        size < 1024
            ? `${size} B`
            : size < 1024 * 1024
            ? `${(size / 1024).toFixed(1)} KB`
            : `${(size / (1024 * 1024)).toFixed(1)} MB`;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#2C3E50' }}>
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={{ flex: 1 }}>
                <TouchableOpacity 
                    style={{ position: 'absolute', top: 10, left: 12, zIndex: 1 }}
                    onPress={() => router.back()}
                >
                    <Image source={imageSrc.gameX} style={{ width: 40, height: 40 }} resizeMode='contain' />
                </TouchableOpacity>
                {isPortrait && (
                    <TouchableOpacity
                        style={{ position: 'absolute', top: 10, right: 12, zIndex: 1 }}
                        onPress={() => router.navigate('/lessons/modal')}
                    >
                        <Image source={imageSrc.gameInfo} style={{ width: 40, height: 40 }} resizeMode='contain' />
                    </TouchableOpacity>
                )}
                <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', padding: 20, marginTop: 40 }}>
                    {state.videos.length > 0 ? (
                        state.videos.map((video, index) => (
                            <TouchableOpacity 
                                key={video.id || index}
                                onPress={() => {
                                    setVideoUrl(video.videoUrl);
                                    router.navigate('/lessons/videoScreen');
                                }}
                                style={{ height: 100, marginBottom: 20, padding: 20, backgroundColor: '#FFA600', borderRadius: 10, width: '100%', flexDirection: 'row', alignItems: 'center', gap: 16 }}
                            >
                                <Octicons name="video" size={40} color="#2C3E50" />
                                <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                    <View style={{ width: '100%' }}>
                                        <Text style={{ width: 120, color: "#2c3e50", fontSize: 24, fontWeight: 'bold' }} numberOfLines={1}>
                                            {video.videoTitle}
                                        </Text>
                                    </View>
                                    <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <Text style={{ fontSize: 16, textAlign: "left", color: "#2c3e50" }}>
                                            {video.videoSize ? formatSize(video.videoSize) : ""} -{" "}
                                        </Text>
                                        <View style={{ width: 1, height: 24, backgroundColor: "#2c3e50", marginHorizontal: 8 }} />
                                        <Text style={{ fontSize: 16, textAlign: "left", color: "#2c3e50" }}>
                                            {video.createdAt ? new Date(video.createdAt).toLocaleString() : ""}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold', marginBottom: 10 }}>No Videos Available for this Lesson</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default LessonFiles