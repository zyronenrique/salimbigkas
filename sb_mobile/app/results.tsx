import React, { useCallback, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, useWindowDimensions, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useQuizContext } from "../hooks/quizContext";
import { useRouter } from "expo-router";
import { useQuizzesState } from "../hooks/useQuizzesState";
import { useSeatworksState } from "../hooks/useSeatworksState";
import { useSeatworkContext } from "../hooks/seatworkContext";
import { useClassContext } from "../hooks/classContext";

const Results = () => {
  const router = useRouter();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const { mode } = useClassContext();
  const { silentRefresh: quizSilentRefresh } = useQuizzesState();
  const { silentRefresh: seatworkSilentRefresh } = useSeatworksState();
  const { selectedQuiz, results: quizResults } = useQuizContext();
  const { selectedSeatwork, results: seatworkResults } = useSeatworkContext();

  const selected = mode === "seatwork" ? selectedSeatwork : selectedQuiz;
  const results = mode === "seatwork" ? seatworkResults : quizResults;
  const silentRefresh = mode === "seatwork" ? seatworkSilentRefresh : quizSilentRefresh;
  const totalScore = mode === "seatwork" ? seatworkResults.totalSeatworkScore : quizResults.totalQuizScore;
  
  if (!selected || !results) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: "#FFA600",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 24,
        paddingHorizontal: 8,
      }}>
        <ActivityIndicator size="large" color="#2C3E50" />
        <Text style={{ color: "#2C3E50", marginTop: 16, fontSize: 18, fontWeight: "bold", textAlign: "center" }}>Loading results...</Text>
      </View>
    );
  }

  const percentage = Math.round((results?.score / totalScore) * 100);

  const getPerformanceData = useMemo(() => {
    if (percentage >= 90) {
      return {
        icon: <MaterialCommunityIcons name="trophy" size={48} color="#eab308" />,
        message: "Outstanding! Perfect performance!",
        color: "#eab308",
        bgColor: "#fef9c3",
        borderColor: "#fde047"
      };
    } else if (percentage >= 80) {
      return {
        icon: <MaterialCommunityIcons name="medal" size={48} color="#22c55e" />,
        message: "Excellent work! Keep it up!",
        color: "#22c55e",
        bgColor: "#dcfce7",
        borderColor: "#bbf7d0"
      };
    } else if (percentage >= 60) {
      return {
        icon: <MaterialCommunityIcons name="target" size={48} color="#3b82f6" />,
        message: "Good job! You're getting there!",
        color: "#3b82f6",
        bgColor: "#dbeafe",
        borderColor: "#93c5fd"
      };
    } else {
      return {
        icon: <MaterialCommunityIcons name="target" size={48} color="#ef4444" />,
        message: "Keep practicing! You can do better!",
        color: "#ef4444",
        bgColor: "#fee2e2",
        borderColor: "#fecaca"
      };
    }
  }, [percentage]);

  const performance = getPerformanceData;

  // Render each question result
  const renderQuestionResult = useCallback((q: any, qIdx: number) => {
    let userAnswer: any;
    let correctAnswer: any;
    let isCorrect = false;
    let partialScore = 0;

    switch (q.type) {
      case "multiple":
        userAnswer = typeof results.answers[q.id] !== "undefined" ? q.options[results.answers[q.id]] : "";
        correctAnswer = q.options[q.numAnswer];
        isCorrect = results.answers[q.id] === q.numAnswer;
        break;
      case "identification":
        const cluePositions = results.answers[`${q.id}-cluePositions`] || [];
        const combinedAnswer = results.answers[`${q.id}-combined`] || "";
        const rawUserInput = results.answers[q.id];
        userAnswer = combinedAnswer.toUpperCase();
        correctAnswer = q.answer;
        isCorrect = combinedAnswer.toUpperCase() === correctAnswer.toUpperCase();
        partialScore = isCorrect ? 100 : 0;
        if (!isCorrect && correctAnswer && rawUserInput) {
          let correctCount = 0;
          let userIndex = 0;
          for (let i = 0; i < correctAnswer.length; i++) {
            if (!cluePositions.includes(i)) {
              if (
                userIndex < rawUserInput.length &&
                rawUserInput[userIndex]?.toUpperCase() === correctAnswer[i]?.toUpperCase()
              ) {
                correctCount++;
              }
              userIndex++;
            }
          }
          const totalUserPositions = correctAnswer.length - cluePositions.length;
          partialScore = totalUserPositions > 0 ? Math.round((correctCount / totalUserPositions) * 100) : 0;
        }
        break;
      case "enumeration":
        const boxesObj = results.answers[`${q.id}-boxes`] || {};
        const boxesArr = Array.isArray(boxesObj)
          ? boxesObj
          : Object.values(boxesObj);
        const correctItemsData = q.correctItems || {};
        userAnswer = boxesArr.map((box: string[], boxIdx: number) => ({
          category: q?.categories[boxIdx] || `Category ${boxIdx + 1}`,
          items: box || []
        }));
        correctAnswer = Object.keys(correctItemsData).map(categoryName => ({
          category: categoryName,
          items: correctItemsData[categoryName] || []
        }));
        let correctItemsCount = 0;
        let totalItemsCount = 0;
        Object.values(correctItemsData).forEach((items: any) => {
          if (Array.isArray(items)) {
            totalItemsCount += items.length;
          }
        });
        Object.keys(correctItemsData).forEach((categoryName, catIdx) => {
          const correctItems = correctItemsData[categoryName] || [];
          const userItems = boxesArr[catIdx] || [];
          correctItems.forEach((correctItem: string) => {
            if (userItems.includes(correctItem)) {
              correctItemsCount++;
            }
          });
        });
        partialScore = totalItemsCount > 0 ? Math.round((correctItemsCount / totalItemsCount) * 100) : 0;
        isCorrect = partialScore === 100;
        break;
      case "matching":
        const userMatches = results.answers[q.id] || [];
        const correctMatches = q.matches || [];
        userAnswer = (q.leftItems || []).map((leftItem: string, leftIdx: number) => ({
          left: leftItem,
          right:
            userMatches[leftIdx] !== null && userMatches[leftIdx] !== undefined
              ? q.rightItems?.[userMatches[leftIdx]] || "No match"
              : "No match"
        }));
        correctAnswer = (q.leftItems || []).map((leftItem: string, leftIdx: number) => ({
          left: leftItem,
          right:
            correctMatches[leftIdx] !== null && correctMatches[leftIdx] !== undefined
              ? q.rightItems?.[correctMatches[leftIdx]] || "No match"
              : "No match"
        }));
        let correctMatchesCount = 0;
        correctMatches.forEach((correctMatch: number, leftIdx: number) => {
          if (userMatches[leftIdx] === correctMatch) {
            correctMatchesCount++;
          }
        });
        partialScore = correctMatches.length > 0 ? Math.round((correctMatchesCount / correctMatches.length) * 100) : 0;
        isCorrect = partialScore === 100;
        break;
      case "syllable":
        const targetWord = q.targetWord || "";
        const userSyllableOrder = results.answers[`${q.id}-0`] || [];
        const correctSyllableParts = q.syllableParts || [];
        const syllableCluePositions = results.answers[`${q.id}-syllableCluePositions`] || [];
        const userArrangedSyllables = userSyllableOrder.map((index: number) => correctSyllableParts[index] || "");
        const userArrangement = userArrangedSyllables.join("");
        const isWordCorrect = userArrangement.toLowerCase().trim() === targetWord.toLowerCase().trim();
        if (!isWordCorrect) {
          let correctSyllablesCount = 0;
          let totalUserSyllables = 0;
          for (let i = 0; i < correctSyllableParts.length; i++) {
            if (!syllableCluePositions.includes(i)) {
              totalUserSyllables++;
              if (i < userArrangedSyllables.length && userArrangedSyllables[i] === correctSyllableParts[i]) {
                correctSyllablesCount++;
              }
            }
          }
          partialScore = totalUserSyllables > 0 ? Math.round((correctSyllablesCount / totalUserSyllables) * 100) : 0;
        } else {
          partialScore = 100;
        }
        userAnswer = {
          target: targetWord,
          userArrangement: userArrangement || "No arrangement",
          userSyllables: userArrangedSyllables,
          correctSyllables: correctSyllableParts,
          cluePositions: syllableCluePositions,
          isCorrect: isWordCorrect
        };
        correctAnswer = {
          target: targetWord,
          syllables: correctSyllableParts,
          cluePositions: syllableCluePositions
        };
        isCorrect = isWordCorrect;
        break;
      default:
        userAnswer = "Unknown question type";
        correctAnswer = "Unknown question type";
        isCorrect = false;
    }
    return (
      <View
        key={q.id}
        style={{
          backgroundColor: isCorrect
            ? "#bbf7d0"
            : partialScore > 0
            ? "#fef9c3"
            : "#fee2e2",
          borderLeftWidth: 6,
          borderLeftColor: isCorrect
            ? "#16a34a"
            : partialScore > 0
            ? "#eab308"
            : "#dc2626",
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <Text
            style={{
              backgroundColor: isCorrect
                ? "#bbf7d0"
                : partialScore > 0
                ? "#fef9c3"
                : "#fee2e2",
              color: isCorrect
                ? "#16a34a"
                : partialScore > 0
                ? "#eab308"
                : "#dc2626",
              fontWeight: "bold",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 4,
              marginRight: 8,
            }}
          >
            Q{qIdx + 1}
          </Text>
          <Text style={{ flex: 1, fontWeight: "bold", fontSize: 16, color: "#1e293b" }}>
            {q?.question}
          </Text>
          {isCorrect ? (
            <MaterialIcons name="check" size={24} color="#16a34a" />
          ) : partialScore > 0 ? (
            <MaterialCommunityIcons name="lightning-bolt" size={24} color="#eab308" />
          ) : (
            <MaterialIcons name="close" size={24} color="#dc2626" />
          )}
        </View>
        {q.image && (
          <View style={{ alignItems: "center", marginBottom: 8 }}>
            <Image
              source={{ uri: q.image }}
              style={{
                width: 180,
                height: 120,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: "#f59e42",
              }}
              resizeMode='cover'
            />
          </View>
        )}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "bold", color: "#2C3E50", marginBottom: 2 }}>Your Answer:</Text>
            <View style={{ backgroundColor: "#fff", borderRadius: 8, padding: 8, borderWidth: 1, borderColor: "#e5e7eb" }}>
              {renderAnswerContent(userAnswer, q.type, false)}
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "bold", color: "#16a34a", marginBottom: 2 }}>Correct Answer:</Text>
            <View style={{ backgroundColor: "#dcfce7", borderRadius: 8, padding: 8, borderWidth: 1, borderColor: "#bbf7d0" }}>
              {renderAnswerContent(correctAnswer, q.type, true)}
            </View>
          </View>
        </View>
      </View>
    );
  }, [results.answers]);

  // Helper to render answer content
  const renderAnswerContent = useCallback((answer: any, type: string, isCorrect: boolean) => {
    if (!answer || (Array.isArray(answer) && answer.length === 0)) {
      return <Text style={{ fontStyle: "italic", color: "#6b7280" }}>No answer provided</Text>;
    }
    switch (type) {
      case "identification":
        return <Text style={{ fontSize: 16, fontWeight: "semibold", color: isCorrect ? "#16a34a" : "#1e293b" }}>{String(answer)}</Text>;
      case "enumeration":
        if (Array.isArray(answer)) {
          return (
            <View>
              {answer.map((category: any, idx: number) => (
                <View key={idx} style={{ marginBottom: 4 }}>
                  <Text style={{ fontWeight: "bold", color: "#2563eb" }}>
                    {category?.category || `Category ${idx + 1}`}:
                  </Text>
                  <Text style={{ marginLeft: 8, color: "#1e293b" }}>
                    {category?.items && category?.items.length > 0 ? (
                      <View>
                        {category?.items.map((item: string, idx: number) => (
                          <Text key={idx} style={{ fontSize: 16, fontWeight: "semibold", marginBottom: 2 }}>
                            • {item}
                          </Text>
                        ))}
                      </View>
                    ) : (
                      "No items"
                    )}
                  </Text>
                </View>
              ))}
            </View>
          );
        }
        return <Text>{String(answer)}</Text>;
      case "matching":
        if (Array.isArray(answer)) {
          return (
            <View>
              {answer.map((match: any, idx: number) => (
                <View key={idx} style={{ flexWrap: "wrap", flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                  <Text style={{ fontWeight: "bold", color: "#1e293b", minWidth: 80 }}>{match.left}</Text>
                  <Text style={{ color: "#6b7280", marginHorizontal: 8 }}>→</Text>
                  <Text style={{ fontSize: 16, color: "#1e293b" }}>{match.right}</Text>
                </View>
              ))}
            </View>
          );
        }
        return <Text style={{ fontSize: 16 }}>{String(answer)}</Text>;
      case "syllable":
        if (typeof answer === "object" && answer !== null) {
          return (
            <View>
              <Text style={{ fontWeight: "bold", color: "#1e293b" }}>
                Target Word: <Text style={{ fontSize: 18, color: "#16a34a" }}>{answer.target}</Text>
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 4 }}>
                {(answer.syllables || answer.userSyllables || []).map((syllable: string, idx: number) => (
                  <View
                    key={idx}
                    style={{
                      backgroundColor: answer.cluePositions?.includes(idx)
                        ? "#fde047"
                        : answer.isCorrect
                        ? "#bbf7d0"
                        : "#fecaca",
                      borderRadius: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      marginRight: 4,
                      marginBottom: 4,
                      borderWidth: 1,
                      borderColor: answer.cluePositions?.includes(idx)
                        ? "#eab308"
                        : answer.isCorrect
                        ? "#16a34a"
                        : "#dc2626"
                    }}
                  >
                    <Text style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: answer.cluePositions?.includes(idx)
                        ? "#a16207"
                        : answer.isCorrect
                        ? "#15803d"
                        : "#991b1b"
                    }}>
                      {syllable}
                    </Text>
                  </View>
                ))}
              </View>
              {answer.userArrangement && (
                <Text style={{ fontStyle: "italic", color: "#64748b", marginTop: 4 }}>
                  Your Arrangement: {answer.userArrangement}
                </Text>
              )}
            </View>
          );
        }
        return <Text>{String(answer)}</Text>;
      default:
        return <Text style={{ fontSize: 16, fontWeight: "semibold", color: "#1e293b" }}>{String(answer)}</Text>;
    }
  }, [results.answers]);

  // Stats
  const fullyCorrectCount = useMemo(() => selected?.questions.reduce((count: number, q: any) => {
    let isFullyCorrect = false;
    switch (q.type) {
      case "multiple":
        isFullyCorrect = results.answers[q.id] === q.numAnswer;
        break;
      case "identification":
        const combinedAnswer = results.answers[`${q.id}-combined`] || "";
        isFullyCorrect = combinedAnswer.toUpperCase() === q.answer?.toUpperCase();
        break;
      case "enumeration":
        const boxesObj = results.answers[`${q.id}-boxes`] || {};
        const boxesArr = Array.isArray(boxesObj) ? boxesObj : Object.values(boxesObj);
        const correctItemsData = q.correctItems || {};
        let correctItemsCount = 0;
        let totalItemsCount = 0;
        Object.values(correctItemsData).forEach((items: any) => {
          if (Array.isArray(items)) {
            totalItemsCount += items.length;
          }
        });
        Object.keys(correctItemsData).forEach((categoryName, catIdx) => {
          const correctItems = correctItemsData[categoryName] || [];
          const userItems = boxesArr[catIdx] || [];
          correctItems.forEach((correctItem: string) => {
            if (userItems.includes(correctItem)) {
              correctItemsCount++;
            }
          });
        });
        isFullyCorrect = correctItemsCount === totalItemsCount;
        break;
      case "matching":
        const userMatches = results.answers[q.id] || [];
        const correctMatches = q.matches || [];
        let correctMatchesCount = 0;
        correctMatches.forEach((correctMatch: number, leftIdx: number) => {
          if (userMatches[leftIdx] === correctMatch) {
            correctMatchesCount++;
          }
        });
        isFullyCorrect = correctMatchesCount === correctMatches.length;
        break;
      case "syllable":
        const userSyllableOrder = results.answers[`${q.id}-0`] || [];
        const correctSyllableParts = q.syllableParts || [];
        const userArrangedSyllables = userSyllableOrder.map((index: number) => correctSyllableParts[index] || "");
        const userArrangement = userArrangedSyllables.join("");
        isFullyCorrect = userArrangement.toLowerCase().trim() === q.targetWord?.toLowerCase().trim();
        break;
    }
    return count + (isFullyCorrect ? 1 : 0);
  }, 0), [results.answers, selected?.questions]);

  const partiallyCorrectCount = useMemo(() => selected?.questions.reduce((count: number, q: any) => {
    let isPartiallyCorrect = false;
    switch (q.type) {
      case "identification":
        const cluePositions = results.answers[`${q.id}-cluePositions`] || [];
        const combinedAnswer = results.answers[`${q.id}-combined`] || "";
        const rawUserInput = results.answers[q.id] || "";
        const isFullyCorrect = combinedAnswer.toUpperCase() === q.answer?.toUpperCase();
        if (!isFullyCorrect && rawUserInput && q.answer) {
          let correctCount = 0;
          let userIndex = 0;
          for (let i = 0; i < q.answer.length; i++) {
            if (!cluePositions.includes(i)) {
              if (
                userIndex < rawUserInput.length &&
                rawUserInput[userIndex]?.toUpperCase() === q.answer[i]?.toUpperCase()
              ) {
                correctCount++;
              }
              userIndex++;
            }
          }
          const totalUserPositions = q.answer.length - cluePositions.length;
          const partialScore = totalUserPositions > 0 ? correctCount / totalUserPositions : 0;
          isPartiallyCorrect = partialScore > 0 && partialScore < 1;
        }
        break;
      case "enumeration":
        const boxesObj = results.answers[`${q.id}-boxes`] || {};
        const boxesArr = Array.isArray(boxesObj) ? boxesObj : Object.values(boxesObj);
        const correctItemsData = q.correctItems || {};
        let correctItemsCount = 0;
        let totalItemsCount = 0;
        Object.values(correctItemsData).forEach((items: any) => {
          if (Array.isArray(items)) {
            totalItemsCount += items.length;
          }
        });
        Object.keys(correctItemsData).forEach((categoryName, catIdx) => {
          const correctItems = correctItemsData[categoryName] || [];
          const userItems = boxesArr[catIdx] || [];
          correctItems.forEach((correctItem: string) => {
            if (userItems.includes(correctItem)) {
              correctItemsCount++;
            }
          });
        });
        const enumPartialScore = totalItemsCount > 0 ? correctItemsCount / totalItemsCount : 0;
        isPartiallyCorrect = enumPartialScore > 0 && enumPartialScore < 1;
        break;
      case "matching":
        const userMatches = results.answers[q.id] || [];
        const correctMatches = q.matches || [];
        let correctMatchesCount = 0;
        correctMatches.forEach((correctMatch: number, leftIdx: number) => {
          if (userMatches[leftIdx] === correctMatch) {
            correctMatchesCount++;
          }
        });
        const matchPartialScore = correctMatches.length > 0 ? correctMatchesCount / correctMatches.length : 0;
        isPartiallyCorrect = matchPartialScore > 0 && matchPartialScore < 1;
        break;
      case "syllable":
        const userSyllableOrder = results.answers[`${q.id}-0`] || [];
        const correctSyllableParts = q.syllableParts || [];
        const syllableCluePositions = results.answers[`${q.id}-syllableCluePositions`] || [];
        const userArrangedSyllables = userSyllableOrder.map((index: number) => correctSyllableParts[index] || "");
        const userArrangement = userArrangedSyllables.join("");
        const isWordCorrect = userArrangement.toLowerCase().trim() === q.targetWord?.toLowerCase().trim();
        if (!isWordCorrect) {
          let correctSyllablesCount = 0;
          let totalUserSyllables = 0;
          for (let i = 0; i < correctSyllableParts.length; i++) {
            if (!syllableCluePositions.includes(i)) {
              totalUserSyllables++;
              if (i < userArrangedSyllables.length && userArrangedSyllables[i] === correctSyllableParts[i]) {
                correctSyllablesCount++;
              }
            }
          }
          const syllablePartialScore = totalUserSyllables > 0 ? correctSyllablesCount / totalUserSyllables : 0;
          isPartiallyCorrect = syllablePartialScore > 0;
        }
        break;
    }
    return count + (isPartiallyCorrect ? 1 : 0);
  }, 0), [results.answers, selected?.questions]);

  const incorrectCount = useMemo(() => selected?.questions.length - fullyCorrectCount - partiallyCorrectCount, [fullyCorrectCount, partiallyCorrectCount, selected?.questions.length]);

  return (
    <View style={{
      flex: 1,
      backgroundColor: "#FFA600",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 24,
      paddingHorizontal: 8,
    }}>
      {/* Close Button */}
      <TouchableOpacity
        onPress={async() => {
          await silentRefresh();
          router.replace(mode === "seatwork" ? "/seatwork/Seatworks" : "/quiz/Quizzes");
        }}
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          margin: 18,
          backgroundColor: "#2C3E50",
          borderRadius: 32,
          padding: 12,
          elevation: 4,
          zIndex: 10,
        }}
        accessibilityLabel="Close results"
      >
        <MaterialCommunityIcons name="close-box" size={32} color="#fff" />
      </TouchableOpacity>

      <ScrollView
        style={{
          width: "100%",
          maxWidth: SCREEN_WIDTH - 12,
          alignSelf: "center",
          backgroundColor: "#2C3E50",
          borderRadius: 24,
          padding: 24,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          elevation: 8,
        }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 16 }}>
          <Text style={{
            fontSize: 32,
            fontWeight: "bold",
            color: "#fff",
            marginBottom: 4,
            textAlign: "center"
          }}>
            {selected?.category} Results
          </Text>
        </View>

        {/* Score Section */}
        <View style={{
          backgroundColor: performance.bgColor,
          borderColor: performance.borderColor,
          borderWidth: 2,
          borderRadius: 20,
          padding: 24,
          marginBottom: 24,
          alignItems: "center",
        }}>
          {performance.icon}
          <Text style={{ fontSize: 36, fontWeight: "bold", color: "#2C3E50", marginTop: 8 }}>
            {results.score.toFixed(0)} <Text style={{ fontSize: 18 }}>pts.</Text>
          </Text>
          <Text style={{ fontSize: 20, fontWeight: "600", color: "#64748b", marginTop: 4 }}>
            {percentage}% Score
          </Text>
          <Text style={{ fontSize: 14, color: "#64748b", marginTop: 2 }}>
            ({fullyCorrectCount} questions fully correct)
          </Text>
          <Text style={{ fontSize: 16, color: performance.color, marginTop: 8 }}>
            {performance.message}
          </Text>
          {/* Progress Bar */}
          <View style={{
            width: "100%",
            height: 8,
            backgroundColor: "#e5e7eb",
            borderRadius: 4,
            marginTop: 12,
            overflow: "hidden"
          }}>
            <View style={{
              height: "100%",
              width: `${percentage}%`,
              backgroundColor: percentage >= 80 ? "#16a34a" : percentage >= 60 ? "#3b82f6" : "#dc2626",
              borderRadius: 4,
            }} />
          </View>
        </View>

        {/* Questions Review */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{
            fontSize: 22,
            fontWeight: "bold",
            color: "#fff",
            textAlign: "center",
            paddingBottom: 4,
            marginBottom: 12,
          }}>
            Detailed Review
          </Text>
          {selected?.questions.map((q: any, qIdx: number) => renderQuestionResult(q, qIdx))}
        </View>

        {/* Summary Stats */}
        <View style={{
          flexDirection: "row",
          justifyContent: "space-between",
          backgroundColor: "#f3f4f6",
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
        }}>
          <View style={{ alignItems: "center", flex: 1, padding: 8 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#16a34a" }}>{results.score.toFixed(0)}</Text>
            <Text style={{ fontSize: 12, color: "#15803d" }}>Total Score</Text>
          </View>
          <View style={{ alignItems: "center", flex: 1, padding: 8 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#3b82f6" }}>{fullyCorrectCount}</Text>
            <Text style={{ fontSize: 12, color: "#2563eb" }}>Fully Correct</Text>
          </View>
          <View style={{ alignItems: "center", flex: 1, padding: 8 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#eab308" }}>{partiallyCorrectCount}</Text>
            <Text style={{ fontSize: 12, color: "#a16207" }}>Partially Correct</Text>
          </View>
          <View style={{ alignItems: "center", flex: 1, padding: 8 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#dc2626" }}>{incorrectCount}</Text>
            <Text style={{ fontSize: 12, color: "#991b1b" }}>Incorrect</Text>
          </View>
          <View style={{ alignItems: "center", flex: 1, padding: 8 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#64748b" }}>{results.totalQuestions}</Text>
            <Text style={{ fontSize: 12, color: "#64748b" }}>Total Questions</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Results;