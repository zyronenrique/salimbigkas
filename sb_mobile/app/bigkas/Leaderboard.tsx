import { useState, useEffect, memo, useRef } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet, FlatList } from 'react-native';
import { database, dbRef, onValue } from '@/firebase/firebase';
import { imageSrc } from '@/Icons/icons';
import { useBigkasContext } from '@/hooks/bigkasContext';
import { useAuth } from '@/hooks/authContext';
import { LinearGradient } from 'expo-linear-gradient';

interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string | null;
  gradeLevel: string | null;
  levelNumber: number;
  mode: string;
  totalScore: number | { operand: number };
  totalWords: number;
  correctWords: number;
  accuracy: number;
  completedAt: number;
  timestamp: number;
}

const Leaderboard = memo(() => {
  const { bigkasResults } = useBigkasContext();
  const { currentUser } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  
  useEffect(() => {
    const leaderboardRef = dbRef(database, `leaderboard/bigkas/${bigkasResults?.bigkasId}/${bigkasResults?.mode}`);
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
  }, [bigkasResults?.bigkasId, bigkasResults?.levelNumber, bigkasResults?.mode]);

  const userIndex = entries.findIndex(e => e.uid === currentUser?.uid);
  const userRank = userIndex + 1;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return imageSrc.trophy1;
      case 2: return imageSrc.trophy2;
      case 3: return imageSrc.trophy3;
      default: return null;
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  useEffect(() => {
    if (!loading && entries.length > 0 && userIndex >= 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: userIndex,
          animated: true,
          viewPosition: 0.5,
          viewOffset: 0,
        });
      }, 300);
    }
  }, [loading, entries, userIndex]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#208ec5" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: '900', color: '#fff' }}>
            {userRank > 0 && <>You're in <Text style={{ color: '#FFD700' }}>{userRank}{userRank === 1 ? 'st' : userRank === 2 ? 'nd' : userRank === 3 ? 'rd' : 'th'} place</Text></>}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {bigkasResults?.levelNumber && bigkasResults?.mode && (
            <Text style={{ fontSize: 24, fontWeight: '900', color: '#fff' }}>Level <Text style={{ color: '#FFD700' }}>{bigkasResults.levelNumber}</Text> ~ <Text style={{ color: '#FFD700' }}>{bigkasResults?.mode.charAt(0).toUpperCase() + bigkasResults?.mode.slice(1)}</Text></Text>
          )}
        </View>
      </View>
      <FlatList
        ref={flatListRef}
        data={entries}
        keyExtractor={entry => entry.uid}
        showsVerticalScrollIndicator={false}
        style={styles.entriesList}
        getItemLayout={(_, index) => ({
          length: 72,
          offset: 72 * index,
          index,
        })}
        renderItem={({ item: entry, index }) => (
          <View
            style={[
              styles.entryRow,
              entry.uid === currentUser?.uid
                ? styles.entryCurrentUser
                : styles.entryOtherUser
            ]}
          >
            <View style={styles.rankSection}>
              {index + 1 <= 3 && getRankIcon(index + 1) ? (
                <Image source={getRankIcon(index + 1)} style={styles.rankIcon} resizeMode='contain' />
              ) : (
                <Text style={styles.rankText}>#{index + 1}</Text>
              )}
            </View>
            <View style={styles.userSection}>
              {entry.photoURL ? (
                <Image source={{ uri: entry.photoURL }} style={styles.avatar} resizeMode='cover' />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {entry.displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.userInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.displayName}>
                    {entry.displayName}
                  </Text>
                  {entry.uid === currentUser?.uid && (
                    <Text style={styles.youBadge}> You </Text>
                  )}
                </View>
                <Text style={styles.userDetails}>
                  Level {entry.levelNumber} • {entry.mode} • {formatTime(entry.completedAt)}
                </Text>
              </View>
            </View>
            <View style={styles.scoreSection}>
              <Text style={styles.scoreText}>{entry.totalScore} pts</Text>
              <Text style={styles.accuracyText}>{entry.accuracy}% accuracy</Text>
              <Text style={styles.wordsText}>{entry.correctWords}/{entry.totalWords} words</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.noScoresContainer}>
            <Text style={styles.noScoresText}>Wala pang score. Mauna kang maglaro!</Text>
          </View>
        }
        onScrollToIndexFailed={({ index, averageItemLength }) => {
          flatListRef.current?.scrollToOffset({
            offset: index * (averageItemLength || 72),
            animated: true,
          });
        }}
      />
      <LinearGradient
        colors={['transparent', '#003311']}
        style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 40,
            zIndex: 10,
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
        }}
        pointerEvents="none"
    />
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#003311",
    borderRadius: 40,
    borderWidth: 8,
    borderColor: "#8a3903",
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  loadingContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  noScoresContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  noScoresText: {
    color: "#bbb",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  entriesList: {
    marginTop: 8,
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  entryCurrentUser: {
    borderWidth: 4,
    borderColor: "#FFA600",
    backgroundColor: "#fefce8",
    shadowColor: "#FFA600",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  entryOtherUser: {
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  rankSection: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  rankIcon: {
    height: 56,
    width: 56,
  },
  rankText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    marginLeft: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#eee",
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2C3E50",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  avatarInitial: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 20,
  },
  userInfo: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 2,
  },
  displayName: {
    fontWeight: "900",
    color: "#1e2939",
    fontSize: 18,
  },
  youBadge: {
    backgroundColor: "#2C3E50",
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  userDetails: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#6a7282",
  },
  scoreSection: {
    alignItems: "flex-end",
    gap: 4,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#2C3E50",
  },
  accuracyText: {
    fontSize: 14,
    color: "#6a7282",
  },
  wordsText: {
    fontSize: 12,
    color: "#6a7282",
  },
});

export default Leaderboard;