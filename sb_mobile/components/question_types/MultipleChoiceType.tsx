import React, { memo, useRef, ReactNode } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { GestureHandlerRootView, GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS, SharedValue } from "react-native-reanimated";
import { FontAwesome6, MaterialIcons, Octicons } from "@expo/vector-icons";
import { CopilotStep, walkthroughable } from "react-native-copilot";

interface MultipleChoiceTypeProps {
    question: any;
    answers: { [key: string]: any };
    isAnswered: boolean;
    availableOptions: any[];
    onOptionSelect: (optionIndex: number) => void;
    renderSpeaker: () => ReactNode;
    setShowSpeed: (value: boolean) => void;
    showSpeed: boolean;
    visible: boolean;
}

const WalkthroughableView = walkthroughable(View);
const WalkthroughableText = walkthroughable(Text);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    dropZone: {
        position: "absolute",
        top: 0,
        left: 0,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 4,
        borderStyle: "dashed",
        borderRadius: 12,
        zIndex: 1,
    },
    optionsContainer: {
        position: "absolute",
        top: 120,
        left: 0,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-evenly",
    },
    option: {
        backgroundColor: "#2C3E50",
        padding: 12,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        margin: 4,
    },
});

const isInsideDropZone = (
    absoluteX: number,
    absoluteY: number,
    dropZoneRect: { x: number; y: number; width: number; height: number }
) => {
    'worklet';
    return (
        absoluteY > dropZoneRect.y &&
        absoluteY < dropZoneRect.y + dropZoneRect.height &&
        absoluteX > dropZoneRect.x &&
        absoluteX < dropZoneRect.x + dropZoneRect.width
    );
};

const DraggableOption = memo(({
    option,
    dropZoneRect,
    isOverDropZone,
    handleDrop,
    isAnswered,
    correctAnswerIdx,
    optionStyle,
    setShowSpeed,
}: {
    option: { opt: string, optIdx: number },
    dropZoneRect: { x: number; y: number; width: number; height: number },
    isOverDropZone: SharedValue<boolean>,
    handleDrop: (optIdx: number) => void,
    isAnswered: boolean,
    correctAnswerIdx: number,
    optionStyle: any,
    setShowSpeed: (value: boolean) => void,
}) => {
    const translateY = useSharedValue(0);
    const translateX = useSharedValue(0);
    const isDragging = useSharedValue(false);

    const panGesture = Gesture.Pan()
        .minDistance(5)
        .enabled(!isAnswered)
        .onBegin(() => {
            isDragging.value = true;
            runOnJS(setShowSpeed)(false);
        })
        .onUpdate(e => {
            translateX.value = e.translationX;
            translateY.value = e.translationY;
            isOverDropZone.value = isInsideDropZone(e.absoluteX, e.absoluteY, dropZoneRect);
        })
        .onEnd(e => {
            isDragging.value = false;
            isOverDropZone.value = false;
            if (isInsideDropZone(e.absoluteX, e.absoluteY, dropZoneRect)) {
                runOnJS(handleDrop)(option.optIdx);
            }
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value }
        ],
        zIndex: isDragging.value ? 1000 : 1,
    }));

    let optionBg = '#2C3E50';
    if (isAnswered) {
        if (option.optIdx === correctAnswerIdx) {
            optionBg = '#dcfce7';
        } else {
            optionBg = '#fee2e2';
        }
    }
    
    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.option, optionStyle, animatedStyle, { backgroundColor: optionBg }]}>
                <View style={{
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    flex: 1,
                    transform: [{ scale: 1 }],
                }}>
                    <FontAwesome6 
                        name="grip-vertical" 
                        size={18} 
                        color={isAnswered ? (option.optIdx === correctAnswerIdx ? '#16a34a' : '#dc2626') : 'white'} 
                    />
                    <Text style={{
                        fontSize: 14,
                        fontWeight: '600',
                        marginLeft: 12,
                        color: isAnswered ? (option.optIdx === correctAnswerIdx ? '#16a34a' : '#dc2626') : 'white',
                        flex: 1
                    }}>
                        {option.opt}
                    </Text>
                </View>
                <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 24,
                    backgroundColor: isAnswered ? (option.optIdx === correctAnswerIdx ? '#16a34a' : '#dc2626') : '#6b7280',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Text style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: 'white'
                    }}>
                        {String.fromCharCode(65 + option.optIdx)}
                    </Text>
                </View>
                {isAnswered && option.optIdx === correctAnswerIdx && (
                    <MaterialIcons
                        name="check-circle"
                        size={16}
                        color="#16a34a"
                        style={{ position: 'absolute', top: 2, right: 2 }}
                    />
                )}
                {isAnswered && option.optIdx !== correctAnswerIdx &&(
                    <Octicons 
                        name="x-circle-fill" 
                        size={16} 
                        color="#dc2626"
                        style={{ position: 'absolute', top: 2, right: 2 }}
                    />
                )}
            </Animated.View>
        </GestureDetector>
    );
});

const MultipleChoiceType = memo(({
    question,
    answers,
    isAnswered,
    availableOptions,
    onOptionSelect,
    renderSpeaker,
    setShowSpeed,
    showSpeed,
    visible,
}: MultipleChoiceTypeProps) => {
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
    const userAnswer = answers[question.id];
    const dropZoneRef = useRef<View>(null);
    const isOverDropZone = useSharedValue(false);

    const DROP_ZONE_HEIGHT = 120;
    const DROP_ZONE_WIDTH = SCREEN_WIDTH - 12;
    const OPTION_HEIGHT = 85;
    const OPTION_WIDTH = (SCREEN_WIDTH - 48) / 2;

    const dropZoneStyle = {
        width: DROP_ZONE_WIDTH,
        height: DROP_ZONE_HEIGHT,
    };

    const optionsContainerStyle = {
        width: SCREEN_WIDTH - 12,
    };

    const optionStyle = {
        width: OPTION_WIDTH,
        height: OPTION_HEIGHT,
    };

    const dropZoneRect = {
        x: 16,
        y: 80,
        width: DROP_ZONE_WIDTH,
        height: DROP_ZONE_HEIGHT,
    };

    const handleDrop = (optIdx: number) => {
        if (!isAnswered) {
            onOptionSelect(optIdx);
        }
    };

    const dropZoneAnimatedStyle = useAnimatedStyle(() => {
        let scale = 1;
        let bgColor = isAnswered
            ? (userAnswer === question.numAnswer ? '#dcfce7' : '#fee2e2')
            : '#003311';
        let borderColor = isAnswered
            ? (userAnswer === question.numAnswer ? '#4ade80' : '#f87171')
            : '#8a3903';
        if (isOverDropZone.value && !isAnswered && userAnswer === undefined) {
            scale = 1.02;
            borderColor = 'orange';
        }

        return {
            transform: [{ scale }],
            backgroundColor: bgColor,
            borderColor: borderColor,
        };
    });

    // Remove selected answer from options
    const filteredOptions = availableOptions.filter((option: any) =>
        !isAnswered && userAnswer === option.optIdx ? false : true
    );

    return (
        <GestureHandlerRootView style={styles.container}>
            {/* Drop Zone */}
            <Animated.View
                ref={dropZoneRef}
                style={[styles.dropZone, dropZoneStyle, dropZoneAnimatedStyle]}
            >
                {userAnswer !== undefined ? (
                    <View style={{
                        backgroundColor: !isAnswered
                            ? '#3b82f6'
                            : userAnswer === question.numAnswer
                                ? '#16a34a'
                                : '#dc2626',
                        padding: 20,
                        borderRadius: 12,
                        flexDirection: 'row',
                        width: DROP_ZONE_WIDTH - 32,
                        height: DROP_ZONE_HEIGHT - 24,
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 12
                    }}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: 'white',
                            textAlign: 'center',
                            lineHeight: 22
                        }}>
                            {question.options[userAnswer] || 'Option not found'}
                        </Text>
                    </View>
                ) : (
                    <WalkthroughableView style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                        {(visible || question.question) && (
                            <CopilotStep
                                name="quiz-question"
                                order={5}
                                text="Makikita mo dito ang tanong na kailangan mong sagutin. Basahin ito nang mabuti!"
                            >
                                <WalkthroughableText style={{
                                    fontSize: 14,
                                    fontWeight: '900',
                                    color: isAnswered
                                        ? (userAnswer === question.numAnswer ? '#4ade80' : '#f87171')
                                        : '#fff',
                                    textAlign: 'center',
                                    lineHeight: 26,
                                }}>
                                    {question.question}
                                </WalkthroughableText>
                            </CopilotStep>
                        )}
                        <CopilotStep
                            name="quiz-question-speaker"
                            order={7}
                            text="Pindutin ito at pumili ng isang opsyon para marinig ang tanong. Makinig nang mabuti!"
                        >
                            <WalkthroughableView>
                            {renderSpeaker()}
                            </WalkthroughableView>
                        </CopilotStep>
                    </WalkthroughableView>
                )}
            </Animated.View>

            {/* Options List */}
            <View style={[styles.optionsContainer, optionsContainerStyle, { zIndex: showSpeed ? 0 : 10 }]}>
                {filteredOptions.map((option: any) =>
                    <DraggableOption
                        key={option.optIdx}
                        option={option}
                        dropZoneRect={dropZoneRect}
                        isOverDropZone={isOverDropZone}
                        handleDrop={handleDrop}
                        isAnswered={isAnswered}
                        correctAnswerIdx={question.numAnswer}
                        optionStyle={optionStyle}
                        setShowSpeed={setShowSpeed}
                    />
                )}
            </View>
        </GestureHandlerRootView>
    );
});

export default MultipleChoiceType;