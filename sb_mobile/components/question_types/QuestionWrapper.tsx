import React, { memo, useCallback, useMemo, useState } from "react";
import { View, Text, ViewStyle, TouchableOpacity, Image } from "react-native";
import MultipleChoiceType from "./MultipleChoiceType";
import IdentificationType from "./IdentificationType";
import EnumerationType from "./EnumerationType";
import MatchingType from "./MatchingType";
import SyllableType from "./SyllableType";
import { MotiView } from "moti";
import useAudioQueue from "@/hooks/useAudioQueue";
import { buildJobsFromText } from "@/utils/helpers";
import { imageSrc } from "@/Icons/icons";
import { CopilotStep, walkthroughable } from "react-native-copilot";
interface QuestionWrapperProps {
  question: any;
  answers: { [key: string]: any };
  isAnswered: boolean;
  cluePositions: number[];
  availableOptions: any[];
  letterBank: string[];
  availableLetters: any[];
  availableMatchingItems: any[];
  shuffledSyllableIndexes: number[];
  onOptionSelect: (optionIndex: number) => void;
  onLetterPlace: (slotIndex: number, letterIndex: number) => void;
  onSlotTap: (slotIndex: number) => void;
  getSlotStyle: (slotIndex: number, hasLetter: boolean) => ViewStyle;
  onEnumerationItemDrop: (categoryIndex: number, item: string) => void;
  onEnumerationItemRemove?: (categoryIndex: number, item: string) => void;
  getItemStyle: (item: string, categoryIndex: number) => ViewStyle;
  getCategoryStyle: (categoryIndex: number) => ViewStyle;
  onMatchingItemMatch: (leftIndex: number, rightIndex: number) => void;
  onMatchingItemRemove: (leftIndex: number) => void;
  onMatchingItemSwap: (leftIndex: number, rightIndex: number) => void;
  getMatchStyle?: (leftIdx: number, rightIdx: number) => ViewStyle;
  onSyllableRemove: (orderIndex: number) => void;
  onSyllableReorder: (newOrder: number[]) => void;
  getSyllableStyle: (syllableIdx: number, isInAnswer: boolean) => ViewStyle;
  audioQueue: ReturnType<typeof useAudioQueue>;
  visible: boolean;
}

const WalkthroughableView = walkthroughable(View);
const WalkthroughableText = walkthroughable(Text);

const QuestionWrapper = memo(({
  question,
  answers,
  isAnswered,
  cluePositions,
  availableOptions,
  letterBank,
  availableLetters,
  availableMatchingItems,
  shuffledSyllableIndexes,
  onOptionSelect,
  onLetterPlace,
  onSlotTap,
  getSlotStyle,
  onEnumerationItemDrop,
  onEnumerationItemRemove,
  getItemStyle,
  getCategoryStyle,
  onMatchingItemMatch,
  onMatchingItemRemove,
  onMatchingItemSwap,
  getMatchStyle,
  onSyllableRemove,
  onSyllableReorder,
  getSyllableStyle,
  audioQueue,
  visible,
}: QuestionWrapperProps) => {
  const [showSpeed, setShowSpeed] = useState<boolean>(false);
  const { pause, resume, stop, isPlaying, isPaused } = audioQueue;

  const handleSpeak = useCallback(async (speed: "normal" | "slow") => {
    const jobs = buildJobsFromText(question.question, speed === "slow" ? 0.7 : 1);
    await audioQueue.playQueue(jobs);
    setShowSpeed(false);
  }, [buildJobsFromText, question.question, audioQueue]);

  const renderSpeaker = useCallback(() => {
    return (
      <>
        {isPlaying ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 10 }}>
            <TouchableOpacity onPress={() => (isPaused ? resume() : pause())}>
              <Image source={isPaused ? imageSrc.play : imageSrc.pause} style={{ width: 40, height: 40 }} resizeMode='contain' />
            </TouchableOpacity>
            <TouchableOpacity onPress={stop}>
              <Image source={imageSrc.gameX} style={{ width: 40, height: 40 }} resizeMode='contain' />
            </TouchableOpacity>
          </View>
        ): (
          <View style={{ position: 'relative' }}>
            <View style={{ alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <TouchableOpacity
                onPress={() => setShowSpeed(!showSpeed)}
                disabled={isPlaying && !isPaused}
              >
                <Image source={imageSrc.volume} style={{ width: 40, height: 40 }} resizeMode='contain' />
              </TouchableOpacity>
            </View>
            {showSpeed && (
              <View style={{ position: 'absolute', top: '100%', right: 0, transform: [{ translateX: 15 }], zIndex: 50, backgroundColor: '#003311', borderWidth: 2, borderColor: '#8a3903', borderRadius: 16, padding: 10, alignItems: 'center', gap: 8 }}>
                <TouchableOpacity onPress={() => handleSpeak("normal")}>
                  <Image source={imageSrc.normalSpeed} style={{ width: 50, height: 50 }} resizeMode='contain' />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleSpeak("slow")}>
                  <Image source={imageSrc.slowSpeed} style={{ width: 50, height: 50 }} resizeMode='contain' />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </>
    );
  }, [handleSpeak, isPlaying, isPaused, pause, resume, stop, showSpeed]);

  const renderQuestionType = useMemo(() => {
    switch (question.type) {
      case 'multiple':
        return (
          <MultipleChoiceType
            question={question}
            answers={answers}
            isAnswered={isAnswered}
            availableOptions={availableOptions}
            onOptionSelect={onOptionSelect!}
            renderSpeaker={renderSpeaker}
            setShowSpeed={setShowSpeed}
            showSpeed={showSpeed}
            visible={visible}
          />
        );
      case 'identification':
        return (
          <IdentificationType
            question={question}
            answers={answers}
            isAnswered={isAnswered}
            cluePositions={cluePositions}
            letterBank={letterBank}
            availableLetters={availableLetters}
            onLetterPlace={onLetterPlace!}
            onSlotTap={onSlotTap!}
            getSlotStyle={getSlotStyle!}
            setShowSpeed={setShowSpeed}
          />
        );
      case 'enumeration':
        return (
          <EnumerationType
            question={question}
            answers={answers}
            isAnswered={isAnswered}
            onItemDrop={onEnumerationItemDrop!}
            onItemRemove={onEnumerationItemRemove!}
            getItemStyle={getItemStyle!}
            getCategoryStyle={getCategoryStyle!}
            setShowSpeed={setShowSpeed}
          />
        );
      case 'matching':
        return (
          <MatchingType
            question={question}
            answers={answers}
            isAnswered={isAnswered}
            availableMatchingItems={availableMatchingItems}
            onItemMatch={onMatchingItemMatch!}
            onItemRemove={onMatchingItemRemove!}
            onItemSwap={onMatchingItemSwap!}
            getMatchStyle={getMatchStyle!}
            setShowSpeed={setShowSpeed}
          />
        );
      case 'syllable':
        return (
          <SyllableType
            question={question}
            answers={answers}
            isAnswered={isAnswered}
            cluePositions={cluePositions}
            shuffledSyllableIndexes={shuffledSyllableIndexes}
            onSyllableRemove={onSyllableRemove!}
            onSyllableReorder={onSyllableReorder!}
            getSyllableStyle={getSyllableStyle!}
            setShowSpeed={setShowSpeed}
          />
        );
      default:
        return (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#6b7280' }}>
              Unknown question type: {question.type}
            </Text>
          </View>
        );
    }
  }, [
    question,
    answers,
    isAnswered,
    cluePositions,
    availableOptions,
    letterBank,
    availableLetters,
    availableMatchingItems,
    shuffledSyllableIndexes,
    showSpeed,
    setShowSpeed,
    renderSpeaker,
    getCategoryStyle,
    getItemStyle,
    getMatchStyle,
    getSyllableStyle,
    getSlotStyle,
    onSlotTap,
    onOptionSelect,
    onLetterPlace,
    onEnumerationItemDrop,
    onEnumerationItemRemove,
    onMatchingItemMatch,
    onMatchingItemRemove,
    onSyllableRemove,
    onSyllableReorder,
  ]);

  return (
    <MotiView
      from={{ scale: 0.8, opacity: 0, translateY: 40 }}
      animate={{ scale: 1, opacity: 1, translateY: 0 }}
      exit={{ scale: 0.8, opacity: 0, translateY: -40 }}
      transition={{
        type: "timing",
        duration: 400,
      }}
      style={{ flex: 1 }}
      key={question.id}
    >
      <View style={{ flex: 1 }}>
        {question.type !== 'multiple' && question?.question && (
          <WalkthroughableView style={{
            flexDirection: 'row', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: 12,
            marginBottom: 8
          }}>
            <CopilotStep
              name="quiz-question"
              order={5}
              text="Makikita mo dito ang tanong na kailangan mong sagutin. Basahin ito nang mabuti!"
            >
              <WalkthroughableText style={{
                fontWeight: '900',
                color: '#2c3e50',
                textAlign: 'center',
                fontSize: 14
              }}>
                {question.question}
              </WalkthroughableText>
            </CopilotStep>
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
        {renderQuestionType}
      </View>
    </MotiView>
  );
});

export default QuestionWrapper;