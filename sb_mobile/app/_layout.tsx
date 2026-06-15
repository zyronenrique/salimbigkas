import { useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import '../index.css';
import { AuthProvider } from '@/hooks/authContext';
import { useColorScheme } from '@/components/useColorScheme';
import { ClassProvider } from '@/hooks/classContext';
import { BigkasProvider } from '@/hooks/bigkasContext';
import { QuizProvider } from '@/hooks/quizContext';
import { StatusBar } from 'expo-status-bar';
import { LogRegProvider, useLogRegContext } from '@/hooks/logRegContext';
import { loadingDot } from '@/Icons/icons';
import ToastManager from 'toastify-react-native'
import CustomToast from './Toast/CustomToast';
import { PaperProvider } from 'react-native-paper';
import { SeatworkProvider } from '@/hooks/seatworkContext';
import { MusicProvider } from '@/hooks/musicPlayer';
import AppMusicController from '@/hooks/appMusicController';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { CopilotProvider } from "react-native-copilot";
import CopilotCustomTooltip from '@/components/CopilotCustomTooltip';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

(globalThis as any).RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SchoolBell: require('../assets/fonts/Schoolbell-Regular.ttf'),
    SourceSans3: require('../assets/fonts/SourceSans3-Regular.ttf'),
    SourceSans2Bold: require('../assets/fonts/SourceSans3-ExtraBold.ttf'),
    ChalkBoard: require('../assets/fonts/ChalkBoard.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
    });
  }, []);

  if (!loaded && !error) {
    return loadingDot();
  }

  const style = {
    backgroundColor: "transparent",
    borderRadius: 10,
  };

  return (
    <CopilotProvider
      animated
      overlay="svg"
      margin={0}
      animationDuration={400}
      verticalOffset={20}
      arrowColor="#8a3903"
      tooltipStyle={style}
      tooltipComponent={CopilotCustomTooltip}
      labels={{
        skip: "Itigil",
        previous: "Bumalik",
        next: "Susunod",
        finish: "Tapos"
      }}
      backdropColor="rgba(0, 0, 0, 0.7)"
      androidStatusBarVisible={false}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="light" />
        <MusicProvider>
          <AppMusicController />
            <PaperProvider>
              <AuthProvider>
                <LogRegProvider>
                  <ClassProvider>
                    <BigkasProvider>
                      <SeatworkProvider>
                        <QuizProvider>
                          <RootLayoutNav />
                        </QuizProvider>
                      </SeatworkProvider>
                    </BigkasProvider>
                  </ClassProvider>
                </LogRegProvider>
              </AuthProvider>
            </PaperProvider>
        </MusicProvider>
      </GestureHandlerRootView>
    </CopilotProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { icon } =  useLogRegContext();
  const toastConfig = {
    custom: (props: any) => <CustomToast {...props} icon={icon} />,
  }
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName='index' screenOptions={{headerShown: false}}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="signInWithEmailPassword/emailPage" options={{ headerShown: false }} />
        <Stack.Screen name="signInWithEmailPassword/verifyEmailPage" options={{ headerShown: false }} />
        <Stack.Screen name="signInWithEmailPassword/passwordPage" options={{ headerShown: false }} />
        <Stack.Screen name="signInWithEmailPassword/forgotPasswordPage" options={{ headerShown: false }} />
        <Stack.Screen name="signInWithEmailPassword/namePage" options={{ headerShown: false }} />
        <Stack.Screen name="signInWithEmailPassword/rolePage" options={{ headerShown: false }} />
        <Stack.Screen name="signInWithEmailPassword/gradeLevelPage" options={{ headerShown: false }} />
        <Stack.Screen name="signInWithEmailPassword/restrictedPage" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="notification" options={{ headerShown: false }} />
        <Stack.Screen name="lessons/yunitLessons" options={{ headerShown: false }} />
        <Stack.Screen name="lessons/lesson" options={{ headerShown: false }} />
        <Stack.Screen name="lessons/modal" options={{ headerShown: false }} />
        <Stack.Screen name="lessons/lessonFiles" options={{ headerShown: false }} />
        <Stack.Screen name="lessons/videoScreen" options={{ headerShown: false }} />
        <Stack.Screen name="bigkas/levelSelection" options={{ headerShown: false }} />
        <Stack.Screen name="bigkas/modeSelection" options={{ headerShown: false }} />
        <Stack.Screen name="bigkas/playBigkas" options={{ headerShown: false }} />
        <Stack.Screen name="bigkas/gameCompleted" options={{ headerShown: false }} />
        <Stack.Screen name="badges" options={{ headerShown: false }} />
        <Stack.Screen name="seatwork/Seatworks" options={{ headerShown: false }} />
        <Stack.Screen name="quiz/Quizzes" options={{ headerShown: false }} />
        <Stack.Screen name="TakeSeatworkQuiz" options={{ headerShown: false }} />
        <Stack.Screen name="results" options={{ headerShown: false }} />
        <Stack.Screen name="leaderboardSelection" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="legal" options={{ headerShown: false }} />
        <Stack.Screen name="profile/viewProfile" options={{ headerShown: false }} />
        <Stack.Screen name="profile/reauthenticatePage" options={{ headerShown: false }} />
        <Stack.Screen name="profile/changeEmailPage" options={{ headerShown: false }} />
        <Stack.Screen name="profile/changePasswordPage" options={{ headerShown: false }} />
      </Stack>
      <ToastManager 
        config={toastConfig}
        position='center'
        showProgressBar={true}
      />
    </ThemeProvider>
  );
}
