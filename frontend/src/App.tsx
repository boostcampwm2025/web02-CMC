import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useEffect } from 'react';
import BattleCreatePage from './pages/battleCreatePage';
import MainPage from './pages/mainPage';
import BattlePage from './pages/battlePage';
import TeamSelectPage from './pages/teamSelectPage';
import fetchBattleInfo from './commons/apis/getBattleInfo';
import './App.css';
import BattleResultPage from './pages/battleResultPage';
import LoginPage from './pages/loginPage';
import { useAuthStore } from './commons/stores/authStore';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />
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
  const getOAuthUser = useAuthStore((state) => state.getOAuthUser);

  // 앱 시작 시 OAuth 인증 상태 확인 (한 번만 실행)
  useEffect(() => {
    getOAuthUser().catch(() => {
      // OAuth 인증 실패는 무시 (비회원일 수 있음)
    });
  }, [getOAuthUser]);

  return <RouterProvider router={router} />;
}

export default App;
