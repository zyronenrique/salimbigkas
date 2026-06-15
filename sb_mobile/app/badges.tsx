import React from 'react'
import { imageSrc } from '@/Icons/icons';
import { ProtectedScreen } from '@/routes/ProtectedScreen';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ScrollView, Image, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressBar, MD3Colors } from 'react-native-paper';
import BumalikBtn from '@/components/bumalikBtn';

const Badges = () => {
    const router = useRouter();
    
    const BADGES = [
        {
            id: "first_try_hero",
            name: "First Try Hero",
            description: "Score 80% on your first attempt at any quiz.",
            image: imageSrc.firstTryHero,
            progress: null,
        },
        {
            id: "persistence_pro",
            name: "Persistence Pro",
            description: "Finish 5 quizzes in one week without skipping any days.",
            image: imageSrc.persistencePro,
            progress: null,
        },
        {
            id: "speedster",
            name: "Speedster",
            description: "Answer every question correctly within 10 seconds.",
            image: imageSrc.speedster,
            progress: null,
        },
        {
            id: "perfectionist",
            name: "Perfectionist",
            description: "Get every question correctly.",
            image: imageSrc.perfectionist,
            progress: null,
        },
        {
            id: "topic_master",
            name: "Topic Master",
            description: "Score 90% or higher on 5 quizzes in the same lesson.",
            image: imageSrc.topicMaster,
            progress: null,
        },
        {
            id: "streak_star",
            name: "Streak Star",
            description: "Score 80% or higher on 3 consecutive quizzes.",
            image: imageSrc.streakStar,
            progress: null,
        },
        {
            id: "night_owl",
            name: "Night Owl",
            description: "Complete a quiz after 8 PM.",
            image: imageSrc.nightOwl,
            progress: null,
        },
        {
            id: "early_bird",
            name: "Early Bird",
            description: "Complete a quiz before 8 AM.",
            image: imageSrc.earlyBird,
            progress: null,
        },
        {
            id: "quiz_collector",
            name: "Quiz Collector",
            description: "Complete 50 unique quizzes.",
            image: imageSrc.quizCollector,
            progress: null,
        },
        {
            id: "perfect_sequence",
            name: "Perfect Sequence",
            description: "Provide all answers in the correct category.",
            image: imageSrc.perfectSequence,
            progress: null,
        },
        {
            id: "quiz_legend",
            name: "Quiz Legend",
            description: "Earn all other badges.",
            image: imageSrc.quizLegend,
            progress: null,
        },
        {
            id: "instant_recall",
            name: "Instant Recall",
            description: "Identify all letters within 30 seconds each.",
            image: imageSrc.instantRecall,
            progress: null,
        },
        {
            id: "option_oracle",
            name: "Option Oracle",
            description: "Get 100% correct on a multiple choice",
            image: imageSrc.optionOracle,
            progress: null,
        },
        {
            id: "link_master",
            name: "Link Master",
            description: "Match all pairs correctly on the first try.",
            image: imageSrc.linkMaster,
            progress: null,
        },
        {
            id: "syllable_snapper",
            name: "Syllable Snapper",
            description: "Complete 5 words with perfect syllable placement.",
            image: imageSrc.syllableSnapper,
            progress: null,
        },
        {
            id: "big_brain",
            name: "Big Brain",
            description: "Get high scores among students in your grade level.",
            image: imageSrc.bigBrain,
            progress: null,
        },
        {
            id: "no_misfit",
            name: "No Misfit",
            description: "Finish a quiz with zero misplaced syllables.",
            image: imageSrc.noMisfit,
            progress: null,
        },
        {
            id: "syllable_sorcerer",
            name: "Syllable Sorcerer",
            description: "Completes 10 syllable questions.",
            image: imageSrc.syllableSorcerer,
            progress: null,
        }
    ];

    return (
        <ProtectedScreen requireVerifiedEmail={true}>
            <StatusBar style="light" />
            <SafeAreaView style={{ flex: 1, backgroundColor: '#2C3E50', padding: 16 }}>
                <ScrollView 
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={false}
                            onRefresh={() => {}}
                            colors={['#2C3E50']}
                            tintColor="#2C3E50"
                        />
                    }
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <BumalikBtn 
                            style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}
                            onPress={() => router.back()}
                            size={24}
                        />
                        <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>Badges</Text>
                        </View>
                    </View>
                    <View style={{ flex: 1, padding: 16, alignItems: 'center', marginBottom: 24, position: 'relative' }}>
                        <View style={{ marginBottom: 24, alignItems: 'center' }}>
                            <Text style={{ fontSize: 14, color: '#fff', fontWeight: 'bold' }}>Earn badges by completing quizzes and seatworks</Text>
                        </View>
                        {BADGES.map(badge => (
                            <View key={badge.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                <Image source={badge.image} style={{ width: 70, height: 70, marginRight: 16 }} resizeMode='contain' />
                                <View style={{ flex: 1, flexDirection: 'column' }}>
                                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>{badge.name}</Text>
                                    <Text style={{ color: '#fff', fontSize: 14 }}>{badge.description}</Text>
                                </View>
                                {badge.progress !== null && badge.progress !== undefined && (
                                    <View style={{ marginLeft: 16, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 }}>
                                        <ProgressBar 
                                            progress={badge.progress} 
                                            color={MD3Colors.primary50}
                                        />
                                    </View>
                                )}
                                {badge.progress === null && (
                                    <View style={{
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'absolute',
                                        top: '50%',
                                        zIndex: 20,
                                        borderRadius: 24,
                                        transform: [{ translateY: -30 }],
                                     }}>
                                        <Image 
                                            source={imageSrc.locked} 
                                            style={{
                                                width: 60,
                                                height: 60,
                                            }} 
                                            resizeMode='contain'
                                        />
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </ProtectedScreen>
    )
}

export default Badges;