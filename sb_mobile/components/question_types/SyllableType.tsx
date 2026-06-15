import React, { memo, useRef, useState, useEffect, useCallback } from "react";
import { View, Text, useWindowDimensions } from "react-native";
import { GestureHandlerRootView, GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from "react-native-reanimated";
import { FontAwesome6 } from "@expo/vector-icons";

interface SyllableTypeProps {
    question: any;
    answers: { [key: string]: any };
    isAnswered: boolean;
    cluePositions: number[];
    shuffledSyllableIndexes: number[];
    onSyllableRemove: (orderIndex: number) => void;
    onSyllableReorder: (newOrder: number[]) => void;
    getSyllableStyle: (syllableIdx: number, isInAnswer: boolean) => any;
    setShowSpeed: (value: boolean) => void;
}

const SYLLABLE_SIZE = 100;
const SYLLABLE_MARGIN = 8;

const SyllableType = memo(({
    question,
    answers,
    isAnswered,
    cluePositions,
    shuffledSyllableIndexes,
    onSyllableRemove,
    onSyllableReorder,
    getSyllableStyle,
    setShowSpeed
}: SyllableTypeProps) => {
    const qId = question.id;
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

    // For drop zone measurement
    const dropZoneRef = useRef<View>(null);
    const dropZoneRect = useSharedValue<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 0, height: 0 });
    const [dropZoneMeasured, setDropZoneMeasured] = useState(false);
    
    useEffect(() => {
        setTimeout(() => {
            if (dropZoneRef.current) {
                dropZoneRef.current.measureInWindow((x, y, width, height) => {
                    dropZoneRect.value = { x, y, width, height };
                    setDropZoneMeasured(true);
                });
            }
        }, 200);
    }, [answers[`${qId}-0`]]);

    // Helper: get drop zone index for answer zone
    const getDropIndex = useCallback((absoluteX: number, absoluteY: number, answerOrder: number[]) => {
        'worklet';
        const zone = dropZoneRect.value;
        if (
            absoluteY > zone.y &&
            absoluteY < zone.y + zone.height &&
            absoluteX > zone.x &&
            absoluteX < zone.x + zone.width
        ) {
            if (answerOrder.length === 0) return 0;
            const slotWidth = SYLLABLE_SIZE + SYLLABLE_MARGIN;
            const totalWidth = slotWidth * answerOrder.length;
            const startX = zone.x + (zone.width - totalWidth) / 2;
            let idx = Math.floor((absoluteX - startX) / slotWidth);
            idx = Math.max(0, Math.min(idx, answerOrder.length));
            return idx;
        }
        return -1;
    }, []);

    // Draggable syllable in answer zone
    const DraggableAnswerSyllable = memo(({ syllableIdx, orderIdx, answerOrder }: { syllableIdx: number, orderIdx: number, answerOrder: number[] }) => {
        const translateY = useSharedValue(0);
        const translateX = useSharedValue(0);
        const isDragging = useSharedValue(false);

        const panGesture = Gesture.Pan()
            .minDistance(5)
            .enabled(!isAnswered && dropZoneMeasured)
            .onBegin(() => {
                isDragging.value = true;
                runOnJS(setShowSpeed)(false);
            })
            .onUpdate(e => {
                translateX.value = e.translationX;
                translateY.value = e.translationY;
            })
            .onEnd(e => {
                isDragging.value = false;
                const targetIdx = getDropIndex(e.absoluteX, e.absoluteY, answerOrder);
                if (targetIdx !== -1 && targetIdx !== orderIdx) {
                    const newOrder = [...answerOrder];
                    const [removed] = newOrder.splice(orderIdx, 1);
                    const insertIdx = targetIdx > orderIdx ? targetIdx - 1 : targetIdx;
                    newOrder.splice(insertIdx, 0, removed);
                    runOnJS(onSyllableReorder)(newOrder);
                } else if (targetIdx === -1) {
                    runOnJS(onSyllableRemove)(orderIdx);
                }
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
            });

        const syllableStyle = getSyllableStyle(syllableIdx, true);

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value }
            ],
            zIndex: isDragging.value ? 100 : 1,
            opacity: isDragging.value ? 0.8 : 1,
        }));

        return (
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[{
                    width: SYLLABLE_SIZE,
                    height: SYLLABLE_SIZE,
                    borderRadius: 12,
                    borderWidth: 2,
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: SYLLABLE_MARGIN / 2,
                    elevation: 3,
                    ...syllableStyle,
                }, animatedStyle]}>
                    <Text style={{
                        fontSize: 24,
                        fontWeight: 'bold',
                        color: syllableStyle.textColor,
                        textAlign: 'center'
                    }}>
                        {question.syllableParts[syllableIdx] || ''}
                    </Text>
                </Animated.View>
            </GestureDetector>
        );
    });

    // Draggable syllable from available pool
    const DraggableAvailableSyllable = memo(({ syllableIdx }: { syllableIdx: number }) => {
        const translateY = useSharedValue(0);
        const translateX = useSharedValue(0);
        const isDragging = useSharedValue(false);

        const panGesture = Gesture.Pan()
            .minDistance(5)
            .enabled(!isAnswered && dropZoneMeasured)
            .onBegin(() => {
                isDragging.value = true;
                runOnJS(setShowSpeed)(false);
            })
            .onUpdate(e => {
                translateX.value = e.translationX;
                translateY.value = e.translationY;
            })
            .onEnd(e => {
                isDragging.value = false;
                const answerOrder = answers[`${qId}-0`] || [];
                const targetIdx = getDropIndex(e.absoluteX, e.absoluteY, answerOrder);
                if (targetIdx !== -1) {
                    const newOrder = [...answerOrder];
                    newOrder.splice(targetIdx, 0, syllableIdx);
                    runOnJS(onSyllableReorder)(newOrder);
                }
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
            });

        const isClue = cluePositions.includes(syllableIdx);
        const syllableStyle = getSyllableStyle(syllableIdx, false);

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value }
            ],
            zIndex: isDragging.value ? 100 : 1,
            opacity: isDragging.value ? 0.8 : isAnswered ? 0.5 : 1,
        }));

        return (
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[{
                    width: SYLLABLE_SIZE,
                    height: SYLLABLE_SIZE,
                    borderRadius: 12,
                    borderWidth: 2,
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: SYLLABLE_MARGIN / 2,
                    elevation: 3,
                    ...syllableStyle,
                }, animatedStyle]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <FontAwesome6
                            name="grip-vertical"
                            size={14}
                            color={isClue ? '#a16207' : !isAnswered ? '#FFF9C4' : '#6b7280'}
                        />
                        <Text style={{
                            fontSize: 24,
                            fontWeight: 'bold',
                            color: syllableStyle.textColor,
                            textAlign: 'center'
                        }}>
                            {question.syllableParts[syllableIdx]}
                        </Text>
                        {isClue && (
                            <FontAwesome6 name="lightbulb" size={16} color="#eab308" />
                        )}
                    </View>
                </Animated.View>
            </GestureDetector>
        );
    });

    // Answer zone order
    const answerOrder: number[] = answers[`${qId}-0`] || [];

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={{
                flex: 1,
                width: SCREEN_WIDTH - 12,
                height: SCREEN_HEIGHT,
                flexDirection: 'column',
                gap: 12,
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                {/* Answer Drop Zone */}
                <View
                    ref={dropZoneRef}
                    style={{
                        flex: 1,
                        width: '100%',
                        backgroundColor: '#003311',
                        borderWidth: 4,
                        borderStyle: 'dashed',
                        borderColor: '#8a3903',
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: isAnswered ? 0.75 : 1,
                        flexDirection: 'row',
                        flexWrap: 'nowrap',
                    }}
                >
                    {answerOrder.length === 0 ? (
                        <Text style={{
                            color: 'white',
                            fontSize: 18,
                            fontWeight: '600',
                            letterSpacing: 2,
                            textAlign: 'center'
                        }}>
                            Drag syllables below to arrange them here
                        </Text>
                    ) : (
                        answerOrder.map((syllableIdx, orderIdx) =>
                            <DraggableAnswerSyllable
                                key={`arranged-${syllableIdx}`}
                                syllableIdx={syllableIdx}
                                orderIdx={orderIdx}
                                answerOrder={answerOrder}
                            />
                        )
                    )}
                </View>

                {/* Available Syllables */}
                <View style={{
                    flex: 1,
                    width: '100%',
                    opacity: isAnswered ? 0.5 : 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                }}>
                    {shuffledSyllableIndexes
                        .filter((syllableIdx: number) => !answerOrder.includes(syllableIdx))
                        .map((syllableIdx: number) =>
                            <DraggableAvailableSyllable
                                key={`syllable-${syllableIdx}`}
                                syllableIdx={syllableIdx}
                            />
                        )
                    }
                </View>
            </View>
        </GestureHandlerRootView>
    );
});

export default SyllableType;