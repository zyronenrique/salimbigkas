import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, useWindowDimensions } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLessonsState } from '@/hooks/useLessonsState';
import { useClassContext } from '@/hooks/classContext';
import { useRouter } from 'expo-router';
import { imageSrc } from '@/Icons/icons';
import BumalikBtn from '@/components/bumalikBtn';

const YunitLessons = () => {
  const router = useRouter();
  const { selectedYunit, setSelectedLesson, setLastViewedLesson } = useClassContext();
  const { state, refreshLessons } = useLessonsState();
  const [refreshing, setRefreshing] = useState(false);
  const { width, height } = useWindowDimensions();
  
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshLessons();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', backgroundColor: '#2C3E50' }}>
      <Image
        source={imageSrc.lessonbg}
        style={{ position: 'absolute', opacity: 0.5, width: width, height: height, left: 0 }}
        resizeMode='stretch'
      />
      <View style={{ flexDirection: 'column', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 10, gap: 12, backgroundColor: 'transparent' }}>
        <BumalikBtn 
          style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}
          onPress={() => router.back()}
          size={24}
        />
      </View>
      {state.isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#FFA600" />
        </View>
      ) : (
        <>
          <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 12, gap: 4, backgroundColor: 'transparent' }}>
            <Text style={{ fontSize: 36, fontWeight: '900', color: '#fff', paddingVertical: 8 }}>
              Yunit {selectedYunit?.yunitnumber}
            </Text>
            <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#fff', paddingVertical: 8 }}>
              {selectedYunit?.yunitname}
            </Text>
          </View>
          <ScrollView 
            style={{ flex: 1, padding: 16, backgroundColor: 'transparent' }} 
            contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#2C3E50']}
                tintColor="#2C3E50"
              />
            }
          >
            <Text style={{ textAlign: 'center', fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 10 }}>Mga aralin</Text>
            {state.lessons.length > 0 ? (
              state.lessons.map((lesson: any, idx: number) => (
                <TouchableOpacity
                  key={lesson.id || idx}
                  style={{ flexDirection: 'row', backgroundColor: '#FFA600', borderRadius: 8, alignItems: 'center', gap: 12, padding: 16, elevation: 2 }}
                  onPress={() => {
                    setSelectedLesson(lesson);
                    setLastViewedLesson(lesson);
                    router.navigate('/lessons/modal');
                  }}
                >
                  <Image source={imageSrc.book} style={{ width: 60, height: 60 }} resizeMode='contain' />
                  <View style={{ flexDirection: 'column', flex: 1 }}>
                    <Text numberOfLines={2} style={{ width: '100%', fontSize: 16, fontWeight: 'bold', color: '#2C3E50' }}>
                      Aralin {lesson.aralinNumero} - {lesson.aralinPamagat}
                    </Text>
                    <Text numberOfLines={2} style={{ fontSize: 14, color: '#2C3E50', marginTop: 4 }}>
                      {lesson.aralinPaglalarawan || "Walang deskripsyon"}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ddd', marginBottom: 12, fontStyle: 'italic' }}>No lessons available.</Text>
              </View>
            )}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

export default YunitLessons;