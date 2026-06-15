import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { fetchCurrentMonthActivities } from '../utils/helpers';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/authContext';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import BumalikBtn from '@/components/bumalikBtn';

const Notification = () => {
    const router = useRouter();
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [allAct, setAllAct] = useState<any[]>([]);

    useEffect(() => {
        const fetchActivities = async () => {
        setLoading(true);
        const data = await fetchCurrentMonthActivities(currentUser?.uid || "");
            setAllAct(data.all);
            setLoading(false);
        };
        fetchActivities();
    }, [refresh]);

    const renderIcon = (activity: string) => {
        if (activity.includes('user')) return <Ionicons name="person" size={24} color="white" />;
        if (activity.includes('lesson')) return <Ionicons name="book" size={24} color="white" />;
        if (activity.includes('system')) return <Ionicons name="settings" size={24} color="white" />;
        if (activity.includes('yunit')) return <Ionicons name="library" size={24} color="white" />;
        if (activity.includes('event')) return <Ionicons name="calendar" size={24} color="white" />;
        if (activity.includes('quiz')) return <Ionicons name="flask" size={24} color="white" />;
        if (activity.includes('class')) return <Ionicons name="school" size={24} color="white" />;
        return <Ionicons name="notifications" size={24} color="white" />;
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <BumalikBtn onPress={() => router.back()} size={24} />
                <Text style={styles.title}>Notifications</Text>
            </View>
            <View style={styles.listContainer}>
                {loading ? (
                    <View style={styles.activityIndicatorContainer}>
                        <ActivityIndicator size="large" color="#2C3E50" />
                    </View>
                ) : allAct.length > 0 ? (
                    <FlatList
                        data={allAct}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.item}>
                                <View style={styles.iconWrap}>{renderIcon(item.activity)}</View>
                                <View style={styles.info}>
                                    <Text style={styles.activity}>{item.activity}</Text>
                                    {item.userName && <Text style={styles.subInfo}>{item.userName}</Text>}
                                    {item.userRole && <Text style={styles.subInfo}>Role: {item.userRole}</Text>}
                                </View>
                                <Text style={styles.time}>
                                    {item.timestamp && formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                </Text>
                            </View>
                        )}
                        showsVerticalScrollIndicator={false}
                        refreshing={loading}
                        onRefresh={() => setRefresh(!refresh)}
                    />
                ) : (
                    <View style={styles.empty}>
                        <Ionicons name="add-circle-outline" size={48} color="#2C3E50" />
                        <Text style={styles.emptyTitle}>No activities found</Text>
                        <Text style={styles.emptySubtitle}>You're all caught up!</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#2C3E50' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    listContainer: { flex: 1, backgroundColor: '#FFA600', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    activityIndicatorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    iconWrap: { backgroundColor: '#2C3E50', borderRadius: 24, padding: 8, marginRight: 12 },
    info: { flex: 1 },
    activity: { fontSize: 16, fontWeight: 'bold', color: '#2C3E50' },
    subInfo: { fontSize: 12, color: '#2C3E50', fontWeight: '400' },
    time: { fontSize: 12, fontWeight: 'bold', color: '#2C3E50', marginLeft: 8 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
    emptyTitle: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50', marginTop: 8 },
    emptySubtitle: { fontSize: 16, color: '#2C3E50', marginTop: 4 },
});

export default Notification;