import { View, StyleSheet } from "react-native";
import { Skeleton } from "moti/skeleton";
import { MotiView } from "moti";

const SkeletonYunit = () => {
  return (
    <MotiView
      transition={{
        type: 'timing',
      }}
      style={{ flex: 1, backgroundColor: '#ffffff', padding: 8 }}
      animate={{ backgroundColor: '#transparent' }}
    >
      <View style={styles.card}>
        {/* Image skeleton */}
        <Skeleton
          width="100%"
          height={256}
          radius={16}
          colorMode="light"
          transition={{
            type: "timing",
            duration: 800,
          }}
        />
        {/* Yunit number skeleton (top left) */}
        <View style={[styles.absolute, styles.yunitNumber]}>
          <Skeleton
            width={80}
            height={26}
            radius={8}
            colorMode="light"
          />
        </View>
        {/* Yunit title skeleton (bottom left) */}
        <View style={[styles.absolute, styles.yunitTitle]}>
          <Skeleton
            width={"80%"}
            height={28}
            radius={8}
            colorMode="light"
          />
        </View>
        {/* View lessons button skeleton (top right) */}
        <View style={[styles.absolute, styles.viewLessons]}>
          <Skeleton
            width={100}
            height={28}
            radius={8}
            colorMode="light"
          />
        </View>
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: 256,
    borderRadius: 16,
    backgroundColor: "transparent",
    overflow: "hidden",
    position: "relative",
  },
  image: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 256,
    borderRadius: 16,
  },
  absolute: {
    position: "absolute",
  },
  yunitNumber: {
    top: 16,
    left: 16,
  },
  yunitTitle: {
    bottom: 16,
    left: 16,
  },
  viewLessons: {
    top: 8,
    right: 8,
  },
});

export default SkeletonYunit;