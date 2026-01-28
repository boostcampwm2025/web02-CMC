import { Play, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import onBoardingBackgroundImage from '/public/images/gameLogo.png';

export default function GameTitleSection() {
  const navigate = useNavigate();

  const handleScrollDown = () => {
    window.scrollBy({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section className="relative h-screen !w-screen snap-start snap-always flex items-end justify-center pb-[12vh]">
      <div className="absolute inset-0 !w-screen left-1/2 -translate-x-1/2 bg-[#0a0b14]">
        <img src={onBoardingBackgroundImage} alt="CMC Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0b14]/30 to-[#0a0b14]" />
      </div>

      <div className="relative z-10">
        <div className="flex gap-8 items-center justify-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl cursor-pointer"
          >
            <Play fill="currentColor" size={20} />
            <span>입장하기</span>
          </button>

          <button
            onClick={handleScrollDown}
            className="flex items-center gap-2 px-8 py-4 bg-[#1a1b26] rounded-xl cursor-pointer"
          >
            <span>더 알아보기</span>
            <ChevronDown size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
