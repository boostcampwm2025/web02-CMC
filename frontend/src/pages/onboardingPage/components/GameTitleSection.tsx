import { Play, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GameTitleSection() {
  const navigate = useNavigate();

  const handleScrollDown = () => {
    window.scrollBy({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section className="h-screen w-full snap-start snap-always flex flex-col items-center justify-center text-center px-4">
      <h1 className="flex flex-col items-center font-bold tracking-tight">
        <span className="text-white text-7xl mb-2">코드 리뷰</span>
        <span className="bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent text-8xl">
          배틀 아레나
        </span>
      </h1>

      <p className="mt-8 text-gray-400 text-lg md:text-xl font-medium max-w-2xl">
        두 개의 코드가 맞붙는 치열한 대결, 당신의 선택이 승부를 결정합니다
      </p>

      <div className="mt-12 flex flex-col sm:flex-row gap-4 items-center">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-orange-500/30 cursor-pointer"
        >
          <Play fill="currentColor" size={20} />
          <span>입장하기</span>
        </button>

        <button
          onClick={handleScrollDown}
          className="flex items-center gap-2 px-8 py-4 bg-[#1a1b26] hover:bg-[#242636] border border-gray-700 text-gray-200 rounded-2xl font-medium text-lg transition-colors cursor-pointer"
        >
          <span>더 알아보기</span>
          <ChevronDown size={20} />
        </button>
      </div>
    </section>
  );
}
