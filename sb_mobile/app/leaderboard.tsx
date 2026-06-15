import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { database, dbRef, onValue } from '@/firebase/firebase';
import { View, Text, Image, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/hooks/authContext';
import { imageSrc } from '@/Icons/icons';
import { StatusBar } from 'expo-status-bar';
import { useClassContext } from '@/hooks/classContext';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useRouter } from 'expo-router';
import BumalikBtn from '@/components/bumalikBtn';
import { LeaderboardText } from '@/components/customText';
import { LinearGradient } from 'expo-linear-gradient';

interface LeaderboardEntry {
    uid: string;
    displayName: string;
    photoURL: string | null;
    gradeLevel: string | null;
    quizTaken: number;
    seatworkTaken: number;
    totalScore: number | { operand: number };
    updatedAt: number;
}

const Leaderboard = memo(() => {
    const router = useRouter();
    const { currentUser, gradeLevel } = useAuth();
    const flatListRef = useRef<FlatList>(null);
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refresh, setRefresh] = useState<boolean>(false);
    const { mode } = useClassContext();

    useFocusEffect(
        useCallback(() => {
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
            return undefined;
        }, [])
    );

    useEffect(() => {
        const leaderboardRef = dbRef(database, `leaderboard/${mode}/${gradeLevel}`);
        const unsubscribe = onValue(leaderboardRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const entriesArray = Object.values(data) as LeaderboardEntry[];
                let filteredEntries = entriesArray;
                filteredEntries.sort((a, b) => {
                    const scoreA = typeof a.totalScore === 'object' ? a.totalScore?.operand || 0 : a.totalScore || 0;
                    const scoreB = typeof b.totalScore === 'object' ? b.totalScore?.operand || 0 : b.totalScore || 0;
                    return scoreB - scoreA;
                });
                setEntries(filteredEntries);
            } else {
                setEntries([]);
            }
            setLoading(false);
        }, (error) => {
            console.error('Error fetching leaderboard:', error);
            setLoading(false);
        });
        return () => {
            unsubscribe();
        };
    }, [mode, gradeLevel, refresh]);

    const userRank = entries.findIndex(e => e.uid === currentUser?.uid) + 1;

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return imageSrc.trophy1;
            case 2: return imageSrc.trophy2;
            case 3: return imageSrc.trophy3;
            default: return null;
        }
    };

    const entriesLength = entries.length > 0;

    useEffect(() => {
        if (!loading && entriesLength && userRank > 0 && flatListRef.current) {
            setTimeout(() => {
                flatListRef.current?.scrollToIndex({
                    index: userRank - 1,
                    animated: true,
                    viewPosition: 0.5,
                    viewOffset: 0,
                });
            }, 300);
        }
    }, [loading, entries, userRank]);

    return (
        <SafeAreaView style={{
            flexGrow: 1,
            backgroundColor: "#FFA600",
            padding: 16,
            justifyContent: "center",
            position: "relative",
        }}>
            <StatusBar style="dark" />
            <BumalikBtn onPress={() => router.back()} size={24} />
            <View style={{ flex: 1, width: '100%', maxWidth: 600, zIndex: 5 }}>
                <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <LeaderboardText size={32} />
                </View>
                <View style={{ flex: 1, backgroundColor: '#003311', borderRadius: 40, borderColor: '#8a3903', borderWidth: 8, padding: 18 }}>
                    {entriesLength && (
                        <>
                            <Text style={{ fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 12, textAlign: 'center' }}>
                                {userRank > 0 ? (
                                    <>You're in <Text style={{ color: '#FFD700' }}>{userRank}{userRank === 1 ? 'st' : userRank === 2 ? 'nd' : userRank === 3 ? 'rd' : 'th'} place</Text></>
                                ) : (
                                    <>You are not ranked yet. Play to get a rank!</>
                                )}
                            </Text>
                            <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingHorizontal: 4, paddingVertical: 8, borderRadius: 8, marginBottom: 8 }}>
                                <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row', gap: 8 }}>
                                    <Text style={{ flex: 1, color: '#fff', fontWeight: '900', textAlign: 'center' }}>Rank</Text>
                                    <Text style={{ flex: 1, color: '#fff', fontWeight: '900', textAlign: 'center' }}>Name</Text>
                                </View>
                                <Text style={{ flex: 1, color: '#fff', fontWeight: '900', textAlign: 'center' }}>{mode === 'seatwork' ? 'Seatwork' : 'Quiz'} Taken</Text>
                                <Text style={{ flex: 1, color: '#fff', fontWeight: '900', textAlign: 'center' }}>Total Score</Text>
                            </View>
                        </>
                    )}
                    <FlatList
                        ref={flatListRef}
                        data={entries}
                        keyExtractor={(item) => item.uid}
                        scrollEnabled={true}
                        showsVerticalScrollIndicator={false}
                        refreshing={loading}
                        onRefresh={() => setRefresh(!refresh)}
                        contentContainerStyle={{ 
                            flex: entriesLength ? 0 : 1, 
                            justifyContent: 'center', 
                            gap: 8,
                            paddingBottom: entriesLength ? 40 : 0,
                        }}
                        getItemLayout={(_, index) => ({
                            length: 72,
                            offset: 72 * index,
                            index,
                        })}
                        renderItem={({ item, index }) => {
                            const isCurrentUser = item.uid === currentUser?.uid;
                            return (
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        paddingVertical: 8,
                                        borderWidth: isCurrentUser ? 4 : 2,
                                        borderColor: isCurrentUser ? '#FFA600' : '#ccc',
                                        backgroundColor: isCurrentUser ? '#ffee8c' : '#f9fafb',
                                        borderRadius: 8,
                                        shadowColor: "#FFA600",
                                        shadowOpacity: 0.2,
                                        shadowRadius: 4,
                                        shadowOffset: { width: 0, height: 1 },
                                    }}
                                >
                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                                        <View style={{ flex: 1, alignItems: 'center' }}>
                                            {index + 1 <= 3 && getRankIcon(index + 1) ? (
                                                <Image source={getRankIcon(index + 1)} style={{ width: 56, height: 56 }} resizeMode='contain' />
                                            ) : (
                                                <Text style={{ fontSize: 20, fontWeight: "900", color: "#333", textAlign: "center" }}>#{index + 1}</Text>
                                            )}
                                        </View>
                                        <View style={{ flex: 1, position: 'relative', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                            <Text style={{ flex: 1, fontSize: isCurrentUser ? 24 : 16, color: "#2C3E50", textAlign: 'center', fontWeight: isCurrentUser ? '900' : 'bold' }}>
                                                {item.displayName}
                                            </Text>
                                            {item.uid === currentUser?.uid && (
                                                <Text style={{
                                                    position: "absolute",
                                                    top: -2,
                                                    right: -30,
                                                    backgroundColor: "#2C3E50",
                                                    color: "#fff",
                                                    fontSize: 10,
                                                    fontWeight: "900",
                                                    borderRadius: 12,
                                                    paddingHorizontal: 6,
                                                    paddingVertical: 2,
                                                }}> You </Text>
                                            )}
                                        </View>
                                    </View>
                                    <Text style={{ flex: 1, fontSize: isCurrentUser ? 24 : 16, color: "#2C3E50", textAlign: 'center', fontWeight: isCurrentUser ? '900' : 'bold' }}>
                                        {typeof (item as any)[`${mode}Taken`] === 'object' && (item as any)[`${mode}Taken`]?.operand}
                                    </Text>
                                    <Text style={{ flex: 1, fontSize: isCurrentUser ? 24 : 16, color: "#2C3E50", textAlign: 'center', fontWeight: isCurrentUser ? '900' : 'bold' }}>
                                        {typeof item.totalScore === 'object' && (item as any).totalScore?.operand} <Text style={{ fontWeight: '900', fontSize: 14 }}>pts</Text>
                                    </Text>
                                </View>
                            );
                        }}
                        ListEmptyComponent={
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: 20, borderRadius: 8 }}>
                                <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: '900', color: '#fff' }}>Wala pang score. Mauna kang maglaro!</Text>
                            </View>
                        }
                        onScrollToIndexFailed={({ index, averageItemLength }) => {
                            flatListRef.current?.scrollToOffset({
                                offset: index * (averageItemLength || 72),
                                animated: true,
                            });
                        }}
                    />
                    {entriesLength && (
                        <LinearGradient
                            colors={['transparent', '#003311']}
                            style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                bottom: 0,
                                height: 50,
                                zIndex: 10,
                                borderBottomLeftRadius: 40,
                                borderBottomRightRadius: 40,
                            }}
                            pointerEvents="none"
                        />
                    )}
                </View>
            </View>
            <View style={{ position: 'absolute', right: 20, height: '100%', zIndex: 0 }}>
                <View style={{ position: 'relative' }}>
                    <Text style={{
                        position: 'absolute',
                        zIndex: 10,
                        top: mode === 'seatwork' ? 50 : 45,
                        right: mode === 'seatwork' ? 105 : 115,
                        fontSize: mode === 'seatwork' ? 16 : 28,
                        fontWeight: '900',
                        color: '#2C3E50',
                    }}>{mode?.toUpperCase()}</Text>
                    <Image
                        source={imageSrc.leaderboard}
                        style={{ width: 300, height: '100%' }}
                        resizeMode="contain"
                    />
                </View>
            </View>
        </SafeAreaView>
    )
});

export default Leaderboard;