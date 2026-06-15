import React, { memo, useCallback, useRef, useState, useEffect } from "react";
import { View, Text, useWindowDimensions, StyleSheet } from "react-native";
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { FontAwesome6, MaterialIcons, Octicons } from "@expo/vector-icons";

interface MatchingTypeProps {
    question: any;
    answers: { [key: string]: any };
    isAnswered: boolean;
    availableMatchingItems: any[];
    onItemMatch: (leftIndex: number, rightIndex: number) => void;
    onItemRemove: (leftIndex: number) => void;
    onItemSwap: (leftIndex: number, rightIndex: number) => void;
    getMatchStyle: (leftIdx: number, rightIdx: number) => any;
    setShowSpeed: (value: boolean) => void;
}

const MatchingType = memo(({ 
    question,
    answers, 
    isAnswered,
    availableMatchingItems,
    onItemMatch,
    onItemRemove,
    onItemSwap,
    getMatchStyle,
    setShowSpeed
}: MatchingTypeProps) => {
    const qId = question.id;
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
    const leftSlotRefs = useRef<(View | null)[]>([]);
    const leftSlotRects = useSharedValue<{ x: number; y: number; width: number; height: number }[]>([]);
    const [slotsMeasured, setSlotsMeasured] = useState(false);
    
    // Measure left slots for drop detection
    useEffect(() => {
        if (!question.leftItems) return;
        const totalSlots = question.leftItems.length;
        setTimeout(() => {
            const refs = leftSlotRefs.current.slice(0, totalSlots);
            Promise.all(refs.map(ref => ref
                ? new Promise(resolve => ref.measureInWindow((x, y, width, height) => resolve({ x, y, width, height })))
                : Promise.resolve({ x: 0, y: 0, width: 0, height: 0 })
            )).then(rects => {
                leftSlotRects.value = rects as any;
                setSlotsMeasured(true);
            });
        }, 200);
    }, [question.leftItems]);

    const getDropSlotIdx = useCallback((absoluteX: number, absoluteY: number) => {
        'worklet';
        const HIT_MARGIN = 20;
        const rects = leftSlotRects.value;
        return rects.findIndex(rect =>
            rect &&
            rect.width > 0 &&
            rect.height > 0 &&
            absoluteY >= rect.y - HIT_MARGIN &&
            absoluteY <= rect.y + rect.height + HIT_MARGIN &&
            absoluteX >= rect.x - HIT_MARGIN &&
            absoluteX <= rect.x + rect.width + HIT_MARGIN
        );
    }, [leftSlotRects]);

    // Draggable matched item in left slot
    const DraggableMatchedItem = memo(({ leftIdx, matchedItemIdx }: { leftIdx: number, matchedItemIdx: number }) => {
        const translateY = useSharedValue(0);
        const translateX = useSharedValue(0);
        const isDragging = useSharedValue(false);

        const panGesture = Gesture.Pan()
            .minDistance(5)
            .enabled(!isAnswered && slotsMeasured)
            .onBegin(() => {
                'worklet';
                isDragging.value = true;
                runOnJS(setShowSpeed)(false);
            })
            .onUpdate(e => {
                'worklet';
                translateX.value = e.translationX;
                translateY.value = e.translationY;
            })
            .onEnd(e => {
                'worklet';
                isDragging.value = false;
                try {
                    const targetSlotIdx = getDropSlotIdx(e.absoluteX, e.absoluteY);
                    if (targetSlotIdx !== -1 && targetSlotIdx !== leftIdx) {
                        const targetItem = answers[qId]?.[targetSlotIdx];
                        if (targetItem !== null && targetItem !== undefined) {
                            runOnJS(onItemSwap)(leftIdx, targetSlotIdx);
                        } else {
                            runOnJS(onItemRemove)(leftIdx);
                            runOnJS(onItemMatch)(targetSlotIdx, matchedItemIdx);
                        }
                    } else if (targetSlotIdx === -1) {
                        runOnJS(onItemRemove)(leftIdx);
                    }
                } catch (error) {
                    // silent catch
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
            opacity: isDragging.value ? 0.8 : 1,
        }));

        return (
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[{
                    flex: 1,
                    padding: 12,
                    borderRadius: 12,
                    borderWidth: 2,
                    ...getMatchStyle(leftIdx, matchedItemIdx),
                }, animatedStyle]}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <FontAwesome6 
                            name="grip-vertical" 
                            size={16} 
                            color={isAnswered ? '#6b7280' : '#15803d'} 
                        />
                        <View style={{
                            backgroundColor: isAnswered 
                                ? question.matches[leftIdx] === matchedItemIdx
                                    ? '#16a34a'
                                    : '#dc2626'
                                : '#16a34a',
                            width: 18,
                            height: 18,
                            borderRadius: 16,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Text style={{
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: 12
                            }}>
                                {String.fromCharCode(97 + matchedItemIdx)}
                            </Text>
                        </View>
                        <Text style={{
                                flex: 1,
                                color: getMatchStyle(leftIdx, matchedItemIdx).textColor,
                                fontWeight: '600',
                                fontSize: 12,
                            }}
                            numberOfLines={1}
                        >
                            {question.rightItems?.[matchedItemIdx] || 'Unknown'}
                        </Text>
                        {isAnswered && (
                            <View>
                                {question.matches[leftIdx] === matchedItemIdx ? (
                                    <MaterialIcons name="check-circle" size={18} color="#16a34a" />
                                ) : (
                                    <Octicons name="x-circle-fill" size={18} color="#dc2626" />
                                )}
                            </View>
                        )}
                    </View>
                </Animated.View>
            </GestureDetector>
        );
    });

    // Draggable item from available items
    const DraggableAvailableItem = memo(({ item, rightIdx }: { item: string, rightIdx: number }) => {
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
                const slotIdx = getDropSlotIdx(e.absoluteX, e.absoluteY);
                if (slotIdx !== -1) {
                    runOnJS(onItemMatch)(slotIdx, rightIdx);
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
            opacity: isDragging.value ? 0.8 : isAnswered ? 0.5 : 1,
        }));

        return (
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.availableItem, {
                    backgroundColor: isAnswered ? '#6b7280' : '#2C3E50',
                    opacity: isAnswered ? 0.5 : 1,
                }, animatedStyle]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8 }}>
                        <FontAwesome6 name="grip-vertical" size={16} color="white" />
                        <View style={{
                            backgroundColor: 'white',
                            width: 18,
                            height: 18,
                            borderRadius: 16,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Text style={{
                                color: '#2C3E50',
                                fontWeight: 'bold',
                                fontSize: 12
                            }}>
                                {String.fromCharCode(97 + rightIdx)}
                            </Text>
                        </View>
                        <Text style={{
                            color: 'white',
                            fontWeight: '600',
                            fontSize: 12,
                            flex: 1
                        }}>
                            {item}
                        </Text>
                    </View>
                </Animated.View>
            </GestureDetector>
        );
    });

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={{
                flex: 1,
                width: SCREEN_WIDTH - 12,
                flexDirection: 'row', 
                flexWrap: 'wrap', 
                gap: 12,
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                {/* Left Column - Match Items */}
                <View style={styles.leftColumn}>
                    <View style={{ flex: 1, height: '100%', gap: 12 }}>
                        {question.leftItems?.map((item: string, leftIdx: number) => {
                            const matchedItemIdx = answers[qId]?.[leftIdx];
                            const hasMatch = matchedItemIdx !== null && matchedItemIdx !== undefined;
                            
                            return (
                                <View
                                    key={leftIdx}
                                    ref={ref => {
                                        leftSlotRefs.current[leftIdx] = ref;
                                    }}
                                    style={[styles.leftSlot, {
                                        opacity: isAnswered ? 0.75 : 1,
                                    }]}
                                >
                                    <View style={[styles.slotNumber, {
                                        display: hasMatch ? 'none' : 'flex',
                                        backgroundColor: hasMatch ? '#2C3E50' : 'white',
                                    }]}>
                                        <Text style={{
                                            color: hasMatch ? 'white' : '#2C3E50',
                                            fontWeight: 'bold',
                                            fontSize: 12
                                        }}>
                                            {leftIdx + 1}
                                        </Text>
                                    </View>
                                    <Text style={[styles.leftItemText, {
                                        left: hasMatch ? 60 : 30,
                                        color: hasMatch ? '#2C3E50' : 'white',
                                    }]}>
                                        {item}
                                    </Text>
                                    
                                    {hasMatch ? (
                                        <DraggableMatchedItem 
                                            leftIdx={leftIdx} 
                                            matchedItemIdx={matchedItemIdx} 
                                        />
                                    ) : (
                                        <View style={styles.emptySlot}>
                                            <Text style={styles.emptySlotText}>
                                                Drag item here
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Right Column - Available Items */}
                <View style={[styles.rightColumn, {
                    opacity: isAnswered ? 0.5 : 1,
                }]}>
                    {availableMatchingItems.length > 0 ? (
                        <View style={{ flex: 1, height: '100%', gap: 8 }}>
                            {availableMatchingItems.map(({item, rightIdx}: {item: string; rightIdx: number}) => (
                                <DraggableAvailableItem 
                                    key={`right-${rightIdx}`}
                                    item={item}
                                    rightIdx={rightIdx}
                                />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyAvailable}>
                            <Text style={styles.emptyAvailableText}>
                                No items available
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </GestureHandlerRootView>
    );
});

const styles = StyleSheet.create({
    leftColumn: {
        flex: 1,
        backgroundColor: '#003311',
        borderRadius: 12,
        padding: 14,
        borderWidth: 4,
        borderColor: '#8a3903'
    },
    leftSlot: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        padding: 2,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: 'white',
        flexDirection: 'row',
        position: 'relative',
    },
    slotNumber: {
        position: 'absolute',
        top: 5,
        left: 5,
        zIndex: 1,
        width: 18,
        height: 18,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center'
    },
    leftItemText: {
        position: 'absolute',
        top: 5,
        zIndex: 1000,
        fontWeight: '600',
        fontSize: 14,
    },
    emptySlot: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptySlotText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    rightColumn: {
        flex: 1,
    },
    availableItem: {
        flex: 1,
        borderRadius: 12,
        padding: 8,
        borderWidth: 2,
        borderColor: '#2C3E50',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyAvailable: {
        alignItems: 'center',
        paddingVertical: 32
    },
    emptyAvailableText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        minWidth: 300,
        maxWidth: 350,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#1f2937',
    },
    slotButtons: {
        width: '100%',
        gap: 12,
    },
    slotButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    slotButtonNumber: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    slotButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4,
    },
    occupiedText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 10,
        fontStyle: 'italic',
        marginTop: 2,
    },
    cancelButton: {
        marginTop: 16,
        paddingVertical: 8,
        paddingHorizontal: 20,
    },
    cancelButtonText: {
        color: '#6b7280',
        fontSize: 14,
    },
});

export default MatchingType;