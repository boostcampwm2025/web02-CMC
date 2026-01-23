import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import BattleCreatePage from './pages/battleCreatePage';
import MainPage from './pages/mainPage';
import BattlePage from './pages/battlePage';
import TeamSelectPage from './pages/teamSelectPage';
import fetchBattleInfo from './commons/apis/getBattleInfo';
import './App.css';
import BattleResultPage from './pages/battleResultPage';
import LoginPage from './pages/loginPage';
import NicknamePage from './pages/nicknamePage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import { useAuthStore } from './commons/stores/authStore';
import { ToastContainer } from './commons/components/toast/ToastContainer';
import ErrorPage from './pages/errorPage';
import { useEffect } from 'react';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />,
    errorElement: <ErrorPage />
    // loader: async () => {
    //   // OAuth 로그인 후 리다이렉트 시 인증 상태 확인
    //   return await useAuthStore.getState().getOAuthUser();
    // }
  },
  {
    path: '/error',
    element: <ErrorPage />
  },
  {
    path: '/auth/callback',
    element: <OAuthCallbackPage />,
    errorElement: <ErrorPage />
  },
  {
    path: '/nickname',
    element: <NicknamePage />,
    errorElement: <ErrorPage />
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
    errorElement: <ErrorPage />
  },
  {
    path: '/battle/:id/result',
    element: <BattleResultPage />,
    errorElement: <ErrorPage />
  }
]);

function App() {
  useEffect(() => {
    async function getUserInfo() {
      await useAuthStore.getState().getOAuthUser();
    }

    getUserInfo();
  }, []);

  return (
    <>
      <ToastContainer />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
