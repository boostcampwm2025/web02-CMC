const SERVICE_VALUES = [
  {
    id: 1,
    title: '사람 냄새나는 코드',
    description: '단순한 기계적 리뷰가 아닌, 개발자의 의도와 맥락을 이해하는 따뜻한 조언을 주고받습니다.'
  },
  {
    id: 2,
    title: '논쟁의 구조화',
    description: '생산적인 토론을 위해 체계적인 배틀 시스템을 제공하여 더 나은 결론을 도출합니다.'
  },
  {
    id: 3,
    title: '지속적인 참여 유도',
    description: '게이미피케이션 요소를 통해 코드 리뷰를 하나의 즐거운 문화로 정착시킵니다.'
  },
  {
    id: 4,
    title: '학습 가능한 결과물',
    description: '배틀 종료 후 제공되는 상세 리포트를 통해 승패를 떠나 모두가 성장할 수 있습니다.'
  }
];

export default function ServiceValueSection() {
  return (
    <section className="h-screen w-full snap-start snap-always flex flex-col items-center justify-center py-20 ">
      <div className="text-center mb-20 space-y-4 px-4">
        <span className="text-orange-500 font-bold tracking-wider uppercase text-sm">Service & Values</span>
        <h2 className="text-4xl font-bold text-white">
          왜 <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">코문철</span>
          인가요?
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto hidden md:block">
          단순한 코드 리뷰를 넘어, 치열한 논쟁과 합의 과정을 통해 <br />
          진정한 엔지니어링 실력을 키우는 배틀 아레나입니다.
        </p>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto md:hidden">
          치열한 논쟁과 합의를 통해 성장하는 배틀 아레나입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 px-8 max-w-[90rem] w-full">
        {SERVICE_VALUES.map((value) => (
          <div
            key={value.id}
            className="group relative bg-[#1a1b23] rounded-2xl p-8 hover:bg-[#20212b]  border border-white/5"
          >
            <div className="text-6xl font-black text-white/5 group-hover:text-orange-500/10 transition-colors absolute top-4 right-6 select-none">
              0{value.id}
            </div>

            <div className="relative z-10 mt-8 h-full flex flex-col">
              <h3 className="text-lg font-bold text-white mb-4 group-hover:text-orange-400 transition-colors">
                {value.title}
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed group-hover:text-gray-300">{value.description}</p>
            </div>

            <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-orange-500 to-red-600 group-hover:w-full transition-all duration-500 rounded-b-2xl" />
          </div>
        ))}
      </div>
    </section>
  );
}
