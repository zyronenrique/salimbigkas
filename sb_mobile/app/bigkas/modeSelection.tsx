import { memo, useState, useMemo, useCallback, useEffect } from "react";
import { StyleSheet, TouchableOpacity, Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import { isModeUnlocked } from "../../utils/helpers";
import { imageSrc } from "@/Icons/icons";
import { useBigkasContext } from "../../hooks/bigkasContext";
import { useBigkasLevels } from "@/hooks/useBigkasLevels";
import { useAuth } from "../../hooks/authContext";
import Characters from "../../components/Characters";
import { useRouter } from "expo-router";
import { doSetStartPlayingBigkas } from "@/api/functions";
import BigkasModal from "../modals/modal4All";
import BumalikBtn from "@/components/bumalikBtn";

const ModeSelection = memo(() => {
  const router = useRouter();
  const { currentUser, role, gradeLevel, gradeLevels } = useAuth();
  const { selectedLevel, selectedMode, setSelectedMode, setSelectedModePhrases, setBigkasResults } = useBigkasContext();
  const { state, updateState } = useBigkasLevels();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isModeCompleted, setIsModeCompleted] = useState(false);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  const onBack = useCallback(() => {
    router.replace('/bigkas/levelSelection');
  }, [router]);

  const modes = useMemo(() => [
    { 
      label: "Easy", 
      value: "easy", 
      stars: 1, 
      phrases: selectedLevel?.easy, 
      isUnlocked: true,  
      isCompleted: selectedLevel?.modeCompletions?.easy?.isCompleted || false
    },
    { 
      label: "Normal", 
      value: "normal", 
      stars: 2, 
      phrases: selectedLevel?.normal, 
      isUnlocked: isModeUnlocked("normal", selectedLevel?.modeCompletions), 
      isCompleted: selectedLevel?.modeCompletions?.normal?.isCompleted || false
    },
    { 
      label: "Hard", 
      value: "hard", 
      stars: 3, 
      phrases: selectedLevel?.hard, 
      isUnlocked: isModeUnlocked("hard", selectedLevel?.modeCompletions), 
      isCompleted: selectedLevel?.modeCompletions?.hard?.isCompleted || false
    },
  ], [selectedLevel]);

  const handleHoverStart = useCallback((idx: number, isUnlocked: boolean) => {
    if (isUnlocked) setHoveredIndex(idx);
  }, []);

  const handleHoverEnd = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModeCompleted(false);
    setSelectedMode('');
  }, []);

  const handleStartGame = useCallback(async (mode: string, phrases: any[], resetProgress: boolean = false) => {
    updateState({ isLoading: true });
    try {
      let progressId;
      if (selectedLevel.progressId) {
        progressId = selectedLevel.progressId;
      } else {
        const response = await doSetStartPlayingBigkas(
          currentUser?.uid || "", 
          selectedLevel?.id, 
          selectedLevel?.levelNumber, 
          mode
        ) as any;
        progressId = response?.id;
      }
      const modePhrases = {
        progressId,
        id: selectedLevel?.id,
        levelNumber: selectedLevel?.levelNumber,
        mode: mode,
        modePhrases: phrases,
        resetProgress,
      }
      setSelectedModePhrases(modePhrases);
      router.push(`/bigkas/playBigkas`);
    } catch (error) {
      // Show a toast here
      console.error("Error starting game:", error);
    } finally {
      updateState({ isLoading: false });
    }
  }, [selectedLevel, currentUser?.uid, role, gradeLevel, gradeLevels, router, updateState]);

  const handleShowPlayAgain = useCallback((mode: string) => {
    setSelectedMode(mode);
    setIsModeCompleted(true);
  }, []);
  
  const handleConfirmPlayAgain = useCallback(() => {
    if (selectedLevel && selectedMode) {
      const phrases = selectedLevel[selectedMode];
      handleStartGame(selectedMode, phrases, true);
      handleCloseModal();
    }
  }, [selectedLevel, selectedMode, handleStartGame]);

  const handleModeClick = useCallback((mode: any) => {
    if (!mode.isUnlocked || state.isLoading) return;
    if (mode.isCompleted) {
      handleShowPlayAgain(mode.value);
    } else {
      handleStartGame(mode.value, mode.phrases, false);
    }
  }, [state.isLoading, handleShowPlayAgain, handleStartGame]);

  const handlePlayAgain = useCallback((mode: any) => {
    if (!state.isLoading) {
      handleShowPlayAgain(mode.value);
    }
  }, [state.isLoading, handleShowPlayAgain]);

  const handleShowCompleted = useCallback(() => {
    setBigkasResults({
      bigkasId: selectedLevel?.id,
      levelNumber: selectedLevel?.levelNumber,
      mode: selectedMode,
    });
    router.navigate('/bigkas/gameCompleted');
  }, [selectedLevel, selectedMode, router]);

  return (
    <SafeAreaView style={styles.SafeAreaView}>
      <StatusBar style="dark" />
      <BumalikBtn onPress={onBack} size={24} />
      <Text style={styles.headerTitle}>Select Mode</Text>
      <View style={styles.levelsGrid}>
        {modes.map((mode, idx) => (
          <View key={mode.value} style={styles.levelCard}>
            <Image
              source={imageSrc.blackboardMode}
              style={[
                styles.levelBlackboard,
                !mode.isUnlocked ? styles.levelLocked : {},
                mode.isCompleted && hoveredIndex === idx ? styles.levelLocked : {},
              ]}
              resizeMode='contain'
            />
            <TouchableOpacity
              disabled={state.isLoading || !mode.isUnlocked}
              style={styles.levelButton}
              onPress={() => handleModeClick(mode)}
              onPressIn={() => handleHoverStart(idx, mode.isUnlocked)}
              onPressOut={handleHoverEnd}
            >
              <Text style={[
                styles.levelText,
                (!mode.isUnlocked || (mode.isCompleted && hoveredIndex === idx)) ? styles.levelTextLocked : {},
              ]}>
                {mode.label}
              </Text>
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                {Array.from({ length: mode.stars }, (_, starIdx) => (
                  <Image
                    key={starIdx}
                    source={imageSrc.star}
                    style={{
                      width: 32,
                      height: 32,
                      opacity: (mode.isCompleted && hoveredIndex === idx) || !mode.isUnlocked ? 0.3 : 1,
                      marginHorizontal: 2,
                    }}
                    resizeMode='contain'
                  />
                ))}
              </View>
              {!mode.isUnlocked && (
                <Image source={imageSrc.locked} style={styles.lockIcon} resizeMode='contain' />
              )}
              {mode.isCompleted && (
                <Image source={imageSrc.check} style={styles.checkIcon} resizeMode='contain' />
              )}
            </TouchableOpacity>
            {mode.isCompleted && mode.isUnlocked && hoveredIndex === idx && (
              <View style={styles.playAgainOverlay}>
                <TouchableOpacity
                  disabled={state.isLoading}
                  onPress={() => handlePlayAgain(mode)}
                  style={styles.playAgainButton}
                >
                  <Image source={imageSrc.settings} style={{ width: 60, height: 60 }} resizeMode='contain' />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>
      <Characters />
      {isModeCompleted && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 20 }}>
          <BigkasModal
            type="playAgain" 
            isOpen={isModeCompleted} 
            onClose={handleCloseModal}  
            onConfirm={handleConfirmPlayAgain}
            onLeaderboard={handleShowCompleted}
          />
      </View>
      )}
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  SafeAreaView: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FFA600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'right',
    paddingRight: 10,
  },
  trophyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  levelsGrid: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
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
    opacity: 0.5,
  },
  lockIcon: {
    width: 40,
    height: 40,
    position: 'absolute',
    top: '50%',
    right: '50%',
    zIndex: 10,
    transform: [{ translateX: 20 }, { translateY: -20 }],
  },
  checkIcon: {
    width: 40,
    height: 40,
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  playAgainOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 220,
    height: 160,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  playAgainButton: {
    padding: 8,
    backgroundColor: 'transparent',
    borderRadius: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#208ec5',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#27A6E5',
    borderRadius: 12,
    marginHorizontal: 8,
  },
});

export default ModeSelection;