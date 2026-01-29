import { createBrowserRouter, RouterProvider, redirect } from 'react-router-dom';
import BattleCreatePage from './pages/battleCreatePage';
import MainPage from './pages/mainPage';
import BattlePage from './pages/battlePage';
import TeamSelectPage from './pages/teamSelectPage';
import InvitePage from './pages/invitePage';
import fetchBattleInfo from './commons/apis/getBattleInfo';
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

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />,
    errorElement: <ErrorPage />
  },
  {
    path: '/onboarding',
    element: <OnboardingPage />,
    errorElement: <ErrorPage />
  },
  {
    path: '/error',
    element: <ErrorPage />
  },
  {
    path: '/nickname',
    element: <NicknamePage />,
    errorElement: <ErrorPage />,
    loader: async () => {
      // OAuth 로그인 후 리다이렉트 시 인증 상태 확인
      await useAuthStore.getState().getOAuthUser();
      return null;
    }
  },
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <ErrorPage />
  },
  {
    path: '/battle/:id',
    element: <BattlePage />,
    errorElement: <ErrorPage />,
    loader: async ({ params }) => {
      const data = await fetchBattleInfo(params.id!);
      if (!data) throw new Response('Battle not found', { status: 404 });
      return data;
    }
  },
  {
    path: '/battle/:id/team-select/',
    element: <TeamSelectPage />,
    errorElement: <ErrorPage />,
    loader: async ({ params }) => {
      const data = await fetchBattleInfo(params.id!);
      if (!data) throw new Response('Battle not found', { status: 404 });
      return data;
    }
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
    element: <TutorialBattlePage />,
    errorElement: <ErrorPage />,
    loader: () => TUTORIAL_BATTLE_INFO
  },
  {
    path: '/battles/:inviteCode',
    element: <InvitePage />,
    errorElement: <ErrorPage />
  },
  {
    path: '/battles/:id/result',
    element: <BattleResultPage />,
    errorElement: <ErrorPage />
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
