import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import BattleCreatePage from './pages/battleCreatePage';
import MainPage from './pages/mainPage';
import BattlePage from './pages/battlePage';
import TeamSelectPage from './pages/teamSelectPage';
import fetchBattleInfo from './pages/battlePage/apis/getBattleInfo';
import './App.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />
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
    element: <TeamSelectPage />
  },
  {
    path: '/battle/create',
    element: <BattleCreatePage />
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
