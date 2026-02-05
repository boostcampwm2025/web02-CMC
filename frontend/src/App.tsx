import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useEffect, Suspense } from 'react';
import * as Sentry from '@sentry/react';
import BattleCreatePage from './pages/battleCreatePage';
import MainPage from './pages/mainPage';
import BattlePage from './pages/battlePage';
import TeamSelectPage from './pages/teamSelectPage';
import InvitePage from './pages/invitePage';
import BattleResultPage from './pages/battleResultPage';
import LoginPage from './pages/loginPage';
import NicknamePage from './pages/nicknamePage';
import EntryPage from './pages/entryPage';
import TutorialTeamSelectPage from './pages/tutorialTeamSelectPage';
import ErrorPage from './pages/errorPage';
import TutorialBattlePage from './pages/tutorialBattlePage';
import { TUTORIAL_BATTLE_INFO } from './pages/tutorial/const/tutorialBattle';
import { ToastContainer } from './commons/components/toast/ToastContainer';
import LoadingModal from './commons/components/LoadingModal';
import { useAuthStore } from './commons/stores/authStore';
import './App.css';

const sentryCreateBrowserRouter = Sentry.wrapCreateBrowserRouterV6(createBrowserRouter);

const router = sentryCreateBrowserRouter([
  {
    path: '/',
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Navigate to="/entry" replace /> },
      { path: 'entry', element: <EntryPage /> },
      { path: 'main', element: <MainPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'nickname', element: <NicknamePage /> },
      { path: 'error', element: <ErrorPage /> },
      {
        path: 'battle/create',
        element: <BattleCreatePage />
      },
      {
        path: 'battle/:id',
        element: (
          <Suspense fallback={<LoadingModal isOpen={true} message="배틀 정보를 불러오는 중..." />}>
            <BattlePage />
          </Suspense>
        )
      },
      { path: 'battle/:id/team-select', element: <TeamSelectPage /> },
      {
        path: 'tutorial/team-select',
        element: <TutorialTeamSelectPage />,
        loader: () => TUTORIAL_BATTLE_INFO
      },
      { path: 'tutorial/battle', element: <TutorialBattlePage />, loader: () => TUTORIAL_BATTLE_INFO },
      { path: 'battles/:inviteCode', element: <InvitePage /> },
      {
        path: 'battles/:id/result',
        element: (
          <Suspense fallback={<LoadingModal isOpen={true} message="배틀 결과를 불러오는 중..." />}>
            <BattleResultPage />
          </Suspense>
        )
      }
    ]
  }
]);

function App() {
  const getOAuthUser = useAuthStore((state) => state.getOAuthUser);

  useEffect(() => {
    getOAuthUser();
  }, [getOAuthUser]);

  return (
    <>
      <ToastContainer />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
