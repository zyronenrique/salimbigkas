import React, { memo } from 'react'
import { View, Image } from 'react-native';
import { getWordImages } from '@/utils/helpers';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const LeaderboardText = memo(({ size }: { size: number }) => {
    return (
        <View style={{ flexDirection: 'row', backgroundColor: 'transparent' }}>
            {getWordImages(`leaderboard`, true).map((imageSrc, index) => (
                <Image
                    key={index}
                    source={imageSrc || ""}
                    style={{ width: size, height: size, marginRight: -8 }}
                    resizeMode='contain'
                />
            ))}
        </View>
    )
});

export const MyYunitText = memo(() => {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#2C3E50' }}>
            <View style={{ flexDirection: 'row', backgroundColor: 'transparent'}}>
            {getWordImages(`my yunits`, true).map((imageSrc, index) => (
                <Image
                    key={index}
                    source={imageSrc || ""}
                    style={{ 
                        width: 24, 
                        height: 24, 
                        marginLeft: 
                        index > 0 && index <= 1 
                            ? -4 
                            : index > 1 && index <= 2 
                            ? 4 
                            : index > 2 && index <= 4
                            ? -4
                            : index > 4 && index <= 6
                            ? -8
                            : index > 6
                            ? -6
                            : 0 
                    }}
                    resizeMode='contain'
                />
            ))}
            </View>
            <MaterialCommunityIcons name="book-search" size={34} color="white" />
        </View>
    )
});

export const YunitText = memo(({ yunitNumber }: { yunitNumber: string }) => {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' }}>
            {getWordImages(`Yunit ${yunitNumber}`, true).map((imageSrc, index) => (
                <Image
                    key={index}
                    source={imageSrc || ""}
                    style={{ 
                        width: 28, 
                        height: 28, 
                        marginLeft: 
                        index > 0 && index <= 2 
                        ? -4 
                        : index > 2 && index <= 4
                        ? -10.5
                        : index > 4
                        ? 8
                        : 0 
                    }}
                    resizeMode='contain'
                />
            ))}
        </View>
    )
});

export const LessonText = memo(({ lessonNumber }: { lessonNumber: string }) => {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' }}>
            {getWordImages(`Lesson ${lessonNumber}`, true).map((imageSrc, index) => (
                <Image
                    key={index}
                    source={imageSrc || ""}
                    style={{ width: 28, height: 28, resizeMode: 'contain', marginLeft: index > 0 && index <= 5 ? -8 : index > 5 ? 8 : 0 }}
                />
            ))}
        </View>
    )
});
