import { useCallback, useLayoutEffect } from 'react';
import { StyleSheet, TouchableOpacity, Image, View, ActivityIndicator, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { imageSrc } from '@/Icons/icons';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import QuizModal from '../modals/modal4All';
import { useQuizzesState } from '@/hooks/useQuizzesState';
import { ProtectedScreen } from '@/routes/ProtectedScreen';
import BumalikBtn from '@/components/bumalikBtn';
import PlayBtn from '@/components/playBtn';
import Svg, { Path } from 'react-native-svg';

export default function TabFiveScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { state, updateState } = useQuizzesState();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  
  useLayoutEffect(() => {
    navigation.setOptions({
      tabBarStyle: { display: 'none' },
    });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      return undefined;
    }, [])
  );

  return (
    <ProtectedScreen requireVerifiedEmail={true}>
      <SafeAreaView style={styles.SafeAreaView}>
        <StatusBar style="dark" />
        <TouchableOpacity
          style={styles.modalButton}
          onPress={() => updateState({ isModalOpen: true })}
        >
          <Image source={imageSrc.gameInfo} style={{ width: 50, height: 50 }} resizeMode='contain' />
        </TouchableOpacity>
        <BumalikBtn 
          onPress={() => {
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).then(() => {
              router.back();
            });
          }}
          size={24} 
        />
        {state.isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}>
            <ActivityIndicator size="large" color="#2C3E50" />
          </View>
        ):(
          <>
            <View style={[styles.container, { width: SCREEN_WIDTH - 12, height: SCREEN_HEIGHT }]}>
              <View style={styles.imageButtonContainer}>
                <View style={styles.imageWrapper}>
                  <Image
                    source={imageSrc.quiz}
                    style={styles.quizImage}
                    resizeMode='contain'
                  />
                  <PlayBtn disabled={state.isLoading} onPress={() => router.navigate('/quiz/Quizzes')} />
                </View>
              </View>
            </View>
            <Svg viewBox="0 0 1440 320" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 195, zIndex: 0 }}>
              <Path fill="#2C3E50" fillOpacity="1" d="M0,64L24,101.3C48,139,96,213,144,213.3C192,213,240,139,288,101.3C336,64,384,64,432,96C480,128,528,192,576,224C624,256,672,256,720,213.3C768,171,816,85,864,53.3C912,21,960,43,1008,69.3C1056,96,1104,128,1152,154.7C1200,181,1248,203,1296,192C1344,181,1392,139,1416,117.3L1440,96L1440,320L1416,320C1392,320,1344,320,1296,320C1248,320,1200,320,1152,320C1104,320,1056,320,1008,320C960,320,912,320,864,320C816,320,768,320,720,320C672,320,624,320,576,320C528,320,480,320,432,320C384,320,336,320,288,320C240,320,192,320,144,320C96,320,48,320,24,320L0,320Z"></Path>
            </Svg>
          </>
        )}
      </SafeAreaView>
      {state.isModalOpen && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 20 }}>
          <QuizModal
            type='quizInfo'
            isOpen={state.isModalOpen}
            onClose={() => updateState({ isModalOpen: false })}
          />
        </View>
      )}
    </ProtectedScreen>
  );
}

const styles = StyleSheet.create({
  SafeAreaView: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FFA600',
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
    left: 20,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
    zIndex: 10,
  },
  imageButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  imageWrapper: {
    position: 'relative',
    width: 500,
    height: 500,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  quizImage: {
    width: 500,
    height: 500,
    resizeMode: 'contain',
  },
});