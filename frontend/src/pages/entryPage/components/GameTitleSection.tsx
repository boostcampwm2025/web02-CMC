import Icon from '@/commons/components/Icon';
import { useNavigate } from 'react-router-dom';
import Button from '@/commons/components/Button';
import onBoardingBackgroundImage from '/images/onBoarding/gameLogo.png';
import onBoardingPeoplesImage1 from '/images/onBoarding/onBoardingPeople1.png';
import onBoardingPeoplesImage2 from '/images/onBoarding/onBoardingPeople2.png';

export default function GameTitleSection() {
  const navigate = useNavigate();

  const handleScrollDown = () => {
    window.scrollBy({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section className="relative h-screen w-screen snap-start snap-always flex items-end justify-center pb-[12vh] !ml-[calc(-50vw+50%)] overflow-hidden">
      <div className="absolute inset-0 w-screen bg-[#0a0b14] flex items-center justify-center">
        <img
          src={onBoardingBackgroundImage}
          alt="CMC Background"
          className="absolute max-w-8xl w-full h-auto object-contain z-0"
        />
        <div className="absolute bottom-[25%] min-[1600px]:bottom-[28%] min-[1920px]:bottom-[25%] left-1/2 -translate-x-1/2 flex gap-8 z-10">
          <img
            src={onBoardingPeoplesImage1}
            alt="People Left"
            className="w-[11rem] h-auto object-contain animate-character-wiggle"
          />
          <img
            src={onBoardingPeoplesImage2}
            alt="People Right"
            className="w-[11rem] h-auto object-contain animate-character-wiggle"
            style={{ animationDelay: '0.5s' }}
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-b from-transparent to-[#0a0b14] z-20" />
      </div>

      <div className="relative z-30">
        <div className="flex gap-12 items-center justify-center">
          <Button
            onClick={() => navigate('/main')}
            size="lg"
            className="text-xl bg-gradient-to-r from-orange-500 to-red-600 border border-orange-300 shadow-[0_10px_40px_rgba(251,146,60,0.6)]"
          >
            <Icon name="play" className="w-5 h-5" />
            <span>입장하기</span>
          </Button>

          <Button
            onClick={handleScrollDown}
            size="lg"
            variant="ghost"
            className="text-xl bg-[#1a1b26] border-gray-600 shadow-[0_10px_40px_rgba(0,0,0,0.7)]"
          >
            <span>더 알아보기</span>
            <Icon name="chevronDown" className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
