import React, { useRef, useEffect } from 'react'
import { Modal, View, Text, ActivityIndicator } from "react-native";
import LottieView from 'lottie-react-native';
import Confetti from "../../assets/lottie/Confetti.json";
import Trophy from "../../assets/lottie/Trophy.json";

interface LottieModalProps {
  visible: boolean;
  onClose: () => void;
  type?: "confetti" | "trophy" | "both";
  isSubmitting?: boolean;
}

const LottieModal = ({ visible, onClose, type = "both", isSubmitting }: LottieModalProps) => {
  const confettiRef = useRef<LottieView>(null);
  const trophyRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible) {
      confettiRef.current?.play();
      trophyRef.current?.play();
    }
  }, [visible]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            style={{ flex: 1 }}
        >
            <View style={{
                flex: 1,
                backgroundColor: 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
            }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    {(type === "confetti" || type === "both") && (
                        <LottieView
                            ref={confettiRef}
                            source={Confetti}
                            loop={true}
                            style={{ width: 400, height: 400, position: 'absolute' }}
                        />
                    )}
                    {(type === "trophy" || type === "both") && (
                        <LottieView
                            ref={trophyRef}
                            source={Trophy}
                            loop={false}
                            style={{ width: 400, height: 400 }}
                        />
                    )}
                </View>
                <View style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 0,
                    right: 0,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 20,
                }}>
                    <ActivityIndicator size="large" color="#FFA600" />
                    <Text style={{
                        color: 'white',
                        fontSize: 20,
                        fontWeight: 'bold',
                        textAlign: 'center'
                    }}>
                        Loading...
                    </Text>
                </View>
            </View>
        </Modal>
    )
}

export default LottieModal;