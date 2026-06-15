import { Routes, Route } from "react-router-dom";
import LevelSelection from "../components/Bigkas/LevelSelection";
import ModeSelection from "../components/Bigkas/ModeSelection";
import PlayBigkas from "../components/Bigkas/PlayBigkas";
import GameCompleted from "../components/Bigkas/GameCompleted";

const BigkasRoutes = () => (
  <Routes>
    <Route path="select-level" element={<LevelSelection />} />
    <Route path=":level/select-mode" element={<ModeSelection />} />
    <Route path=":level/:mode/:playingId?" element={<PlayBigkas />} />
    <Route path="completed" element={<GameCompleted />} />
  </Routes>
);

export default BigkasRoutes;