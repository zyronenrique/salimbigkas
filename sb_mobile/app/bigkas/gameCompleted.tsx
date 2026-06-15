import { memo, useCallback, useEffect } from "react";
import { View, Text, Image } from "react-native";
import Leaderboard from "./Leaderboard";
import { useBigkasContext } from "../../hooks/bigkasContext";
import { useRouter } from "expo-router";
import * as ScreenOrientation from 'expo-screen-orientation';
import { imageSrc } from "@/Icons/icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LeaderboardText } from "@/components/customText";
import BumalikBtn from "@/components/bumalikBtn";

const GameCompleted = memo(() => {
  const router = useRouter();
  const { bigkasResults, setSelectedLevel } = useBigkasContext();
  
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  const handleBackToLevels = useCallback(() => {
    setSelectedLevel(null);
    router.replace(`/bigkas/levelSelection`);
  }, [setSelectedLevel, router]);

  return (
    <SafeAreaView style={{
      flexGrow: 1,
      backgroundColor: "#FFA600",
      padding: 16,
      justifyContent: "center",
      position: "relative",
    }}>
      <BumalikBtn onPress={handleBackToLevels} size={24} />
      <View style={{
        flex: 1,
        width: "100%",
        maxWidth: 600,
        zIndex: 5,
      }}>
        <View style={{
          alignItems: "center",
          gap: 16,
          marginBottom: bigkasResults?.userTotalPoints !== undefined && bigkasResults?.userTotalPoints !== null
            ? 0
            : 16,
        }}>
          <LeaderboardText size={34} />
          {bigkasResults?.userTotalPoints !== undefined && bigkasResults?.userTotalPoints !== null && (
            <Text style={{
              fontSize: 24,
              color: "#2C3E50",
              fontWeight: "900",
            }}>You got {bigkasResults?.userTotalPoints || 0} points</Text>
          )}
        </View>
        <Leaderboard />
      </View>
      <Image
        source={imageSrc.leaderboardBg}
        style={{
          position: 'absolute',
          right: 20,
          width: 300,
          height: '100%',
          zIndex: 0,
        }}
        resizeMode="contain"
      />
    </SafeAreaView>
  );
});

export default GameCompleted;