import { StatusBar } from 'expo-status-bar';
import { Text, View, Image, useWindowDimensions, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'moti';
import { useClassContext } from '@/hooks/classContext';
import { MaterialIcons } from '@expo/vector-icons';
import { imageSrc } from '@/Icons/icons';
import { useRouter } from 'expo-router';

export default function ModalScreen() {
  const router = useRouter();
  const { selectedLesson } = useClassContext();
  const title = selectedLesson?.aralinPamagat || "Tungkol sa Aralin";
  const about = selectedLesson?.aralinPaglalarawan || "Walang nilalaman para sa araling ito.";
  const objectives = Array.isArray(selectedLesson?.aralinLayunin) ? selectedLesson.aralinLayunin : [];
  const { width, height } = useWindowDimensions();

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', position: 'relative', backgroundColor: '#FFA600' }}>
      <Image
        source={imageSrc.lessonbg}
        style={{ position: 'absolute', width: width, height: height, left: 0 }}
        resizeMode='stretch'
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View
          style={{
            position: 'relative',
            flex: 1,
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            gap: 16,
          }}
        >
          <Text style={{ textAlign: 'center', width: '100%', padding: 16, borderRadius: 16, backgroundColor: '#003311', color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 1 }}>
            {title}
          </Text>
          <View style={{ position: 'relative', width: '100%', backgroundColor: 'white', borderRadius: 16, padding: 18, flexDirection: 'column', alignItems: 'center', borderWidth: 2, borderColor: '#2C3E50' }}>
            <View style={{ flexDirection: 'column', gap: 16, width: '100%', paddingHorizontal: 8, paddingVertical: 12, borderRadius: 16, backgroundColor: '#f0f7fa' }}>
              <View style={{ flexDirection: 'column', paddingHorizontal: 8, marginBottom: 8 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#2980B9', marginBottom: 8 }}>Tungkol</Text>
                <Text style={{ textAlign: 'justify', }}>{about}</Text>
              </View>
              <View style={{ flexDirection: 'column', marginTop: 8, paddingHorizontal: 8 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#2980B9', marginBottom: 8 }}>Mga Layunin</Text>
                {objectives.length > 0 ? (
                  <View>
                    {objectives.map((layunin: string, idx: number) => (
                      <Text key={idx} style={{ marginLeft: 24, marginBottom: 4 }}>• {layunin}</Text>
                    ))}
                  </View>
                ) : (
                  <Text style={{ marginLeft: 24 }}>Walang layunin para sa araling ito.</Text>
                )}
              </View>
            </View>
            <View style={{ position: 'absolute', top: -20, right: -20, backgroundColor: '#FEF9C3', borderRadius: 999, padding: 10, elevation: 4 }}>
              <MaterialIcons name="info-outline" size={32} color="#F59E42" />
            </View>
          </View>
          <Pressable
            style={{
              width: '100%',
              height: 80,
              backgroundColor: '#003311',
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 16,
              elevation: 4,
              gap: 16,
            }}
            onPress={() => router.navigate('/lessons/lesson')}
          >
            <Image source={imageSrc.book} style={{ width: 28, height: 28 }} resizeMode='contain' />
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>Simulan ang pagbabasa</Text>
          </Pressable>
        </View>
      </ScrollView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}