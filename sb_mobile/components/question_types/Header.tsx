import React, { memo, useCallback } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { imageSrc } from "@/Icons/icons";
import { useAnimatedStyle, interpolate } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { CopilotStep, walkthroughable } from "react-native-copilot";
interface HeaderProps {
    question: any;
    cluePositions: number[];
    currentQuestionIndex: number;
    totalQuestions: number;
    totalScore: number;
    timer: number;
    questionTime: number;
    isAnswered: boolean;
    availableEnumerationItems: any[];
    onItemTap: (item: string) => void;
    setOpenImage: (open: boolean) => void;
    visible: boolean;
}

const WalkthroughableView = walkthroughable(View);
const WalkthroughableText = walkthroughable(Text);
const WalkthroughableTouchableOpacity = walkthroughable(TouchableOpacity);

const Header = memo(({ 
    question,
    cluePositions,
    currentQuestionIndex,
    totalQuestions,
    totalScore,
    timer,
    questionTime,
    isAnswered,
    availableEnumerationItems,
    onItemTap,
    setOpenImage,
    visible,
}: HeaderProps) => {
    // const progress = ((currentQuestionIndex) / totalQuestions) * 100;
    // const timeProgress = (timer / questionTime) * 100;
    const isTimeRunningOut = timer <= 10;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const renderEnumerationItem = useCallback(({ item, animationValue }: { item: string; animationValue: any }) => {
        const animatedStyle = useAnimatedStyle(() => ({
            transform: [
                {
                    scale: animationValue
                        ? interpolate(
                            animationValue.value,
                            [-1, 0, 1],
                            [0.85, 1, 0.85]
                        )
                        : 1,
                },
            ],
        }));
        return (
            <TouchableOpacity
                key={`bank-${item}-${question.id}`}
                onPress={() => {
                    if (!isAnswered) {
                        onItemTap(item);
                    }
                }}
                disabled={isAnswered}
                style={[
                    {
                        backgroundColor: isAnswered ? '#6b7280' : '#2C3E50',
                        minHeight: '100%',
                        paddingHorizontal: 24,
                        borderRadius: 12,
                        justifyContent: 'center',
                        alignItems: 'center',
                        opacity: isAnswered ? 0.5 : 1,
                    },
                    animatedStyle
                ]}
            >
                <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                    <FontAwesome6 name="grip-vertical" size={24} color="white" />
                    <Text 
                        style={{
                            width: '90%',
                            fontSize: 20,
                            color: 'white',
                            fontWeight: '600'
                        }}
                        numberOfLines={1}
                    >
                        {item}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }, [isAnswered, onItemTap, question.id]);

    return (
        <View style={{
            borderRadius: 16,
            padding: 8,
            marginRight: 12,
        }}>
            {/* Header Info */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                {/* Question Progress */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <WalkthroughableView style={{
                        backgroundColor: '#2C3E50',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 14
                    }}>
                        <MaterialIcons name="quiz" size={16} color="#3b82f6" />
                        <CopilotStep
                            name="quiz-question-number"
                            order={2}
                            text="Makikita mo dito ang bilang ng tanong na iyong sinasagutan. Huwag kalimutang suriin ito!"
                        >
                            <WalkthroughableText style={{
                                color: 'white',
                                fontSize: 12,
                                fontWeight: '900'
                            }}>
                                Question {currentQuestionIndex + 1} / {totalQuestions}
                            </WalkthroughableText>
                        </CopilotStep>
                        <CopilotStep
                            name="quiz-type"
                            order={1}
                            text="Makikita mo dito kung anong uri ng pagsusulit ang iyong ginagawa. Galingan at gawin ang iyong makakaya!"
                        >
                            <WalkthroughableView style={{
                                backgroundColor: question.type === 'multiple-choice' ? '#3b82f6' :
                                    question.type === 'identification' ? '#10b981' :
                                    question.type === 'enumeration' ? '#f59e0b' :
                                    question.type === 'matching' ? '#8b5cf6' :
                                    '#ef4444',
                                paddingHorizontal: 12,
                                paddingVertical: 2,
                                borderRadius: 10
                            }}>
                                <Text style={{
                                    color: 'white',
                                    fontSize: 12,
                                    fontWeight: '900',
                                    textTransform: 'capitalize'
                                }}>
                                    {question.type.replace('-', ' ')}
                                </Text>
                            </WalkthroughableView>
                        </CopilotStep>
                    </WalkthroughableView>
                    {(visible || question?.image) && (
                        <CopilotStep
                            name="quiz-question-image"
                            order={6}
                            text="Kung may larawan ang tanong, pindutin ito para makikita. Pansinin ang mga detalye sa larawan!"
                        >
                            <WalkthroughableTouchableOpacity onPress={() => setOpenImage(true)}>
                                <Image source={imageSrc.image} style={{ width: 40, height: 40 }} resizeMode='contain' />
                            </WalkthroughableTouchableOpacity>
                        </CopilotStep>
                    )}
                </View>
                {question.type == 'multiple' && (
                    <Text style={{
                        fontWeight: '900',
                        fontStyle: 'italic',
                        color: '#2C3E50',
                        textAlign: 'center',
                        fontSize: 16
                    }}>
                        Drag and drop the correct answer.
                    </Text>
                )}
                {question.type == 'identification' && (
                    <View style={{ 
                        flexDirection: 'row', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: 8, 
                    }}>
                        <Text style={{
                            fontWeight: '900',
                            color: '#2C3E50',
                            textAlign: 'center',
                            fontSize: 16
                        }}>
                            Form the word:
                        </Text>
                        <View style={{
                            alignItems: 'center'
                        }}>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#fef3c7',
                                paddingHorizontal: 12,
                                paddingVertical: 2,
                                borderRadius: 20
                            }}>
                                <FontAwesome6 name="lightbulb" size={16} color="orange" />
                                <Text style={{
                                    color: '#a16207',
                                    fontSize: 16,
                                    fontWeight: '900',
                                    marginLeft: 8
                                }}>
                                    Yellow letters are hints!
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
                {question.type === 'enumeration' && (
                    <View style={{ 
                        flex: 1,
                        justifyContent: 'center', 
                        alignItems: 'center', 
                    }}>
                        {availableEnumerationItems.length > 0 ? (
                            <Carousel
                                width={450}
                                height={40}
                                loop={true}
                                data={availableEnumerationItems}
                                scrollAnimationDuration={600}
                                mode="parallax"
                                modeConfig={{
                                    parallaxScrollingScale: 0.85,
                                    parallaxScrollingOffset: 60,
                                }}
                                style={{ alignSelf: 'center' }}
                                renderItem={renderEnumerationItem}
                            />
                        ) : (
                            <View style={{
                                flex: 1,
                                width: 400,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Text style={{
                                    fontSize: 18,
                                    fontWeight: '600',
                                    color: '#2C3E50',
                                }}>
                                    No items available
                                </Text>
                            </View>
                        )}
                    </View>
                )}
                {question.type === 'matching' && (
                    <Text style={{
                        fontWeight: '900',
                        color: '#2C3E50',
                        textAlign: 'center',
                        fontSize: 18
                    }}>
                        Match the Items
                    </Text>
                )}
                {question.type === 'syllable' && (
                    <View style={{
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: 8,
                    }}>
                        <Text style={{
                            color: '#2C3E50',
                            fontSize: 16,
                            fontWeight: '900',
                            letterSpacing: 2,
                        }}>
                            Hint:
                        </Text>
                        <View style={{
                            backgroundColor: '#003311',
                            paddingHorizontal: 14,
                            paddingVertical: 6,
                            borderRadius: 12,
                            borderWidth: 2,
                            borderColor: '#eab308',
                            flexDirection: 'row',
                            gap: 8
                        }}>
                            {question.syllableParts.map((syllable: string, syllableIdx: number) => {
                                const isClue = cluePositions.includes(syllableIdx);
                                return (
                                    <View key={syllableIdx} style={{ position: 'relative' }}>
                                        {isClue ? (
                                            <View style={{
                                                backgroundColor: '#fef3c7',
                                                width: 40,
                                                height: 30,
                                                borderRadius: 12,
                                                borderWidth: 2,
                                                borderColor: '#eab308',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}>
                                                <Text style={{
                                                    fontSize: 20,
                                                    fontWeight: 'bold',
                                                    color: '#a16207'
                                                }}>
                                                    {syllable}
                                                </Text>
                                            </View>
                                        ) : (
                                            <View style={{
                                                backgroundColor: 'rgba(255,255,255,0.2)',
                                                borderWidth: 2,
                                                borderStyle: 'dashed',
                                                borderColor: 'white',
                                                width: 40,
                                                height: 30,
                                                borderRadius: 12,
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}>
                                                <Text style={{
                                                    fontSize: 20,
                                                    fontWeight: 'bold',
                                                    color: 'white'
                                                }}>
                                                    ?
                                                </Text>
                                            </View>
                                        )}
                                        {isClue && (
                                            <View style={{
                                                position: 'absolute',
                                                top: -4,
                                                right: -4,
                                                backgroundColor: '#eab308',
                                                width: 18,
                                                height: 18,
                                                borderRadius: 12,
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}>
                                                <FontAwesome6 name="lightbulb" size={14} color="white" />
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 4,
                    borderRadius: 14,
                    borderWidth: 2,
                    backgroundColor: '#f0f9ff',
                    gap: 12
                }}>
                    {/* Score */}
                    <CopilotStep
                        name="quiz-score"
                        order={4}
                        text="Makikita mo dito ang iyong kasalukuyang iskor. Ipakita ang iyong galing!"
                    >
                        <WalkthroughableView style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#f0fdf4',
                            padding: 1,
                            borderRadius: 10
                        }}>
                            <FontAwesome6 name="trophy" size={14} color="#16a34a" />
                            <WalkthroughableText style={{
                                marginLeft: 8,
                                fontSize: 14,
                                fontWeight: '900',
                                color: '#15803d'
                            }}>
                                {totalScore.toLocaleString()}
                            </WalkthroughableText>
                        </WalkthroughableView>
                    </CopilotStep>
                    {/* Timer */}
                    <CopilotStep
                        name="quiz-timer"
                        order={3}
                        text="Makikita mo dito ang natitirang oras para sagutan ang tanong. Mabilis lang, kaya mo ’yan!"
                    >
                        <WalkthroughableView style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: isTimeRunningOut ? '#fee2e2' : '#f0f9ff',
                            borderColor: isTimeRunningOut ? '#fecaca' : '#dbeafe',
                            padding: 1,
                            borderRadius: 10,
                            gap: 8,
                        }}>
                            <Image source={imageSrc.clock} style={{ width: 16, height: 16 }} resizeMode='contain' />
                            <Text style={{
                                fontSize: 14,
                                fontWeight: '900',
                                color: isTimeRunningOut ? '#dc2626' : '#3b82f6'
                            }}>
                                {formatTime(timer)}
                            </Text>
                        </WalkthroughableView>
                    </CopilotStep>
                </View>
            </View>
        </View>
    );
});

export default Header;