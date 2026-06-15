import { memo, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from '@/components/Themed';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useSeatworksState } from "../../hooks/useSeatworksState";
import { imageSrc } from "../../Icons/icons";
import Characters from "../../components/Characters";
import { useSeatworkContext } from "../../hooks/seatworkContext";
import { useRouter } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { useClassContext } from '@/hooks/classContext';
import BumalikBtn from '@/components/bumalikBtn';
import { LessonText, YunitText } from '@/components/customText';

const Seatworks = memo(() => {
  const router = useRouter();
  const { setSelectedSeatwork, setResults } = useSeatworkContext();
  const { setMode } = useClassContext();
  const [refreshing, setRefreshing] = useState(false);
  const { 
    state,
    lessons,
    canGoPrevYunit, 
    canGoNextYunit, 
    canGoPrevLesson, 
    canGoNextLesson,
    handlePrevYunit,
    handleNextYunit,
    handlePrevSeatworks,
    handleNextSeatworks,
    refreshSeatworks,
  } = useSeatworksState();

  const currentYunit = state.seatworksByYunit[state.selectedYunitIndex];
  const currentLesson = lessons[state.selectedLessonIndex];

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);
  
  const panGesture = Gesture.Pan()
    .onEnd((event) => {
      if (event.translationX > 50 && canGoPrevLesson) {
        runOnJS(handlePrevSeatworks)();
      } else if (event.translationX < -50 && canGoNextLesson) {
        runOnJS(handleNextSeatworks)();
      }
    });

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshSeatworks();
    setRefreshing(false);
  };

  const handleSeatworksSelect = (seatwork: any) => {
    setMode('seatwork');
    setSelectedSeatwork(seatwork);
    router.push('/TakeSeatworkQuiz');
  };

  const handleSeatworkResult = (seatwork: any) => {
    setMode('seatwork');
    setSelectedSeatwork(seatwork);
    setResults(seatwork.response);
    router.push(`/results`);
  };

  return (
    <SafeAreaView style={styles.SafeAreaView}>
      <StatusBar style="dark" />
      <BumalikBtn onPress={() => router.push('/(tabs)/four')} size={24} />
      {!state.isLoading && (
        currentYunit?.yunitNumber && (
          <View style={styles.yunitContainer}>
            <TouchableOpacity
              disabled={!canGoPrevYunit}
              style={styles.yunitPrevButton}
              onPress={handlePrevYunit}
            >
              <Image source={imageSrc.lessThan} style={{ width: 35, height: 35 }} resizeMode='contain' />
            </TouchableOpacity>
            <YunitText yunitNumber={currentYunit.yunitNumber} />
            <TouchableOpacity
              disabled={!canGoNextYunit}
              style={styles.yunitNextButton}
              onPress={handleNextYunit}
            >
              <Image source={imageSrc.greaterThan} style={{ width: 35, height: 35 }} resizeMode='contain' />
            </TouchableOpacity>
          </View>
        )
      )}
      {currentLesson?.seatworks?.length > 0 && <Text style={styles.headerTitle}>Pumili ng Gawain</Text>}
      {state.isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}>
          <ActivityIndicator size="large" color="#2C3E50" />
        </View>
      ):(
        <ScrollView
          style={styles.scrollView}
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
          {currentLesson?.seatworks && currentLesson.seatworks.length > 0 && (
            <View style={styles.lessonContainer}>
              <LessonText lessonNumber={currentLesson.lessonNumber} />
            </View>
          )}
          <GestureDetector gesture={panGesture}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.seatworksGrid}
            >
              {currentLesson?.seatworks && currentLesson.seatworks.length > 0 && <Image source={imageSrc.lessThan} style={{ width: 28, height: 28 }} resizeMode='contain' />}
              {currentLesson?.seatworks && currentLesson.seatworks.length > 0 ? (
                currentLesson?.seatworks?.map((seatwork: any, index: number) => {
                  const unlocked = currentLesson.isUnlocked && (index === 0 || currentLesson.seatworks[index - 1]?.response);
                  return (
                    <View key={index} style={styles.seatworkCard}>
                      <Image
                        source={imageSrc.blackboardLevel}
                        style={[styles.seatworkBlackboard, !unlocked && styles.seatworkLocked]}
                        resizeMode='contain'
                      />
                      <TouchableOpacity
                        disabled={!unlocked}
                        style={[
                          styles.seatworkButton,
                        ]}
                        onPress={
                          unlocked && !seatwork.response
                            ? () => handleSeatworksSelect(seatwork)
                            : seatwork.response
                            ? () => handleSeatworkResult(seatwork)
                            : undefined
                          }
                      >
                        <Text style={[styles.seatworkText, !unlocked && styles.seatworkTextLocked]}>
                          {seatwork.category}
                        </Text>
                        {!unlocked && (
                          <Image source={imageSrc.locked} style={styles.lockIcon} resizeMode='contain' />
                        )}
                        {seatwork.response && (
                          <Image source={imageSrc.check} style={styles.checkIcon} resizeMode='contain' />
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })
              ) : (
                <View style={styles.noSeatworks}>
                  <Text style={styles.noSeatworksText}>Walang nakuhang gawain</Text>
                </View>
              )}
              {currentLesson?.seatworks && currentLesson.seatworks.length > 0 && <Image source={imageSrc.greaterThan} style={{ width: 28, height: 28 }} resizeMode='contain' />}
            </ScrollView>
          </GestureDetector>
        </ScrollView>
      )}
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
    height: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  headerTitle: {
    position: 'absolute',
    zIndex: 10,
    top: 30,
    right: 20,
    fontSize: 20,
    fontWeight: 'bold',
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
  lessonContainer: {
    position: 'absolute',
    zIndex: 10,
    top: '15%',
    left: '50%',
    transform: [{ translateX: -80 }],
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  yunitPrevButton: {
    display: 'flex',
    position: 'relative',
    zIndex: 1,
  },
  yunitNextButton: {
    display: 'flex',
    position: 'relative',
    zIndex: 1,
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  seatworksGrid: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  seatworkCard: {
    marginHorizontal: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  seatworkBlackboard: {
    width: 220,
    height: 160,
    position: 'relative',
  },
  seatworkButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 220,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatworkLocked: {
    opacity: 0.5,
    filter: 'brightness(80%)',
  },
  seatworkText: {
    fontFamily: 'chalkboard',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  seatworkTextLocked: {
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
  noSeatworks: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 160,
    width: '100%',
    backgroundColor: 'transparent',
  },
  noSeatworksText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '900',
  },
});

export default Seatworks;
