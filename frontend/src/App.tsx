import { createBrowserRouter, RouterProvider, redirect } from 'react-router-dom';
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
import { useAuthStore } from './commons/stores/authStore';
import GlobalErrorBoundary from './commons/components/ErrorBoundary/GlobalErrorBoundary';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />,
    errorElement: <ErrorPage />
  },
  {
    path: '/onboarding',
    element: <OnboardingPage />
  },
  {
    path: '/error',
    element: <ErrorPage />
  },
  {
    path: '/error',
    element: <ErrorPage />
  },
  {
    path: '/nickname',
    element: <NicknamePage />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/battle/:id',
    element: <BattlePage />
  },
  {
    path: '/battle/:id/team-select',
    element: <TeamSelectPage />
  },
  {
    path: '/battle/create',
    element: <BattleCreatePage />,
    errorElement: <ErrorPage />,
    loader: async () => {
      const oauthUser = await useAuthStore.getState().getOAuthUser();
      if (!oauthUser) {
        alert('로그인이 필요합니다.');
        return redirect('/login');
      }
      return null;
    }
  },
  {
    path: '/tutorial/team-select',
    element: <TutorialTeamSelectPage />,
    errorElement: <ErrorPage />,
    loader: () => TUTORIAL_BATTLE_INFO
  },
  {
    path: '/tutorial/battle',
    element: <TutorialBattlePage />
  },
  {
    path: '/battles/:inviteCode',
    element: <InvitePage />
  },
  {
    path: '/battles/:id/result',
    element: <BattleResultPage />
  }
]);

function App() {
  return (
    <GlobalErrorBoundary>
      <ToastContainer />
      <RouterProvider router={router} />
    </GlobalErrorBoundary>
  );
}

export default App;
