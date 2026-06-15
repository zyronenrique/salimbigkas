import React, { useCallback, useState } from 'react';
import { ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import SkeletonYunit from '@/app/skeletonLoaders/skeletonYunit';
import { useYunitsState } from '@/hooks/useYunitsState';
import { useRouter } from 'expo-router';
import { useClassContext } from '@/hooks/classContext';
import { StatusBar } from 'expo-status-bar';
import { imageSrc } from '@/Icons/icons';
import { ProtectedScreen } from '@/routes/ProtectedScreen';
import { useFocusEffect } from '@react-navigation/native';
import { MyYunitText } from '@/components/customText';
import Svg, { Path } from 'react-native-svg';

export default function TabTwoScreen() {
  const router = useRouter();
  const skeletonArray = Array.from({ length: 4 }, (_, index) => (
    <SkeletonYunit key={index} />
  ));
  const { setSelectedYunit } = useClassContext();
  const { state, refreshYunits } = useYunitsState();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      return undefined;
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshYunits();
    setRefreshing(false);
  };

  return (
    <ProtectedScreen requireVerifiedEmail={true}>
      <SafeAreaView style={{flex: 1, backgroundColor: '#2C3E50' }}>
        <StatusBar style="light" />
        <MyYunitText />
        <ScrollView 
          style={{ backgroundColor: '#2C3E50' }} 
          contentContainerStyle={{ padding: 10, paddingBottom: 100, gap: 10 }} 
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
          {state.isLoading
            ? skeletonArray
            : state.yunits.length > 0 ? (
                state.yunits.map((unit: any, index: number) => (
                  <TouchableOpacity 
                    key={index} 
                    style={{ position: 'relative', backgroundColor: 'transparent', padding: 12, borderRadius: 12, alignItems: 'center', overflow: 'hidden' }}
                    disabled={unit.status === true && unit.unlocked === false}
                    onPress={() => {
                      setSelectedYunit(unit);
                      router.navigate('/lessons/yunitLessons');
                    }}
                  >
                    <Image source={{ uri: unit.imageurl }} style={{ width: '100%', height: 256, borderRadius: 12, zIndex: 1 }} resizeMode='contain' />
                    <Svg viewBox="0 0 1440 320" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, zIndex: 0 }}>
                      <Path fill="#FFA600" fillOpacity="1" d="M0,320L6.2,314.7C12.3,309,25,299,37,261.3C49.2,224,62,160,74,149.3C86.2,139,98,181,111,197.3C123.1,213,135,203,148,208C160,213,172,235,185,250.7C196.9,267,209,277,222,272C233.8,267,246,245,258,245.3C270.8,245,283,267,295,229.3C307.7,192,320,96,332,96C344.6,96,357,192,369,229.3C381.5,267,394,245,406,202.7C418.5,160,431,96,443,96C455.4,96,468,160,480,181.3C492.3,203,505,181,517,149.3C529.2,117,542,75,554,90.7C566.2,107,578,181,591,213.3C603.1,245,615,235,628,224C640,213,652,203,665,181.3C676.9,160,689,128,702,101.3C713.8,75,726,53,738,64C750.8,75,763,117,775,112C787.7,107,800,53,812,80C824.6,107,837,213,849,261.3C861.5,309,874,299,886,261.3C898.5,224,911,160,923,117.3C935.4,75,948,53,960,64C972.3,75,985,117,997,160C1009.2,203,1022,245,1034,218.7C1046.2,192,1058,96,1071,69.3C1083.1,43,1095,85,1108,112C1120,139,1132,149,1145,128C1156.9,107,1169,53,1182,32C1193.8,11,1206,21,1218,37.3C1230.8,53,1243,75,1255,85.3C1267.7,96,1280,96,1292,133.3C1304.6,171,1317,245,1329,240C1341.5,235,1354,149,1366,144C1378.5,139,1391,213,1403,250.7C1415.4,288,1428,288,1434,288L1440,288L1440,320L1433.8,320C1427.7,320,1415,320,1403,320C1390.8,320,1378,320,1366,320C1353.8,320,1342,320,1329,320C1316.9,320,1305,320,1292,320C1280,320,1268,320,1255,320C1243.1,320,1231,320,1218,320C1206.2,320,1194,320,1182,320C1169.2,320,1157,320,1145,320C1132.3,320,1120,320,1108,320C1095.4,320,1083,320,1071,320C1058.5,320,1046,320,1034,320C1021.5,320,1009,320,997,320C984.6,320,972,320,960,320C947.7,320,935,320,923,320C910.8,320,898,320,886,320C873.8,320,862,320,849,320C836.9,320,825,320,812,320C800,320,788,320,775,320C763.1,320,751,320,738,320C726.2,320,714,320,702,320C689.2,320,677,320,665,320C652.3,320,640,320,628,320C615.4,320,603,320,591,320C578.5,320,566,320,554,320C541.5,320,529,320,517,320C504.6,320,492,320,480,320C467.7,320,455,320,443,320C430.8,320,418,320,406,320C393.8,320,382,320,369,320C356.9,320,345,320,332,320C320,320,308,320,295,320C283.1,320,271,320,258,320C246.2,320,234,320,222,320C209.2,320,197,320,185,320C172.3,320,160,320,148,320C135.4,320,123,320,111,320C98.5,320,86,320,74,320C61.5,320,49,320,37,320C24.6,320,12,320,6,320L0,320Z" />
                    </Svg>
                    <Text style={{ position: 'absolute', top: 10, left: 10, padding: 8, borderRadius: 8, color: '#fff', fontSize: 20, fontWeight: '900', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1 }}>Yunit {unit.yunitnumber}</Text>
                    <Text style={{ position: 'absolute', textAlign: 'center', bottom: 12, color: '#fff', fontSize: 18, fontWeight: '900', textShadowColor: '#000', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 18, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 8, paddingVertical: 4, zIndex: 1 }}>{unit.yunitname}</Text>
                    {unit.status === true && unit.unlocked === false && (
                      <View style={{ position: 'absolute', inset: 0, zIndex: 10, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)'}}>
                        <Image source={imageSrc.locked} style={{ width: 64, height: 64, marginBottom: 12 }} resizeMode='contain' />
                        <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#fff' }}>Locked</Text>
                        <Text style={{ fontSize: 14, marginTop: 4, textAlign: 'center', letterSpacing: 1, color: '#fff' }}>This yunit is currently locked.</Text>
                      </View>
                    )}
                    {unit.unlocked === true && (
                      <View style={{ position: 'absolute', top: 10, right: 10, gap: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, width: 120, backgroundColor: 'rgba(255,255,255,0.85)', zIndex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '900', color: unit.status === true && unit.unlocked === false ? '#aaa' : '#2D3748' }}>
                          View lessons
                        </Text>
                        <Feather name="arrow-right-circle" size={18} color={unit.status === true && unit.unlocked === false ? "#aaa" : "#2D3748"} />
                      </View>
                    )}
                  </TouchableOpacity>
              ))
            ):(
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, backgroundColor: 'transparent' }}>
                <MaterialIcons name="error-outline" size={64} color="#FFA600" />
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 16, textAlign: 'center', color: '#fff' }}>No Yunits Available</Text>
                <Text style={{ fontSize: 14, marginTop: 8, textAlign: 'center', color: '#fff' }}>You currently have no yunits. Please contact your teacher for more information.</Text>
              </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ProtectedScreen>
  );
}
