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

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />,
    loader: async () => {
      // OAuth 로그인 후 리다이렉트 시 인증 상태 확인
      return await useAuthStore.getState().getOAuthUser();
    }
  },
  {
    path: '/auth/callback',
    element: <OAuthCallbackPage />
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
    element: <BattlePage />,
    loader: async ({ params }) => {
      const data = await fetchBattleInfo(params.id!);
      if (!data) throw new Response('Battle not found', { status: 404 });
      return data;
    }
  },
  {
    path: '/battle/:id/team-select/',
    element: <TeamSelectPage />,
    loader: async ({ params }) => {
      const data = await fetchBattleInfo(params.id!);
      if (!data) throw new Response('Battle not found', { status: 404 });
      return data;
    }
  },
  {
    path: '/battle/create',
    element: <BattleCreatePage />
  },
  {
    path: '/battle/:id/result',
    element: <BattleResultPage />
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
