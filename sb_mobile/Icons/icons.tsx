import { MotiView } from "moti";
import { JSX } from "react";
import { Image } from "react-native";

export const imageSrc: Record<string, any> = {
  homeTab: require("../assets/images/tab/homeTab.png"),
  lessonTab: require("../assets/images/tab/lessonTab.png"),
  bigkasTab: require("../assets/images/tab/bigkasTab.png"),
  seatworkTab: require("../assets/images/tab/seatworkTab.png"),
  quizTab: require("../assets/images/tab/quizTab.png"),
  profileTab: require("../assets/images/tab/profileTab.png"),
  leaderboard: require("../assets/images/leaderboard.png"),
  leaderboardBg: require("../assets/images/leaderboardbg.png"),
  googleLogo: require("../assets/images/google.png"),
  loading: require("../assets/images/loading.png"),
  salimbigkasWhite: require("../assets/images/sb-icon-white.png"),
  man: require("../assets/images/man.png"),
  woman: require("../assets/images/woman.png"),
  back: require("../assets/images/back.png"),
  email: require("../assets/images/email.png"),
  emailSlope: require("../assets/images/emailSlope.png"),
  password: require("../assets/images/password.png"),
  name: require("../assets/images/name.png"),
  role: require("../assets/images/role.png"),
  gradeLevel: require("../assets/images/gradeLevel.png"),
  restricted: require("../assets/images/restricted.png"),
  aiQuiz: require("../assets/images/ai-generated-quiz.png"),
  aiQuizPeeking: require("../assets/images/ai-generated-quiz-peeking.png"),
  robotInstruction: require("../assets/images/robot-instruction.png"),
  seatwork: require("../assets/images/seatwork.png"),
  quiz: require("../assets/images/quiz.png"),
  check: require("../assets/images/check.png"),
  checkBox: require("../assets/images/checkBox.png"),
  errorBox: require("../assets/images/errorBox.png"),
  locked: require("../assets/images/locked.png"),
  clock: require("../assets/images/clock.png"),
  image: require("../assets/images/image.png"),
  blackboard: require("../assets/images/small_students-blackboard.png"),
  blackboardLevel: require("../assets/images/blackboardlevel.png"),
  lessThan: require("../assets/images/lessThan.png"),
  greaterThan: require("../assets/images/greaterThan.png"),
  bigkas: require("../assets/images/bigkas.png"),
  gameInfo: require("../assets/images/gameInfo.png"),
  thinkRobot: require("../assets/images/think-robot.png"),
  blackboardMode: require("../assets/images/blackboardmode.png"),
  star: require("../assets/images/star.png"),
  refresh: require("../assets/images/refresh.png"),
  lesson: require("../assets/images/lesson.png"),
  lessonbg: require("../assets/images/lessonbg.png"),
  book: require("../assets/images/book.png"),
  bell: require("../assets/images/bell.png"),
  bookgirl: require("../assets/images/bookgirl.png"),
  colorboy: require("../assets/images/colorboy.png"),
  cryRobot: require("../assets/images/cry-robot.png"),
  volume: require("../assets/images/volume.png"),
  normalSpeed: require("../assets/images/normalSpeed.png"),
  slowSpeed: require("../assets/images/slowSpeed.png"),
  play: require("../assets/images/play.png"),
  playBox: require("../assets/images/playBox.png"),
  saveBox: require("../assets/images/saveBox.png"),
  pause: require("../assets/images/pause.png"),
  slash: require("../assets/images/slash.png"),
  plus: require("../assets/images/plus.png"),
  gameX: require("../assets/images/gameX.png"),
  settings: require("../assets/images/settings.png"),
  happyRobot: require("../assets/images/happy-robot.png"),
  angryRobot: require("../assets/images/angry-robot.png"),
  firstTryHero: require("../assets/images/badges/first-try-hero.png"),
  persistencePro: require("../assets/images/badges/persistence-pro.png"),
  topicMaster: require("../assets/images/badges/topic-master.png"),
  streakStar: require("../assets/images/badges/streak-star.png"),
  speedster: require("../assets/images/badges/speedster.png"),
  perfectionist: require("../assets/images/badges/perfectionist.png"),
  nightOwl: require("../assets/images/badges/night-owl.png"),
  earlyBird: require("../assets/images/badges/early-bird.png"),
  quizCollector: require("../assets/images/badges/quiz-collector.png"),
  quizLegend: require("../assets/images/badges/quiz-legend.png"),
  instantRecall: require("../assets/images/badges/instant-recall.png"),
  optionOracle: require("../assets/images/badges/option-oracle.png"),
  perfectSequence: require("../assets/images/badges/perfect-sequence.png"),
  linkMaster: require("../assets/images/badges/link-master.png"),
  syllableSnapper: require("../assets/images/badges/syllable-snapper.png"),
  bigBrain: require("../assets/images/badges/big-brain.png"),
  noMisfit: require("../assets/images/badges/no-misfit.png"),
  syllableSorcerer: require("../assets/images/badges/syllable-sorcerer.png"),
  tagalogChampion: require("../assets/images/trophies/salitang-tagalog-champion.png"),
  trophyBox: require("../assets/images/trophy-box.png"),
  refreshBox: require("../assets/images/refreshBox.png"),
  schoolTrophy: require("../assets/images/trophies/schoolTrophy.png"),
  starTrophy: require("../assets/images/trophies/starTrophy.png"),
  trophy1: require("../assets/images/trophies/trophy1.png"),
  trophy2: require("../assets/images/trophies/trophy2.png"),
  trophy3: require("../assets/images/trophies/trophy3.png"),
  number0: require("../assets/images/numbers/number0.png"),
  number1: require("../assets/images/numbers/number1.png"),
  number2: require("../assets/images/numbers/number2.png"),
  number3: require("../assets/images/numbers/number3.png"),
  number4: require("../assets/images/numbers/number4.png"),
  number5: require("../assets/images/numbers/number5.png"),
  number6: require("../assets/images/numbers/number6.png"),
  number7: require("../assets/images/numbers/number7.png"),
  number8: require("../assets/images/numbers/number8.png"),
  number9: require("../assets/images/numbers/number9.png"),
  number10: require("../assets/images/numbers/number10.png"),
  letterA: require("../assets/images/cc-letters/letterA.png"),
  letterB: require("../assets/images/cc-letters/letterB.png"),
  letterC: require("../assets/images/cc-letters/letterC.png"),
  letterD: require("../assets/images/cc-letters/letterD.png"),
  letterE: require("../assets/images/cc-letters/letterE.png"),
  letterF: require("../assets/images/cc-letters/letterF.png"),
  letterG: require("../assets/images/cc-letters/letterG.png"),
  letterH: require("../assets/images/cc-letters/letterH.png"),
  letterI: require("../assets/images/cc-letters/letterI.png"),
  letterJ: require("../assets/images/cc-letters/letterJ.png"),
  letterK: require("../assets/images/cc-letters/letterK.png"),
  letterL: require("../assets/images/cc-letters/letterL.png"),
  letterM: require("../assets/images/cc-letters/letterM.png"),
  letterN: require("../assets/images/cc-letters/letterN.png"),
  letterO: require("../assets/images/cc-letters/letterO.png"),
  letterP: require("../assets/images/cc-letters/letterP.png"),
  letterQ: require("../assets/images/cc-letters/letterQ.png"),
  letterR: require("../assets/images/cc-letters/letterR.png"),
  letterS: require("../assets/images/cc-letters/letterS.png"),
  letterT: require("../assets/images/cc-letters/letterT.png"),
  letterU: require("../assets/images/cc-letters/letterU.png"),
  letterV: require("../assets/images/cc-letters/letterV.png"),
  letterW: require("../assets/images/cc-letters/letterW.png"),
  letterX: require("../assets/images/cc-letters/letterX.png"),
  letterY: require("../assets/images/cc-letters/letterY.png"),
  letterZ: require("../assets/images/cc-letters/letterZ.png"),
};

export const SpinLoading = ({size}: {size?: number}): JSX.Element => (
  <Image
    source={imageSrc.loading}
    alt="Loading"
    style={{ width: size, height: size }}
  />
);

export const loadingDot = (): JSX.Element => {
  return (
    <MotiView
      style={{
        flex: 1,
        flexDirection: 'row',
        gap: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2C3E50',
        height: '100%',
      }}
    >
      {[0, 1, 2].map((i) => (
        <MotiView
          key={i}
          from={{ translateY: 0 }}
          animate={{ translateY: -30 }}
          transition={{
            type: 'timing',
            duration: 800,
            repeat: Infinity,
            repeatReverse: true,
            delay: i * 120,
          }}
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#ffffff',
            marginHorizontal: 6,
          }}
        />
      ))}
    </MotiView>
  );
};
