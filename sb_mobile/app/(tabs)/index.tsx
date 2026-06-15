import { Text, View, ScrollView, Image, ActivityIndicator, RefreshControl, useWindowDimensions, BackHandler } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/authContext';
import { imageSrc } from '@/Icons/icons';
import { useLessonsState } from '@/hooks/useLessonsState';
import { useClassContext } from '@/hooks/classContext';
import { useQuizContext } from '@/hooks/quizContext';
import { useQuizzesState } from '@/hooks/useQuizzesState';
import { formatUserDate } from '@/utils/helpers';
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { doGetClassNameById } from '@/api/functions';
import { StatusBar } from 'expo-status-bar';
import { ProtectedScreen } from '@/routes/ProtectedScreen';
import DialogComponent from '@/components/dialogComponent';

export default function TabOneScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { currentUser, classId } = useAuth();
  const { state: LessonState, refreshOpenLessons } = useLessonsState();
  const { setSelectedLesson, setClassName, setLastViewedLesson, lastViewedLesson } = useClassContext();
  const { setSelectedQuiz } = useQuizContext();
  const { state: QuizState, lessons, nextQuiz, refreshQuizzes } = useQuizzesState();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  useFocusEffect(
    useCallback(() => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      return undefined;
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        showDialog();
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => {
        subscription.remove();
      };
    }, [])
  );

  useEffect(() => {
    const fetchClassName = async () => {
      if (classId) {
        const response = await doGetClassNameById(classId) as any;
        setClassName(response?.className);
      }
    };
    fetchClassName();
  }, [classId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshOpenLessons();
    await refreshQuizzes();
    setRefreshing(false);
  };

  return (
    <ProtectedScreen requireVerifiedEmail={true}>
      <SafeAreaView style={{
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#2C3E50',
      }}>
        <StatusBar style="light" />
        <Image
          source={imageSrc.lessonbg}
          style={{ position: 'absolute', opacity: 0.3, width: width, height: height, left: 0 }}
          resizeMode='stretch'
        />
        {(LessonState.isLoading && QuizState.isLoading) ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#FFA600" />
          </View>
        ) : (
          <ScrollView
            style={{ paddingVertical: 20 }}
            contentContainerStyle={{ paddingBottom: 140 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#2C3E50']}
                tintColor="#2C3E50"
              />
            }
          >
            <View style={{
              position: 'relative',
              display: 'flex',
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              paddingHorizontal: 20,
            }}>
              <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 }}>
                <Text  style={{
                  fontSize: 24,
                  lineHeight: 32,
                  fontWeight: '900',
                  fontFamily: 'ChalkBoard',
                  color: '#fff',
                }}>Kumusta, {currentUser?.displayName?.split(' ')[0]}!</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity 
                  onPress={() => router.navigate('/leaderboardSelection')}
                >
                  <Image source={imageSrc.leaderboard} style={{
                    width: 40,
                    height: 40,
                    resizeMode: 'contain',
                  }} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => router.navigate('/notification')}
                >
                  <Image source={imageSrc.bell} style={{
                    width: 40,
                    height: 40,
                    resizeMode: 'contain',
                  }} />
                </TouchableOpacity>
              </View>
            </View>
            {/* Aking Aralin */}
            {LessonState.openLessons.length > 0 && (
              <Text style={{
                fontSize: 18,
                lineHeight: 24,
                fontWeight: '900',
                textAlign: 'center',
                marginBottom: 4,
                color: '#fff',
              }}>Iyong Aralin</Text>
            )}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                marginBottom: 5,
              }}
              contentContainerStyle={[{ flex: LessonState.openLessons.length > 0 ? 0 : 1, paddingRight: 16, alignItems: 'center', justifyContent: 'center' }]}
            >
              {LessonState.openLessons.length > 0 ? (
                LessonState.openLessons.map((lesson: any, idx: number) => (
                  <TouchableOpacity
                    key={lesson.id || idx}
                    style={{ 
                      width: 200,
                      height: 120,
                      display: 'flex',
                      backgroundColor: '#fff',
                      borderRadius: 16,
                      marginRight: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      elevation: 8,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.25,
                      shadowRadius: 8,
                      overflow: 'hidden',
                    }}
                    onPress={() => {
                      setSelectedLesson(lesson);
                      setLastViewedLesson(lesson);
                      router.navigate('/lessons/modal');
                    }}
                  >
                    <View style={{ flexDirection: 'row', flex: 1, width: '100%', padding: 12, gap: 12, backgroundColor: '#FFA600' }}>
                      <Image source={imageSrc.book} style={{ width: 40, height: 40 }} resizeMode='contain' />
                      <Text className='line-clamp-2' style={{
                        width: '70%',
                        fontSize: 14,
                        lineHeight: 20,
                        fontWeight: '900',
                        color: '#2C3E50',
                      }}>
                        Aralin {lesson.aralinNumero} - {lesson.aralinPamagat}
                      </Text>
                    </View>
                    <Text numberOfLines={2} style={{
                      flex: 1,
                      fontWeight: '500',
                      padding: 12,
                      fontSize: 12,
                      lineHeight: 15,
                      color: '#333',
                    }}>
                      {lesson.aralinPaglalarawan || "Walang deskripsyon"}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
                  <Text style={{ fontSize: 20, lineHeight: 32, fontWeight: 'bold', fontStyle: 'italic', color: '#ddd' }}>Walang pang binuksang aralin.</Text>
                </View>
              )}
            </ScrollView>
            <View style={{ paddingHorizontal: 20 }}>
              <TouchableOpacity 
                style={{
                  backgroundColor: '#FFA600',
                  borderRadius: 14,
                  paddingVertical: 20,
                  paddingHorizontal: 20,
                  alignItems: 'center',
                  marginVertical: 10,
                  elevation: 5,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  overflow: 'hidden',
                }}
                onPress={() => {
                  if (lastViewedLesson) {
                    setSelectedLesson(lastViewedLesson);
                    router.navigate('/lessons/modal');
                  } else {
                    router.navigate('/(tabs)/two');
                  }
                }}
              >
                <Image source={imageSrc.bookgirl} style={{ position: 'absolute', left: 0, bottom: 0, width: 40, height: 50 }} resizeMode='contain' />
                <Text style={{
                  color: '#2C3E50',
                  fontWeight: 'bold',
                  fontSize: lastViewedLesson ? 20 : 24,
                }}>{lastViewedLesson ? "Ipagpatuloy ang pag-aaral" : "Simulan ang pag-aaral"}</Text>
                <Image source={imageSrc.colorboy} style={{ position: 'absolute', right: 0, bottom: 0, width: 50, height: 40 }} resizeMode='contain' />
              </TouchableOpacity>
              {lessons.length > 0 && nextQuiz ? (
                <>
                  <Text style={{
                    fontWeight: '900',
                    fontSize: 16,
                    lineHeight: 24,
                    textAlign: 'center',
                    marginTop: 8,
                    color: '#fff',
                  }}>Susunod na Pagsusulit</Text>
                  <TouchableOpacity style={{
                    position: 'relative',
                    flexDirection: 'row',
                    backgroundColor: '#FFA600',
                    borderRadius: 16,
                    paddingVertical: 16,
                    marginTop: 8,
                    elevation: 4,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    overflow: 'hidden',
                  }}
                    onPress={() => {
                      setSelectedQuiz(nextQuiz?.quiz);
                      router.navigate('/TakeSeatworkQuiz');
                      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                        <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderTopRightRadius: 8, borderBottomRightRadius: 8, paddingVertical: 6, paddingHorizontal: 12, alignItems: 'center', marginRight: 8 }}>
                          <MaterialIcons name="date-range" size={24} color="#2C3E50" style={{ marginRight: 8 }} />
                          <Text style={{ color: '#2C3E50', fontWeight: '900', fontSize: 14, marginRight: 8 }}>
                            {formatUserDate(nextQuiz.quiz.createdAt)}
                          </Text>
                        </View>
                        <View style={{ backgroundColor: '#dcfce7', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 }}>
                          <Text style={{ color: '#16a34a', fontWeight: '900', fontSize: 14 }}>Na-unlock</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 30, alignItems: 'center', gap: 8 }}>
                        <Text style={{ color: '#2C3E50', fontSize: 16, fontWeight: '600' }}>Pamagat: </Text>
                        <Text style={{ color: '#2C3E50', fontSize: 24, fontWeight: '900' }} numberOfLines={2}>{nextQuiz.quiz.category}</Text>
                      </View>
                    </View>
                    <View style={{ position: 'absolute', right: 65, top: 65, alignItems: 'center' }} >
                      <Text style={{ color: '#2C3E50', fontSize: 16, fontWeight: '900' }}>Simulan</Text>
                    </View>
                    <Image source={imageSrc.aiQuizPeeking} style={{ position: 'absolute', right: -19, bottom: 5, width: 100, height: 100 }} resizeMode='contain' />
                  </TouchableOpacity>
                </>
              ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
                  <Text style={{ fontSize: 24, lineHeight: 32, fontWeight: 'bold', fontStyle: 'italic', color: '#ddd' }}>Walang na-unlock na pagsusulit.</Text>
                </View>
              )}
              <View style={{ marginTop: 20, alignItems: 'center', justifyContent: 'center' }}>
                <Image source={imageSrc.lesson} style={{ width: '100%', height: 250, alignSelf: 'center'}} resizeMode='contain' />
              </View>
            </View>
          </ScrollView>
        )}
        <DialogComponent
          icon="alert"
          title="Confirm Exit"
          content="Are you sure you want to exit the app?"
          visible={visible}
          hideDialog={hideDialog}
          handleConfirm={() => BackHandler.exitApp()}
        />
      </SafeAreaView>
    </ProtectedScreen>
  );
}

