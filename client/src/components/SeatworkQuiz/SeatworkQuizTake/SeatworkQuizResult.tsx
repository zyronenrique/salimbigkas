import { SquareX, Check, X, Trophy, Medal, Target, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/authContext";
import { useSeatworkQuizContext } from "../../../hooks/seatworkQuizContext";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useCallback, useMemo } from "react";
import { useLogReg } from "../../Modals/LogRegProvider";
import { useClassContext } from "../../../hooks/classContext";

const SeatworkQuizResult = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { formattedGradeLevel } = useLogReg();
  const { selectedQuiz, selectedSeatwork, quizResults, seatworkResults } = useSeatworkQuizContext();
  const { isSeatWork } = useClassContext();

  const selected = isSeatWork ? selectedSeatwork : selectedQuiz;
  const results = isSeatWork ? seatworkResults : quizResults;
  const totalScore = isSeatWork ? seatworkResults.totalSeatworkScore : quizResults.totalQuizScore;

  const percentage = Math.round((results.score / totalScore) * 100);
  const getPerformanceData = useMemo(() => {
    if (percentage >= 90) {
      return {
        icon: <Trophy size={48} className="text-yellow-500" />,
        message: "Outstanding! Perfect performance!",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-400"
      };
    } else if (percentage >= 80) {
      return {
        icon: <Medal size={48} className="text-green-500" />,
        message: "Excellent work! Keep it up!",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-400"
      };
    } else if (percentage >= 60) {
      return {
        icon: <Target size={48} className="text-blue-500" />,
        message: "Good job! You're getting there!",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-400"
      };
    } else {
      return {
        icon: <Target size={48} className="text-red-500" />,
        message: "Keep practicing! You can do better!",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-400"
      };
    }
  }, [percentage]);
  const performance = getPerformanceData;
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
              if (userIndex < rawUserInput.length && 
                rawUserInput[userIndex]?.toUpperCase() === correctAnswer[i]?.toUpperCase()) {
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
        const boxesArr = Array.isArray(boxesObj) ? boxesObj : Object.values(boxesObj);
        const correctItemsData = q.correctItems || {};
        userAnswer = boxesArr.map((box: string[], boxIdx: number) => ({
          category: q.categories[boxIdx] || `Category ${boxIdx + 1}`,
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
          right: userMatches[leftIdx] !== null && userMatches[leftIdx] !== undefined 
            ? q.rightItems?.[userMatches[leftIdx]] || "No match"
            : "No match"
        }));
        correctAnswer = (q.leftItems || []).map((leftItem: string, leftIdx: number) => ({
          left: leftItem,
          right: correctMatches[leftIdx] !== null && correctMatches[leftIdx] !== undefined
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
        const userArrangedSyllables = userSyllableOrder.map((index: number) => correctSyllableParts[index] || '');
        const userArrangement = userArrangedSyllables.join('');
        const isWordCorrect = userArrangement.toLowerCase().trim() === targetWord.toLowerCase().trim();
        if (!isWordCorrect) {
          let correctSyllablesCount = 0;
          let totalUserSyllables = 0;
          for (let i = 0; i < correctSyllableParts.length; i++) {
            if (!syllableCluePositions.includes(i)) {
              totalUserSyllables++;
              if (i < userArrangedSyllables.length && 
                  userArrangedSyllables[i] === correctSyllableParts[i]) {
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
      <div
        key={q.id}
        className={`p-6 rounded-xl shadow-lg border-l-8 transition-all duration-300 ${
          isCorrect
            ? "border-green-500 bg-green-50 hover:bg-green-100"
            : partialScore > 0
            ? "border-yellow-500 bg-yellow-50 hover:bg-yellow-100"
            : "border-red-500 bg-red-50 hover:bg-red-100"
        }`}
      >
        <div className="mb-4 font-bold text-lg text-gray-800 flex items-center text-left gap-3">
          <span
            className={`rounded-full px-3 py-1 text-sm font-bold shadow-md ${
              isCorrect
                ? "bg-green-100 text-green-700"
                : partialScore > 0
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            Q{qIdx + 1}
          </span>
          <span className="flex-1">{q.question}</span>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${
              isCorrect ? 'text-green-600' : partialScore > 0 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {q.type.charAt(0).toUpperCase() + q.type.slice(1)}
            </span>
            {partialScore > 0 && partialScore < 100 && (
              <span className={`text-xs font-bold px-2 py-1 rounded-full bg-yellow-200 text-yellow-800`}>
                {partialScore}%
              </span>
            )}
            {isCorrect ? (
              <Check className="text-green-500" size={24} strokeWidth={3} />
            ) : partialScore > 0 ? (
              <span className="text-yellow-500 text-xl">⚡</span>
            ) : (
              <X className="text-red-500" size={24} strokeWidth={3} />
            )}
          </div>
        </div>

        {q.image && (
          <div className="flex justify-center mb-4">
            <img
              loading="lazy"
              src={q.image}
              alt={`Question ${qIdx + 1} illustration`}
              className="rounded-lg shadow-md max-h-48 border-2 border-orange-400 object-contain"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* User Answer */}
          <div className="space-y-2">
            <div className="text-gray-700 font-semibold text-base flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              Your Answer:
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              {renderAnswerContent(userAnswer, q.type, false)}
            </div>
          </div>

          {/* Correct Answer */}
          <div className="space-y-2">
            <div className="text-gray-700 font-semibold text-base flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Correct Answer:
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              {renderAnswerContent(correctAnswer, q.type, true)}
            </div>
          </div>
        </div>
      </div>
    );
  }, [results.answers]);
  const renderAnswerContent = useCallback((answer: any, type: string, isCorrect: boolean) => {
    const textColor = isCorrect ? "text-green-700" : "text-gray-700";
    
    if (!answer || (Array.isArray(answer) && answer.length === 0)) {
      return <span className="italic text-gray-400">No answer provided</span>;
    }

    switch (type) {
      case "identification":
        if (typeof answer === 'string') {
          return <span className={`font-medium ${textColor}`}>{answer}</span>;
        }
        return <span className={textColor}>{String(answer)}</span>;

      case "enumeration":
        if (Array.isArray(answer)) {
          return (
            <div className="space-y-3">
              {answer.map((category: any, idx: number) => (
                <div key={idx} className="border-l-4 border-blue-300 pl-3">
                  <div className={`font-semibold ${textColor}`}>
                    {category.category || `Category ${idx + 1}`}:
                  </div>
                  <div className="ml-2 text-sm">
                    {category.items && category.items.length > 0 
                      ? category.items.join(", ")
                      : "No items"
                    }
                  </div>
                </div>
              ))}
            </div>
          );
        }
        return <span className={textColor}>{String(answer)}</span>;

      case "matching":
        if (Array.isArray(answer)) {
          return (
            <div className="space-y-2">
              {answer.map((match: any, idx: number) => (
                <div key={idx} className="grid grid-cols-3 items-center text-left gap-2 text-sm">
                  <span className={`font-bold ${textColor}`}>{match.left}</span>
                  <span className="text-gray-400 text-center">→</span>
                  <span className={textColor}>{match.right}</span>
                </div>
              ))}
            </div>
          );
        }
        return <span className={textColor}>{String(answer)}</span>;

      case "syllable":
        if (typeof answer === 'object' && answer !== null) {
          if (isCorrect) {
            // Show correct answer with clue highlighting
            return (
              <div className="space-y-3">
                <div className="border-l-4 border-green-300 pl-3">
                  <span className={textColor}>Target Word: </span>
                  <span className="font-bold text-green-600">{answer.target}</span>
                </div>
                <div className="border-l-4 border-green-300 pl-3 flex flex-col items-center">
                  <span className={textColor}>Syllables: </span>
                  <div className="flex gap-1 mt-1">
                    {answer.syllables?.map((syllable: string, idx: number) => (
                      <span
                        key={idx}
                        className={`px-2 py-1 rounded text-sm font-medium ${
                          answer.cluePositions?.includes(idx)
                            ? 'bg-yellow-200 text-yellow-800 border border-yellow-400'
                            : 'bg-green-200 text-green-800'
                        }`}
                      >
                        {syllable}
                        {answer.cluePositions?.includes(idx) && (
                          <Lightbulb size={12} className="inline ml-1" />
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          } else {
            // Show user's attempt
            return (
              <div className="space-y-3">
                <div className="border-l-4 border-purple-300 pl-3">
                  <span className={textColor}>Your Arrangement: </span>
                  <span className={`font-mono ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {answer.userArrangement || "No arrangement"}
                  </span>
                </div>
                {answer.userSyllables && answer.userSyllables.length > 0 && (
                    <div className="border-l-4 border-purple-300 pl-3 flex flex-col items-center">
                      <span className={textColor}>Syllable Order: </span>
                      <div className="flex gap-1 mt-1">
                        {answer.userSyllables.map((syllable: string, idx: number) => {
                          const isCluePosition = answer.cluePositions?.includes(idx);
                          const isCorrectPosition = syllable === answer.correctSyllables?.[idx];
                          return (
                            <span
                              key={idx}
                              className={`px-2 py-1 rounded text-sm font-medium ${
                                isCluePosition
                                  ? 'bg-yellow-200 text-yellow-800 border border-yellow-400'
                                  : isCorrectPosition
                                  ? 'bg-green-200 text-green-800'
                                  : 'bg-red-200 text-red-800'
                              }`}
                            >
                              {syllable}
                              {isCluePosition && (
                                <Lightbulb size={12} className="inline ml-1" />
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
              </div>
            );
          }
        }
        return <span className={textColor}>{String(answer)}</span>;

      default:
        return <span className={`font-medium ${textColor}`}>{String(answer)}</span>;
    }
  }, [results.answers]);
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
        const userArrangedSyllables = userSyllableOrder.map((index: number) => correctSyllableParts[index] || '');
        const userArrangement = userArrangedSyllables.join('');
        isFullyCorrect = userArrangement.toLowerCase().trim() === q.targetWord?.toLowerCase().trim();
        break;
    }
    
    return count + (isFullyCorrect ? 1 : 0);
  }, 0), [results.answers]);
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
              if (userIndex < rawUserInput.length && 
                rawUserInput[userIndex]?.toUpperCase() === q.answer[i]?.toUpperCase()) {
                correctCount++;
              }
              userIndex++;
            }
          }
          const totalUserPositions = q.answer.length - cluePositions.length;
          const partialScore = totalUserPositions > 0 ? (correctCount / totalUserPositions) : 0;
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
        const enumPartialScore = totalItemsCount > 0 ? (correctItemsCount / totalItemsCount) : 0;
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
        
        const matchPartialScore = correctMatches.length > 0 ? (correctMatchesCount / correctMatches.length) : 0;
        isPartiallyCorrect = matchPartialScore > 0 && matchPartialScore < 1;
        break;
        
      case "syllable":
        const userSyllableOrder = results.answers[`${q.id}-0`] || [];
        const correctSyllableParts = q.syllableParts || [];
        const syllableCluePositions = results.answers[`${q.id}-syllableCluePositions`] || [];
        const userArrangedSyllables = userSyllableOrder.map((index: number) => correctSyllableParts[index] || '');
        const userArrangement = userArrangedSyllables.join('');
        const isWordCorrect = userArrangement.toLowerCase().trim() === q.targetWord?.toLowerCase().trim();
        
        if (!isWordCorrect) {
          let correctSyllablesCount = 0;
          let totalUserSyllables = 0;
          for (let i = 0; i < correctSyllableParts.length; i++) {
            if (!syllableCluePositions.includes(i)) {
              totalUserSyllables++;
              if (i < userArrangedSyllables.length && 
                  userArrangedSyllables[i] === correctSyllableParts[i]) {
                correctSyllablesCount++;
              }
            }
          }
          const syllablePartialScore = totalUserSyllables > 0 ? (correctSyllablesCount / totalUserSyllables) : 0;
          isPartiallyCorrect = syllablePartialScore > 0;
        }
        break;
    }
    
    return count + (isPartiallyCorrect ? 1 : 0);
  }, 0), [results.answers]);
  // Add Incorrect count
  const incorrectCount = useMemo(() => selected?.questions.length - fullyCorrectCount - partiallyCorrectCount, [fullyCorrectCount, partiallyCorrectCount, selected?.questions.length]);
  return (
    <div className={`relative w-full min-h-[90vh] flex items-center justify-center ${role !== "Student" ? "bg-[#F8F8F8]" : "bg-[#FFA600]"}`}>
      <div className="flex items-center justify-center py-2 relative">
        <div className="flex items-center justify-center h-full z-30">
          <nav className="bg-[#2C3E50] w-20 rounded-l-3xl shadow-2xl p-12 flex items-center justify-center border border-[#2C3E50]/30">
            <div className="flex flex-col gap-6 items-center">
              <button
                type="button"
                className="relative w-14 h-14 flex flex-col items-center justify-center rounded-full font-semibold text-base transition-all duration-200 bg-[#2C3E50] text-white hover:bg-[#34495e] hover:scale-105 shadow-lg group"
                onClick={() => navigate(`/${role?.toLowerCase()}/${formattedGradeLevel}/${isSeatWork ? 'seatworks/select-seatwork' : 'quizzes/select-quiz'}`)}
                aria-label="Close results"
                title="Close results"
              >
                <SquareX size={28} />
                <span className="absolute left-18 bg-[#2C3E50] text-white px-6 py-4 rounded-r-lg shadow-lg text-base font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  Close Results
                </span>
              </button>
            </div>
          </nav>
        </div>

        <OverlayScrollbarsComponent
          options={{ scrollbars: { autoHide: "leave" } }}
          defer 
          className="relative z-10 w-full min-w-full max-w-4xl mx-auto bg-[#2C3E50] rounded-2xl shadow-2xl p-10 space-y-10 max-h-[90vh] overflow-y-scroll transition-all duration-300"
        >
          {/* Header */}
          <h2 className="text-2xl text-left font-bold text-[#fff] drop-shadow-lg tracking-wide">
            Results
          </h2>
          <div className="text-center space-y-4 mb-6">
            <div className="text-[#fff] text-5xl font-extrabold">
              {selected?.category || "General Quiz"}
            </div>
          </div>

          {/* Score Section */}
          <div className={`${performance.bgColor} ${performance.borderColor} border-2 rounded-2xl p-8 text-center space-y-4`}>
            <div className="flex justify-center">
              {performance.icon}
            </div>
            <div className="space-y-2">
              <div className="text-6xl font-bold text-[#2C3E50]">
                {results.score.toFixed(0)}
                <span className="text-lg font-bold"> pts.</span>
              </div>
              <div className="text-2xl font-semibold text-gray-600">
                {percentage}% Score
              </div>
              <div className="text-sm text-gray-500">
                ({fullyCorrectCount} questions fully correct)
              </div>
              <div className={`text-lg font-medium ${performance.color}`}>
                {performance.message}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ease-out ${
                  percentage >= 80 ? 'bg-green-500' : 
                  percentage >= 60 ? 'bg-blue-500' : 'bg-red-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Questions Review */}
          <div className="space-y-6 mt-6">
            <h3 className="text-2xl font-bold text-[#fff] text-center border-b-2 border-gray-600 pb-4">
              Detailed Review
            </h3>
            {selected?.questions.map((q: any, qIdx: number) => renderQuestionResult(q, qIdx))}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-5 gap-3 mt-6 pt-6 border-t-2 border-gray-600">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{results.score.toFixed(0)}</div>
              <div className="text-xs text-green-700 font-medium">Total Score</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{fullyCorrectCount}</div>
              <div className="text-xs text-blue-700 font-medium">Fully Correct</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{partiallyCorrectCount}</div>
              <div className="text-xs text-yellow-700 font-medium">Partially Correct</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{incorrectCount}</div>
              <div className="text-xs text-red-700 font-medium">Incorrect</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{results.totalQuestions}</div>
              <div className="text-xs text-gray-700 font-medium">Total Questions</div>
            </div>
          </div>
        </OverlayScrollbarsComponent>
      </div>
    </div>
  );
}

export default SeatworkQuizResult;
