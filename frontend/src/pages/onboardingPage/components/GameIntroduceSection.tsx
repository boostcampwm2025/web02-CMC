import Carousel from '@/commons/components/Carousel';
import OnBoardingIntroduceCard from '@/pages/onboardingPage/components/OnBoardingIntroduceCard';

export default function GameIntroduceSection() {
  return (
    <section className="h-screen snap-start snap-always flex flex-col justify-between py-12">
      <h2>
        <span className="text-yellow-500 font-bold text-4xl">코문철 </span>
        <span className="text-white font-bold text-4xl">게임소개</span>
      </h2>
      <div className="mx-auto w-[70rem] h-[40rem]">
        <Carousel>
          <OnBoardingIntroduceCard
            image="/public/images/bigTitle.png"
            description="주어지는 주제에 맞춰 두 팀이 코드를 분석하고 토론하는 실시간 토론을 진행해보세요."
          />
          <OnBoardingIntroduceCard
            image="/public/images/gameChat.png"
            description="실시간 채팅을 통해 팀원들과 전략을 논의하고, 코드의 문제점을 함께 파헤치며 최적의 솔루션을 찾아내세요."
          />
          <OnBoardingIntroduceCard
            image="/public/images/teamSelect.png"
            description="두 팀으로 나뉘어, 각자의 코드를 분석하고 토론하며 최고의 해결책을 제시하세요."
          />
          <OnBoardingIntroduceCard
            image="/public/images/attack.png"
            description="상대의 코드의 문제점을 파악하고, 이의를 제기 하세요! 효과적인 공격은 팀의 승리를 이끌어냅니다."
          />
          <OnBoardingIntroduceCard
            image="/public/images/gameResult.png"
            description="배틀이 끝난 후, 상세한 분석 결과와 피드백을 확인하세요. 승패를 떠나 한 단계 더 성장하는 계기가 될 것입니다."
          />
        </Carousel>
      </div>
      <button> 아래 버튼</button>
    </section>
  );
}
