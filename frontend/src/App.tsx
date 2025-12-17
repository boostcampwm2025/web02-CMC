import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './pages/mainPage';
import TeamSelectPage from './pages/teamSelectPage';
import BattleCreatePage from './pages/battleCreatePage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/team-select" element={<TeamSelectPage />} />
        <Route path="/battle/create" element={<BattleCreatePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
