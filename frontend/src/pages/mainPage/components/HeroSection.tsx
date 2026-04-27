import { Link, useNavigate } from 'react-router-dom';
import Icon from '@/commons/components/Icon';
import Button from '@/commons/components/Button';
import { useAuthStore, selectUser } from '@/commons/stores/authStore';
import { useToastStore, selectAddToast } from '@/commons/stores/toastStore';

export default function HeroSection() {
  const navigate = useNavigate();
  const user = useAuthStore(selectUser);
  const addToast = useToastStore(selectAddToast);

  const handleCreateBattle = () => {
    if (!user) {
      addToast({ message: '로그인 후 이용 가능합니다.' });
      return;
    }
    navigate('/battle/create');
  };

  return (
    <section className="flex flex-col gap-4 items-center">
      <div className="flex gap-6">
        <img src="logo.svg" alt="코문철 로고" className="w-16 h-16" />
        <h1 className="text-white text-6xl font-extrabold">코문철</h1>
      </div>

      <p className="text-gray-400">두 가지 코드 구현 중 어떤 게 더 나은지 실시간 투표로 결정하세요</p>

      <div className="mt-6 flex gap-3">
        <Button
          onClick={handleCreateBattle}
          className="shadow-[0_4px_6px_-4px_rgba(255,105,0,0.3),0_10px_15px_-3px_rgba(255,105,0,0.3)] hover:shadow-[0_0_25px_rgba(255,105,0,0.7)]"
        >
          <Icon name="battle" className="w-5 h-5 text-white" />새 배틀 생성
        </Button>

        <Link
          to="/tutorial/team-select"
          className="flex items-center rounded-xl px-5 py-3 bg-[#1A1A2E] border border-[#364153] hover:bg-[#20203A]"
        >
          튜토리얼
        </Link>
      </div>
    </section>
  );
}
