import { useCallback, memo, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { Text, View } from '@/components/Themed';
import { useNavigation } from '@react-navigation/native';
import { useBigkasLevels } from '@/hooks/useBigkasLevels';
import { useBigkasContext } from '@/hooks/bigkasContext';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { imageSrc } from '@/Icons/icons';
import { isLevelUnlocked } from '@/utils/helpers';
import Characters from '../../components/Characters';
import BumalikBtn from '@/components/bumalikBtn';
import { YunitText } from '@/components/customText';

const LevelSelection = memo(() => {
  const router = useRouter();
  const navigation = useNavigation();
  const { setSelectedLevel } = useBigkasContext();
  const { state, refreshLevels, handlePrevYunit, handleNextYunit, canGoPrev, canGoNext } = useBigkasLevels();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshLevels();
    setRefreshing(false);
  };

  const panGesture = Gesture.Pan()
    .onEnd((event) => {
      if (event.translationX > 50 && canGoPrev) {
        runOnJS(handlePrevYunit)();
      } else if (event.translationX < -50 && canGoNext) {
        runOnJS(handleNextYunit)();
      }
    });

  const onSelectLevel = useCallback((level: any, levelNumber: number) => {
    setSelectedLevel(level);
    router.push('/bigkas/modeSelection');
  }, [setSelectedLevel, navigation]);

  const selectedYunitLevels = state.levels?.[state.selectedYunitNumber] || [];

  return (
    <SafeAreaView style={styles.SafeAreaView}>
      <StatusBar style="dark" />
      <BumalikBtn onPress={() => router.push('/(tabs)/three')} size={24} />
      <Text style={styles.headerTitle}>Select Level</Text>
      <ScrollView style={styles.scrollView}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2C3E50']}
            tintColor="#2C3E50"
          />
        }
      >
        {!state.isLoading && (
          selectedYunitLevels.length > 0 && (
            <View style={styles.yunitContainer}>
              <Image source={imageSrc.lessThan} style={{ width: 28, height: 28 }} resizeMode='contain' />
              <YunitText yunitNumber={state.selectedYunitNumber} />
              <Image source={imageSrc.greaterThan} style={{ width: 28, height: 28 }} resizeMode='contain' />
            </View>
          )
        )}
        {state.isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}>
            <ActivityIndicator size="large" color="#2C3E50" />
          </View>
        ):(
          <GestureDetector gesture={panGesture}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.levelsGrid}
            >
              {selectedYunitLevels.length > 0 ? (
                selectedYunitLevels.map((level: any, index: number) => {
                  const unlocked = isLevelUnlocked(index, selectedYunitLevels);
                  return (
                    <View key={index} style={styles.levelCard}>
                      <Image
                        source={imageSrc.blackboardLevel}
                        style={[styles.levelBlackboard, !unlocked && styles.levelLocked]}
                        resizeMode='contain'
                      />
                      <TouchableOpacity
                        disabled={!unlocked}
                        style={[
                          styles.levelButton,
                        ]}
                        onPress={() => unlocked && onSelectLevel(level, level.levelNumber)}
                      >
                        <Text style={[styles.levelText, !unlocked && styles.levelTextLocked]}>
                          Level {level.levelNumber}
                        </Text>
                        {!unlocked && (
                          <Image source={imageSrc.locked} style={styles.lockIcon} resizeMode='contain' />
                        )}
                        {level.isCompleted && (
                          <Image source={imageSrc.check} style={styles.checkIcon} resizeMode='contain' />
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })
              ) : (
                <View style={styles.noLevels}>
                  <Text style={styles.noLevelsText}>No levels available</Text>
                </View>
              )}
            </ScrollView>
          </GestureDetector>
        )}
      </ScrollView>
      <Characters />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  SafeAreaView: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FFA600',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFA600',
  },
  headerTitle: {
    position: 'absolute',
    zIndex: 10,
    top: 20,
    right: 20,
    fontSize: 28,
    fontWeight: '900',
    color: '#2C3E50',
  },
  yunitContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    gap: 10,
  },
  yunitTitleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  levelsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
  },
  levelCard: {
    marginHorizontal: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  levelBlackboard: {
    width: 220,
    height: 160,
    position: 'relative',
  },
  levelButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 220,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelLocked: {
    opacity: 0.5,
    filter: 'brightness(80%)',
  },
  levelText: {
    fontFamily: 'chalkboard',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  levelTextLocked: {
    color: '#bbb',
  },
  lockIcon: {
    width: 60,
    height: 60,
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 10,
    transform: [{ translateX: -30 }, { translateY: -30 }],
  },
  checkIcon: {
    width: 40,
    height: 40,
    position: 'absolute',
    top: '20%',
    right: '20%',
    zIndex: 10,
    transform: [{ translateX: 20 }, { translateY: -20 }],
  },
  noLevels: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 160,
    width: '100%',
    backgroundColor: 'transparent',
  },
  noLevelsText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '900',
  },
});

export default LevelSelection;