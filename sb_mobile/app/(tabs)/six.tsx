import { TouchableOpacity, View, Text, ScrollView, Image, ActivityIndicator, RefreshControl, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/authContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLessonsState } from '@/hooks/useLessonsState';
import { useClassContext } from '@/hooks/classContext';
import { imageSrc } from '@/Icons/icons';
import { formatUserDate, getLatestCompletedQuiz } from '@/utils/helpers';
import { useQuizzesState } from '@/hooks/useQuizzesState';
import { useCallback, useMemo, useState } from 'react';
import { useQuizContext } from '@/hooks/quizContext';
import { ProtectedScreen } from '@/routes/ProtectedScreen';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

export default function TabSixScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { currentUser, role, gradeLevel } = useAuth();
  const { state, getAIRecommendations } = useLessonsState();
  const { state: QuizState, refreshQuizzes } = useQuizzesState();
  const { setSelectedLesson, setLastViewedLesson, className, lastViewedLesson } = useClassContext();
  const { setResults } = useQuizContext();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      return undefined;
    }, [])
  );
  
  const allQuizzes = useMemo(() => QuizState.quizzesByYunit
    .flatMap(yunit => yunit.lessons)
    .flatMap(lesson => lesson.quizzes), [QuizState.quizzesByYunit]);

  const latestQuiz = getLatestCompletedQuiz(allQuizzes);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshQuizzes();
    await getAIRecommendations();
    setRefreshing(false);
  };

  return (
    <ProtectedScreen requireVerifiedEmail={true}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', backgroundColor: '#2C3E50' }}>
        <Image
          source={imageSrc.lessonbg}
          style={{ position: 'absolute', opacity: 0.3, width: width, height: height, left: 0 }}
          resizeMode='stretch'
        />
        <ScrollView
          style={{ paddingVertical: 20, marginBottom: 40 }}
          contentContainerStyle={{ paddingBottom: 40 }}
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
          {/* Profile Section */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingHorizontal: 16 }}>
            <Image
              source={currentUser?.photoURL ? { uri: currentUser.photoURL } : imageSrc.man}
              style={{ width: 64, height: 64, borderRadius: 32, marginRight: 16, backgroundColor: '#fff' }}
              resizeMode="contain"
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
              <View style={{ flexDirection: 'column' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ fontWeight: '900', fontSize: 24, color: '#fff' }} numberOfLines={1}>{currentUser?.displayName}</Text>
                  <Text style={{ backgroundColor: '#FFA600', color: '#2C3E50', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, fontSize: 16, fontWeight: '900', marginLeft: 8 }}>{role}</Text>
                </View>
                <Text style={{ color: '#eee', fontSize: 18, fontWeight: '600', marginBottom: 2 }}>{gradeLevel}</Text>
                <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 }}>
                  <Text style={{ color: '#eee', fontSize: 16, fontWeight: '900', textAlign: 'center' }}>{className ? `Class ${className}` : "No class"}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => router.navigate('/settings')} style={{ padding: 8 }}>
                <Ionicons name="settings-outline" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          {/* Completed Lessons */}
          <View style={{ flex: 1, paddingHorizontal: 16, marginBottom: 12 }}>
            {lastViewedLesson ? (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontWeight: '900', fontSize: 18, color: '#fff', textAlign: 'center' }}>
                  Huling binisitang aralin <Text style={{ fontWeight: 'normal', fontSize: 16, color: '#eee' }}>(Pinakabago)</Text>
                </Text>
                <TouchableOpacity 
                  style={{
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
                    setSelectedLesson(lastViewedLesson);
                    setLastViewedLesson(lastViewedLesson);
                    router.navigate('/lessons/modal');
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                      <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderTopRightRadius: 12, borderBottomRightRadius: 8, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center', marginRight: 8 }}>
                        <Ionicons name="checkmark-circle" size={24} color="#2C3E50" style={{ marginRight: 8 }} />
                        <Text style={{ color: '#2C3E50', fontWeight: '900', fontSize: 14, marginRight: 8 }}>
                          {formatUserDate(lastViewedLesson?.createdAt)}
                        </Text>
                      </View>
                      <View style={{ backgroundColor: '#dcfce7', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 }}>
                        <Text style={{ color: '#16a34a', fontSize: 14, fontWeight: '900' }}>Binuksan</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 30, alignItems: 'center', gap: 8 }}>
                      <Text style={{ color: '#2C3E50', fontSize: 14, fontWeight: '600' }}>Pamagat: </Text>
                      <Text style={{ width: '40%', color: '#2C3E50', fontSize: 16, fontWeight: '900' }} numberOfLines={1}>{lastViewedLesson?.aralinPamagat}</Text>
                    </View>
                  </View>
                  <View style={{ position: 'absolute', right: 65, top: 65, alignItems: 'center' }}>
                    <Text style={{ color: '#2C3E50', fontSize: 16, fontWeight: '900' }}>Tingnan</Text>
                  </View>
                  <Image source={imageSrc.aiQuizPeeking} style={{ position: 'absolute', right: -19, bottom: 5, width: 100, height: 100 }} resizeMode='contain' />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 12 }}>
                <Text style={{ fontSize: 24, lineHeight: 32, fontWeight: 'bold', fontStyle: 'italic', color: '#ddd' }}>Wala pang binisitang aralin.</Text>
              </View>
            )}
            {/* Completed Quizzes */}
            {latestQuiz ? (
              <>
                <Text style={{ fontWeight: '900', fontSize: 18, color: '#fff', textAlign: 'center' }}>
                  Natapos na pagsusulit <Text style={{ fontWeight: 'normal', fontSize: 16, color: '#eee' }}>(Pinakabago)</Text>
                </Text>
                <TouchableOpacity 
                  style={{
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
                    setResults(latestQuiz.response);
                    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
                    router.navigate(`/results`);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                      <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderTopRightRadius: 8, borderBottomRightRadius: 8, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center', marginRight: 8 }}>
                        <Ionicons name="checkmark-circle" size={24} color="#2C3E50" style={{ marginRight: 8 }} />
                        <Text style={{ color: '#2C3E50', fontWeight: '900', fontSize: 14, marginRight: 8 }}>
                          {formatUserDate(latestQuiz.response?.submittedAt || "")}
                        </Text>
                      </View>
                      <View style={{ backgroundColor: '#dcfce7', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 }}>
                        <Text style={{ color: '#16a34a', fontSize: 14, fontWeight: '900' }}>Natapos</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 30, alignItems: 'center', gap: 8 }}>
                      <Text style={{ color: '#2C3E50', fontSize: 18, fontWeight: '600' }}>Pamagat: </Text>
                      <Text style={{ color: '#2C3E50', fontSize: 24, fontWeight: '900' }} numberOfLines={2}>{latestQuiz.category}</Text>
                    </View>
                  </View>
                  <View style={{ position: 'absolute', right: 65, top: 65, alignItems: 'center' }}>
                    <Text style={{ color: '#2C3E50', fontSize: 16, fontWeight: '900' }}>Tingnan</Text>
                  </View>
                  <Image source={imageSrc.aiQuizPeeking} style={{ position: 'absolute', right: -19, bottom: 5, width: 100, height: 100 }} resizeMode='contain' />
                </TouchableOpacity>
              </>
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 12 }}>
                <Text style={{ fontSize: 24, lineHeight: 32, fontWeight: 'bold', fontStyle: 'italic', color: '#ddd' }}>Wala pang natapos na pagsusulit.</Text>
              </View>
            )}
          </View>
          {/* Recommendations */}
          <Text style={{ fontWeight: '900', fontSize: 18, marginTop: 10, paddingHorizontal: 16, color: '#fff', textAlign: 'center' }}>Ini-rerekomenda</Text>
          {state.isLoading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="large" color="#FFA600" />
            </View>
          ):(
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={{ marginBottom: 8, paddingHorizontal: 16, paddingVertical: 8 }}
              contentContainerStyle={{ paddingRight: 16, alignItems: 'center', justifyContent: 'center' }}
            >
              {state.recommendations.map((lesson, idx) => (
                <TouchableOpacity
                  key={lesson.id || idx}
                  style={{ 
                    width: 200,
                    height: 200,
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
                    router.navigate('/lessons/modal');
                  }}
                >
                  <View style={{ flexDirection: 'row', flex: 1, width: '100%', alignItems: 'center', padding: 12, gap: 12, backgroundColor: '#FFA600' }}>
                    <Image source={imageSrc.book} style={{ width: 40, height: 40 }} resizeMode='contain'/>
                    <Text numberOfLines={3} style={{
                      width: '70%',
                      fontSize: 14,
                      lineHeight: 20,
                      fontWeight: 'bold',
                      color: '#2C3E50',
                    }}>
                      Aralin {lesson.aralinNumero} - {lesson.aralinPamagat}
                    </Text>
                  </View>
                  <Text numberOfLines={5} style={{
                    flex: 1,
                    padding: 12,
                    fontSize: 12,
                    lineHeight: 15,
                    color: '#333',
                  }}>
                    {lesson.recommendationReason || "Walang deskripsyon"}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          <View style={{ paddingHorizontal: 16, marginBottom: 40 }}>
            {/* Achievement Badges */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontWeight: '900', fontSize: 18, color: '#fff' }}>Achievement badges</Text>
              <TouchableOpacity onPress={() => router.navigate('/badges')}>
                <Text style={{ color: '#eee', fontSize: 14, fontWeight: 'bold' }}>View all</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', marginVertical: 12, gap: 12 }}>
              <Image source={imageSrc.quizLegend} style={{ width: 64, height: 64 }} resizeMode='contain' />
              <Image source={imageSrc.instantRecall} style={{ width: 64, height: 64 }} resizeMode='contain' />
              <Image source={imageSrc.bigBrain} style={{ width: 64, height: 64 }} resizeMode='contain' />
              <Image source={imageSrc.speedster} style={{ width: 64, height: 64 }} resizeMode='contain' />
              <Image source={imageSrc.topicMaster} style={{ width: 64, height: 64 }} resizeMode='contain' />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ProtectedScreen>
  );
}