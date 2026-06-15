import React, { memo, useCallback, useRef, useState, useEffect, forwardRef } from "react";
import { View, Text, useWindowDimensions, StyleSheet } from "react-native";
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { FontAwesome6, MaterialIcons, Octicons } from "@expo/vector-icons";

interface EnumerationTypeProps {
    question: any;
    answers: { [key: string]: any };
    isAnswered: boolean;
    onItemDrop: (categoryIndex: number, item: string) => void;
    onItemRemove: (categoryIndex: number, item: string) => void;
    getItemStyle: (item: string, categoryIndex: number) => any;
    getCategoryStyle: (categoryIndex: number) => any;
    setShowSpeed: (value: boolean) => void;
}

const EnumerationType = memo(({ 
    question,
    answers,
    isAnswered,
    onItemDrop,
    onItemRemove,
    getItemStyle,
    getCategoryStyle,
    setShowSpeed
}: EnumerationTypeProps) => {
    const qId = question.id;
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
    const categoryRefs = useRef<(View | null)[]>([]);
    const categoryRects = useSharedValue<{ x: number; y: number; width: number; height: number }[]>([]);
    const [categoriesMeasured, setCategoriesMeasured] = useState(false);
    const hoveredCategoryIdx = useSharedValue(-1);

    const AnimatedView = Animated.createAnimatedComponent(
        forwardRef<View, any>((props, ref) => <View ref={ref} {...props} />)
    );
    
    // Measure categories for drop detection
    useEffect(() => {
        if (!question.categories) return;
        const totalCategories = question.categories.length;
        setTimeout(() => {
            const refs = categoryRefs.current.slice(0, totalCategories);
            Promise.all(refs.map(ref => ref
                ? new Promise(resolve => ref.measureInWindow((x, y, width, height) => resolve({ x, y, width, height })))
                : Promise.resolve({ x: 0, y: 0, width: 0, height: 0 })
            )).then(rects => {
                categoryRects.value = rects as any;
                setCategoriesMeasured(true);
            });
        }, 200);
    }, [question.categories]);

    const getDropCategoryIdx = useCallback((absoluteX: number, absoluteY: number) => {
        'worklet';
        try {
            const HIT_MARGIN = 30;
            const rects = categoryRects.value;
            if (!rects || rects.length === 0) {
                return -1;
            }
            const idx = rects.findIndex(rect =>
                rect &&
                rect.width > 0 &&
                rect.height > 0 &&
                absoluteY >= rect.y - HIT_MARGIN &&
                absoluteY <= rect.y + rect.height + HIT_MARGIN &&
                absoluteX >= rect.x - HIT_MARGIN &&
                absoluteX <= rect.x + rect.width + HIT_MARGIN
            );
            return idx;
        } catch (error) {
            return -1;
        }
    }, [categoryRects]);

    // Handle successful drop
    const handleSuccessfulDrop = useCallback((sourceCat: number, targetCat: number, itemName: string) => {
        onItemRemove(sourceCat, itemName);
        onItemDrop(targetCat, itemName);
    }, [onItemRemove, onItemDrop]);

    // Handle item removal
    const handleItemRemoval = useCallback((catIdx: number, itemName: string) => {
        onItemRemove(catIdx, itemName);
    }, [onItemRemove]);

    // Draggable item in category (can be dragged between categories or back to bank)
    const DraggableCategoryItem = memo(({ item, catIdx }: { item: string, catIdx: number }) => {
        const translateY = useSharedValue(0);
        const translateX = useSharedValue(0);
        const isDragging = useSharedValue(false);
        const scale = useSharedValue(1);

        const panGesture = Gesture.Pan()
            .minDistance(5)
            .enabled(!isAnswered && categoriesMeasured)
            .onBegin(() => {
                'worklet';
                isDragging.value = true;
                scale.value = withSpring(1.1);
                runOnJS(setShowSpeed)(false);
            })
            .onUpdate(e => {
                'worklet';
                translateX.value = e.translationX;
                translateY.value = e.translationY;
                const idx = getDropCategoryIdx(e.absoluteX, e.absoluteY);
                hoveredCategoryIdx.value = idx;
            })
            .onEnd(e => {
                'worklet';
                isDragging.value = false;
                scale.value = withSpring(1);
                hoveredCategoryIdx.value = -1;
                try {
                    const targetCategoryIdx = getDropCategoryIdx(e.absoluteX, e.absoluteY);
                    if (targetCategoryIdx !== -1 && targetCategoryIdx !== catIdx) {
                        runOnJS(handleSuccessfulDrop)(catIdx, targetCategoryIdx, item);
                    } else if (targetCategoryIdx === -1) {
                        runOnJS(handleItemRemoval)(catIdx, item);
                    }
                } catch (error) {
                    // Silently fail
                }
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
            });

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value }
            ],
            zIndex: isDragging.value ? 1000 : 1,
            opacity: isDragging.value ? 0.9 : 1,
            elevation: isDragging.value ? 1000 : 1,
        }));

        const itemCount = answers[`${qId}-boxes`]?.[catIdx]?.length || 1;
        const fontSize = Math.max(12, 20 - itemCount * 1.5);
        const paddingVertical = Math.max(4, 12 - itemCount);

        return (
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.categoryItem, {
                    ...getItemStyle(item, catIdx),
                    opacity: isAnswered ? 0.8 : 1,
                    paddingHorizontal: 20,
                    paddingVertical,
                }, animatedStyle]}>
                    <View style={styles.itemContent}>
                        <FontAwesome6 
                            name="grip-vertical" 
                            size={fontSize} 
                            color={isAnswered ? '#6b7280' : '#15803d'} 
                        />
                        <Text style={[styles.itemText, {
                            fontSize,
                            color: getItemStyle(item, catIdx)?.color
                        }]}>
                            {item}
                        </Text>
                        {isAnswered && (
                            <View>
                                {getItemStyle(item, catIdx).backgroundColor === '#bbf7d0' ? (
                                    <MaterialIcons name="check-circle" size={20} color="#16a34a" />
                                ) : (
                                    <Octicons name="x-circle-fill" size={20} color="#dc2626" />
                                )}
                            </View>
                        )}
                    </View>
                </Animated.View>
            </GestureDetector>
        );
    });

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            {/* Category Boxes */}
            <View style={[styles.categoriesContainer, {
                width: SCREEN_WIDTH - 12,
                height: SCREEN_HEIGHT / 2,
            }]}>
                {question.categories.map((category: string, catIdx: number) => {
                    const animatedCatStyle = useAnimatedStyle(() => ({
                        transform: [
                            { scale: hoveredCategoryIdx.value === catIdx ? 1.05 : 1 }
                        ],
                        zIndex: hoveredCategoryIdx.value === catIdx ? 0 : 1,
                        elevation: hoveredCategoryIdx.value === catIdx ? 0 : 1,
                    }));
                    return (
                        <AnimatedView
                            key={catIdx}
                            ref={(ref: any) => {
                                categoryRefs.current[catIdx] = ref;
                            }}
                            style={[
                                styles.category,
                                getCategoryStyle(catIdx),
                                { opacity: isAnswered ? 0.75 : 1 },
                                animatedCatStyle
                            ]}
                        >
                            <View style={styles.categoryHeader}>
                                <Text style={[styles.categoryTitle, {
                                    color: isAnswered 
                                        ? getCategoryStyle(catIdx).backgroundColor === '#bbf7d0'
                                            ? '#15803d'
                                            : '#991b1b'
                                        : 'white'
                                }]}>
                                    {category || `Category ${catIdx + 1}`}
                                </Text>
                                {isAnswered && (
                                    <View>
                                        {getCategoryStyle(catIdx).backgroundColor === '#bbf7d0' ? (
                                            <MaterialIcons name="check-circle" size={24} color="#16a34a" />
                                        ) : (
                                            <Octicons name="x-circle-fill" size={24} color="#dc2626" />
                                        )}
                                    </View>
                                )}
                            </View>
                            
                            <View style={styles.categoryContent}>
                                <View style={styles.categoryItems}>
                                    {(answers[`${qId}-boxes`]?.[catIdx] || []).map((item: string, itemIdx: number) => 
                                        <DraggableCategoryItem 
                                            key={`${qId}-${catIdx}-${item}-${itemIdx}`}
                                            item={item}
                                            catIdx={catIdx}
                                        />
                                    )}
                                    {(answers[`${qId}-boxes`]?.[catIdx] || []).length === 0 && (
                                        <View style={[styles.emptyCategory, {
                                            borderColor: isAnswered ? '#9ca3af' : 'white',
                                            backgroundColor: isAnswered ? '#f3f4f6' : 'rgba(255,255,255,0.2)',
                                        }]}>
                                            <Text style={[styles.emptyCategoryText, {
                                                color: isAnswered ? '#6b7280' : 'white'
                                            }]}>
                                                Tap items above, and drag and drop between categories
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </AnimatedView>
                    );
                })}
            </View>
        </GestureHandlerRootView>
    );
});

const styles = StyleSheet.create({
    categoriesContainer: {
        flex: 1,
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: 4,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    category: {
        flex: 1,
        borderWidth: 4,
        borderRadius: 12,
        padding: 16,
        height: '100%',
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 12
    },
    categoryTitle: {
        flex: 1,
        fontWeight: '900',
        textAlign: 'center',
        fontSize: 14,
    },
    categoryContent: {
        flex: 1,
    },
    categoryItems: { 
        flex: 1,
        height: '100%',
        flexDirection: 'column',
        gap: 4,
    },
    categoryItem: {
        flex: 1,
        borderWidth: 2,
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderRadius: 12,
        marginVertical: 2,
        flexShrink: 1,
        justifyContent: 'center',
    },
    itemContent: {
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 20
    },
    itemText: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
    },
    emptyCategory: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 80
    },
    emptyCategoryText: {
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
    },
});

export default EnumerationType;