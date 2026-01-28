import Carousel from '@/commons/components/Carousel';
import OnBoardingIntroduceCard from '@/pages/onboardingPage/components/OnBoardingIntroduceCard';
import { ChevronDown } from 'lucide-react';

export default function GameIntroduceSection() {
  const handleScrollDown = () => {
    window.scrollBy({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section className="relative min-h-screen w-screen !ml-[calc(-50vw+50%)] snap-start snap-always flex flex-col justify-between py-16 pb-24 overflow-hidden">
      <div className="absolute inset-0 !w-screen left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#0a0b14] via-[#0f1020] to-[#0a0b14]">
        <div className="absolute inset-0 opacity-[0.08]">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_50px,rgba(251,146,60,0.4)_50px,rgba(251,146,60,0.4)_52px)]" />
        </div>

        <div className="absolute top-1/2 left-0 w-80 h-80 bg-yellow-500/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-orange-500/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-[150px]" />
      </div>

      <h2 className="relative z-10">
        <span className="text-yellow-500 font-bold text-4xl">코문철 </span>
        <span className="text-white font-bold text-4xl">게임소개</span>
      </h2>
      <div className="relative z-10 mx-auto w-[55rem] h-[32rem] max-w-[85%] shadow-2xl">
        <Carousel>
          <OnBoardingIntroduceCard
            image="/public/images/onBoarding/bigTitle.png"
            description="주어지는 주제에 맞춰 두 팀이 코드를 분석하고 토론하는 실시간 토론을 진행해보세요."
          />
          <OnBoardingIntroduceCard
            image="/public/images/onBoarding/gameChat.png"
            description="실시간 채팅을 통해 팀원들과 전략을 논의하고, 코드의 문제점을 함께 파헤치며 최적의 솔루션을 찾아내세요."
          />
          <OnBoardingIntroduceCard
            image="/public/images/onBoarding/teamSelect.png"
            description="두 팀으로 나뉘어, 각자의 코드를 분석하고 토론하며 최고의 해결책을 제시하세요."
          />
          <OnBoardingIntroduceCard
            image="/public/images/onBoarding/attack.png"
            description="상대의 코드의 문제점을 파악하고, 이의를 제기 하세요! 효과적인 공격은 팀의 승리를 이끌어냅니다."
          />
          <OnBoardingIntroduceCard
            image="/public/images/onBoarding/gameResult.png"
            description="배틀이 끝난 후, 상세한 분석 결과와 피드백을 확인하세요. 승패를 떠나 한 단계 더 성장하는 계기가 될 것입니다."
          />
        </Carousel>
      </div>
      <button
        onClick={handleScrollDown}
        className="relative z-10 mx-auto cursor-pointer text-white hover:text-orange-400 transition-colors"
      >
        <ChevronDown size={28} />
      </button>
    </section>
  );
}
