import { memo, useCallback } from "react";
import { Modal, View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from "react-native";
import { imageSrc } from "../../Icons/icons";

interface Modal4AllProps {
  isExiting?: boolean;
  type: "pause" | "playAgain" | "bigkasInfo" | "quizInfo" | "seatworkInfo";
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  onExitWithSave?: () => void;
  onLeaderboard?: () => void;
}

const Modal4All = memo(({ isExiting, type, isOpen, onClose, onConfirm, onExitWithSave, onLeaderboard }: Modal4AllProps) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleLeaderboard = useCallback(() => {
    if (onLeaderboard) {
      onLeaderboard();
    }
    onClose();
  }, [onLeaderboard, onClose]);

  if (!isOpen) {
    return null;
  }
  
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      style={{ flex: 1 }}
    >
      <View style={styles.overlay}>
        {(type === "bigkasInfo" || type === "quizInfo" || type === "seatworkInfo") && (
          <TouchableOpacity style={{ position: 'absolute', top: 5, right: 10 }} onPress={onClose}>
            <Image
              source={imageSrc.gameX}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
        <View style={styles.container}>
          <Image
            source={imageSrc.blackboardMode}
            style={styles.background }
            resizeMode="contain"
          />
          <View style={styles.content}>
            {type === "bigkasInfo" ? (
              <Text style={styles.infoText}>Bigkas is a fun and interactive game that helps you learn new words and improve your vocabulary.</Text>
            ): type === "quizInfo" ? (
              <Text style={styles.infoText}>Quiz lets you test your knowledge. Answer questions to earn points and track your progress. Good luck!</Text>
            ): type === "seatworkInfo" ? (
              <Text style={styles.infoText}>Seatwork allows you to practice what you've learned. Complete the tasks to reinforce your understanding.</Text>
            ): isExiting ? (
              <ActivityIndicator color="#FFF9C4" size="large" />
            ): (
              <>
                <TouchableOpacity onPress={onClose}>
                  <Image
                    source={imageSrc.gameX}
                    style={{ width: 80, height: 80 }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={type === "pause" && isExiting}
                  onPress={handleConfirm}
                >
                  {type === "playAgain" ? (
                    <Image
                      source={imageSrc.refreshBox}
                      style={{ width: 80, height: 80 }}
                      resizeMode="contain"
                    />
                  ) : (
                    <Image
                      source={imageSrc.playBox}
                      style={{ width: 80, height: 80 }}
                      resizeMode="contain"
                    />
                  )}
                </TouchableOpacity>
                {type === "playAgain" && (
                  <TouchableOpacity onPress={handleLeaderboard}>
                    <Image
                      source={imageSrc.trophyBox}
                      style={{ width: 80, height: 80 }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                )}
                {type === "pause" && (
                  <TouchableOpacity
                    disabled={isExiting}
                    onPress={onExitWithSave}
                  >
                    <Image
                      source={imageSrc.saveBox}
                      style={{ width: 80, height: 80 }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                )}
                <Text style={styles.note}>
                  {type === "playAgain"
                    ? "Note: Playing again will reset your progress."
                    : "Note: Exiting will save your progress."}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  container: {
    width: 440,
    height: 440,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    zIndex: 0,
  },
  content: {
    flexDirection: "row",
    flexWrap: "wrap",
    zIndex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    gap: 16,
  },
  note: {
    color: "#FFF9C4",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
  },
  infoText: {
    color: "#FFF9C4",
    fontSize: 18,
    textAlign: "center",
    paddingHorizontal: 60,
    fontWeight: "bold", 
    lineHeight: 22,
  },
});

export default Modal4All;