import { memo } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { imageSrc } from '../../Icons/icons';
import { getNumberImages } from '../../utils/helpers';
import { CopilotStep, walkthroughable } from 'react-native-copilot';

interface GameSidebarProps {
  timer: number;
  maxTime: number;
  currentPhrase: number;
  totalPhrases: number;
  paused: boolean;
  onPause: () => void;
  onResume: () => void;
}

const WalkthroughableView = walkthroughable(View);
const WalkthroughableText = walkthroughable(Text);

const GameSidebar = memo(({ timer, maxTime, currentPhrase, totalPhrases, paused, onPause, onResume }: GameSidebarProps) => {
  const timerPercent = (timer / maxTime) * 100;

  const renderNumberImages = (num: number, size = 50) => (
    getNumberImages(num)?.map((img, idx) => (
      <Image key={idx} source={img} style={{ height: size, width: size * 0.7 }} resizeMode='contain' />
    ))
  );

  return (
    <WalkthroughableView style={styles.root}>
      <View style={styles.pauseButtonContainer}>
        <TouchableOpacity
          style={styles.pauseButton}
          onPress={paused ? onResume : onPause}
          accessibilityLabel="Pause Game"
        >
          <Image
            source={paused ? imageSrc.play : imageSrc.pause}
            style={styles.pauseIcon}
            resizeMode='contain'
          />
        </TouchableOpacity>
      </View>
      <View style={styles.timerContainer}>
        <View style={[styles.timerBar, { height: `${timerPercent}%` }]} />
        <CopilotStep
          name="sidebar-timer"
          order={1}
          text="Heto ang timer! Subukan mong tapusin ang parirala bago ito mag-timeout. Kayang-kaya mo ’yan!"
        >
          <WalkthroughableText style={styles.timerText}>{timer}</WalkthroughableText>
        </CopilotStep>
      </View>
      <CopilotStep
        name="sidebar-phrase-progress"
        order={2}
        text="Dito mo makikita ang iyong progreso!"
      >
        <WalkthroughableView style={styles.phraseContainer}>
          <WalkthroughableText style={styles.phraseLabel}>Parirala</WalkthroughableText>
          <WalkthroughableView style={styles.phraseRow}>
            {renderNumberImages(currentPhrase, 40)}
            <Image source={imageSrc.slash} style={styles.slashIcon} resizeMode='contain' />
            {renderNumberImages(totalPhrases, 40)}
          </WalkthroughableView>
        </WalkthroughableView>
      </CopilotStep>
    </WalkthroughableView>
  );
});

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    width: 100,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  pauseButtonContainer: {
    paddingTop: 24,
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  pauseIcon: {
    height: 40,
    width: 40,
  },
  pauseText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  timerContainer: {
    flex: 1,
    width: 60,
    backgroundColor: '#003311',
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#8a3903',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    overflow: 'hidden',
    marginVertical: 12,
  },
  timerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    backgroundColor: '#11c26b',
    zIndex: 1,
  },
  timerText: {
    position: 'relative',
    zIndex: 2,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  phraseContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
  },
  phraseLabel: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  phraseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  slashIcon: {
    height: 40,
    width: 20,
    marginHorizontal: 4,
  },
});

export default GameSidebar;