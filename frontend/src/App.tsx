import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import BattleCreatePage from './pages/battleCreatePage';
import MainPage from './pages/mainPage';
import BattlePage from './pages/battlePage';
import TeamSelectPage from './pages/teamSelectPage';
import InvitePage from './pages/invitePage';
import './App.css';
import BattleResultPage from './pages/battleResultPage';
import LoginPage from './pages/loginPage';
import NicknamePage from './pages/nicknamePage';
import OnboardingPage from './pages/onboardingPage';
import TutorialTeamSelectPage from './pages/tutorialTeamSelectPage';
import TutorialBattlePage from './pages/tutorialBattlePage';
import { TUTORIAL_BATTLE_INFO } from './pages/tutorial/const/tutorialBattle';
import { ToastContainer } from './commons/components/toast/ToastContainer';
import ErrorPage from './pages/errorPage';

const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <MainPage /> },
      { path: 'onboarding', element: <OnboardingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'nickname', element: <NicknamePage /> },
      { path: 'error', element: <ErrorPage /> },
      {
        path: 'battle/create',
        element: <BattleCreatePage />
      },
      { path: 'battle/:id', element: <BattlePage /> },
      { path: 'battle/:id/team-select', element: <TeamSelectPage /> },
      {
        path: 'tutorial/team-select',
        element: <TutorialTeamSelectPage />,
        loader: () => TUTORIAL_BATTLE_INFO
      },
      { path: 'tutorial/battle', element: <TutorialBattlePage /> },
      { path: 'battles/:inviteCode', element: <InvitePage /> },
      { path: 'battles/:id/result', element: <BattleResultPage /> }
    ]
  }
]);

function App() {
  return (
    <>
      <ToastContainer />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
