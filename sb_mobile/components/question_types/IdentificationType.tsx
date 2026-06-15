import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { View, Text, useWindowDimensions } from "react-native";
import { GestureHandlerRootView, GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from "react-native-reanimated";
import { FontAwesome6 } from "@expo/vector-icons";

interface IdentificationTypeProps {
    question: any;
    answers: { [key: string]: any };
    isAnswered: boolean;
    cluePositions: number[];
    letterBank: string[];
    availableLetters: any[];
    onLetterPlace: (slotIndex: number, letterIndex: number) => void;
    onSlotTap: (slotIndex: number) => void;
    getSlotStyle: (slotIndex: number, hasLetter: boolean) => any;
    setShowSpeed: (value: boolean) => void;
}

const IdentificationType = memo(({
    question,
    answers,
    isAnswered,
    cluePositions,
    letterBank,
    availableLetters,
    onLetterPlace,
    onSlotTap,
    getSlotStyle,
    setShowSpeed
}: IdentificationTypeProps) => {
    const qId = question.id;
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
    const slotRefs = useRef<(View | null)[]>([]);
    const slotRects = useSharedValue<{ x: number; y: number; width: number; height: number }[]>([]);
    const [slotsMeasured, setSlotsMeasured] = useState(false);

    const SLOT_SIZE = 72;
    const LETTER_SIZE = 72;
    const SLOT_MARGIN = 8;

    useEffect(() => {
        if (!question.answer) return;
        const totalSlots = question.answer.length;
        setTimeout(() => {
            const refs = slotRefs.current.slice(0, totalSlots);
            Promise.all(refs.map(ref => ref
                ? new Promise(resolve => ref.measureInWindow((x, y, width, height) => resolve({ x, y, width, height })))
                : Promise.resolve({ x: 0, y: 0, width: 0, height: 0 })
            )).then(rects => {
                slotRects.value = rects as any;
                setSlotsMeasured(true);
            });
        }, 200);
    }, [question.answer]);

    const getDropSlotIdx = useCallback((absoluteX: number, absoluteY: number, slotRects: { x: number; y: number; width: number; height: number }[], cluePositions: number[]) => {
        'worklet';
        const HIT_MARGIN = 0;
        return slotRects.findIndex((rect, idx) =>
            rect &&
            !cluePositions.includes(idx) &&
            absoluteY > rect.y - HIT_MARGIN &&
            absoluteY < rect.y + rect.height + HIT_MARGIN &&
            absoluteX > rect.x - HIT_MARGIN &&
            absoluteX < rect.x + rect.width + HIT_MARGIN
        );
    }, [cluePositions]);

    // Render answer slots
    const renderSlots = () => (
        <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            flexWrap: 'wrap',
        }}>
            {question.answer?.split('').map((_: string, slotIdx: number) => {
                const isClueSlot = cluePositions?.includes(slotIdx);
                const correctLetter = question.answer[slotIdx]?.toUpperCase();
                const slotLetterIdx = answers[`${qId}-slots`]?.[slotIdx];
                const hasUserLetter = slotLetterIdx !== null && slotLetterIdx !== undefined;

                return (
                    <View
                        key={slotIdx}
                        ref={ref => {
                            slotRefs.current[slotIdx] = ref;
                        }}
                        style={{
                            width: SLOT_SIZE,
                            height: SLOT_SIZE,
                            borderWidth: 2,
                            borderRadius: 12,
                            justifyContent: 'center',
                            alignItems: 'center',
                            margin: SLOT_MARGIN / 2,
                            position: 'relative',
                            ...getSlotStyle(slotIdx, hasUserLetter)
                        }}
                    >
                        {isClueSlot ? (
                            <View style={{
                                width: 60,
                                height: 60,
                                backgroundColor: '#fde047',
                                borderRadius: 8,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderWidth: 2,
                                borderColor: '#eab308'
                            }}>
                                <Text style={{
                                    fontSize: 32,
                                    fontWeight: 'bold',
                                    color: '#a16207'
                                }}>
                                    {correctLetter}
                                </Text>
                            </View>
                        ) : hasUserLetter ? (
                            <DraggableSlotLetter slotIdx={slotIdx} letterIdx={slotLetterIdx} />
                        ) : (
                            <Text style={{
                                fontSize: 32,
                                fontWeight: '600',
                                color: 'white'
                            }}>
                                ?
                            </Text>
                        )}
                        {isClueSlot && (
                            <View style={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                backgroundColor: '#eab308',
                                borderRadius: 12,
                                width: 24,
                                height: 24,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <FontAwesome6 name="lightbulb" size={16} color="yellow" />
                            </View>
                        )}
                    </View>
                );
            })}
        </View>
    );

    // Render draggable letter
    const DraggableSlotLetter = memo(({ slotIdx, letterIdx }: { slotIdx: number, letterIdx: number }) => {
        const translateY = useSharedValue(0);
        const translateX = useSharedValue(0);
        const isDragging = useSharedValue(false);

        const panGesture = Gesture.Pan()
            .minDistance(5)
            .enabled(!isAnswered && slotsMeasured)
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
                const targetSlotIdx = getDropSlotIdx(e.absoluteX, e.absoluteY, slotRects.value, cluePositions);
                if (targetSlotIdx !== -1 && targetSlotIdx !== slotIdx && !cluePositions.includes(targetSlotIdx)) {
                    runOnJS(onLetterPlace)(targetSlotIdx, letterIdx);
                } else if (targetSlotIdx === -1) {
                    runOnJS(onSlotTap)(slotIdx);
                }
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
            });

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value }
            ],
            zIndex: isDragging.value ? 10 : 1,
            opacity: isDragging.value ? 0.8 : 1,
        }));

        return (
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[{
                    width: 60,
                    height: 60,
                    backgroundColor: isAnswered ? (getSlotStyle(slotIdx, true).backgroundColor === '#dcfce7' ? '#bbf7d0' : '#fecaca') : '#bbf7d0',
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                }, animatedStyle]}>
                    <Text style={{
                        fontSize: 32,
                        fontWeight: 'bold',
                        color: isAnswered ? (getSlotStyle(slotIdx, true).backgroundColor === '#dcfce7' ? '#15803d' : '#dc2626') : '#15803d'
                    }}>
                        {letterBank[letterIdx]?.toUpperCase() || '?'}
                    </Text>
                </Animated.View>
            </GestureDetector>
        );
    });

    const DraggableLetter = memo(({ item }: { item: any }) => {
        const translateY = useSharedValue(0);
        const translateX = useSharedValue(0);
        const isDragging = useSharedValue(false);
        const panGesture = Gesture.Pan()
            .minDistance(5)
            .enabled(!isAnswered && slotsMeasured)
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
                const slotIdx = getDropSlotIdx(e.absoluteX, e.absoluteY, slotRects.value, cluePositions);
                if (slotIdx !== -1 && !cluePositions.includes(slotIdx)) {
                    runOnJS(onLetterPlace)(slotIdx, item.letterIdx);
                }
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
            });

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value }
            ],
            zIndex: isDragging.value ? 10 : 1,
            opacity: isDragging.value ? 0.8 : isAnswered ? 0.5 : 1,
        }));

        return (
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[{
                    width: LETTER_SIZE,
                    height: LETTER_SIZE,
                    backgroundColor: '#1f2937',
                    borderRadius: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: 4,
                }, animatedStyle]}>
                    <Text style={{
                        fontSize: 32,
                        fontWeight: 'bold',
                        color: 'white'
                    }}>
                        {item.letter?.toUpperCase()}
                    </Text>
                </Animated.View>
            </GestureDetector>
        );
    });

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            {/* Answer Slots */}
            <View style={{
                width: SCREEN_WIDTH - 12,
                backgroundColor: '#003311',
                borderWidth: 4,
                borderColor: '#8a3903',
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 24,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
            }}>
                {renderSlots()}
            </View>
            {!slotsMeasured ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: 'white', textAlign: 'center', marginBottom: 8 }}>
                        Loading slots...
                    </Text>
                </View>
            ):(
                <View style={{
                    width: SCREEN_WIDTH - 12,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 12,
                    marginBottom: 24,
                }}>
                    {availableLetters.map((item) => (
                        <DraggableLetter key={item.letterIdx} item={item} />
                    ))}
                </View>
            )}
        </GestureHandlerRootView>
    );
});

export default IdentificationType;