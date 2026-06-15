import { imageSrc } from "@/Icons/icons";
import { MaterialIcons } from "@expo/vector-icons";
import { View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface CustomToastProps {
  icon: string;
  text1: string;
  text2: string;
  hide: () => void;
}

const CustomToast = ({ icon, text1, text2, hide }: CustomToastProps) => {
  return (
    <SafeAreaView style={{
      flex: 1,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
    }}>
      <View style={{
        width: '90%',
        backgroundColor: '#003311',
        borderWidth: 4,
        borderColor: '#8a3903',
        borderRadius: 24,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        gap: 16,
      }}>
        <Image source={imageSrc[icon || 'errorBox']} style={{ width: 40, height: 40 }} resizeMode='contain' />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 24, fontWeight: '900', color: '#fff' }}>{text1}</Text>
          <Text style={{ marginTop: 4, fontSize: 16, color: '#fff' }}>{text2}</Text>
        </View>
        <MaterialIcons name="close" size={24} color="#fff" onPress={hide} />
      </View>
    </SafeAreaView>
  );
};

export default CustomToast;
