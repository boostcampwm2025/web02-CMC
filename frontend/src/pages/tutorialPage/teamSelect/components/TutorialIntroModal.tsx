import Button from '@/commons/components/Button';

interface TutorialIntroModalProps {
  isOpen: boolean;
  step: 0 | 1;
  onNext: () => void;
  onStart: () => void;
}

export default function TutorialIntroModal({ isOpen, step, onNext, onStart }: TutorialIntroModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-orange-500/40 bg-[#121726] shadow-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-orange-300">튜토리얼</span>
          <span className="text-[0.625rem] text-gray-400">{step + 1} / 2</span>
        </div>
        {step === 0 && (
          <>
            <h2 className="text-xl font-bold mb-3">튜토리얼에 오신 것을 환영합니다!</h2>
            <p className="text-sm text-[#C5CBD6] leading-relaxed">
              실제 배틀에 들어가기 전에, 진영 선택 흐름을 차근차근 체험해볼게요.
            </p>
          </>
        )}
        {step === 1 && (
          <>
            <h2 className="text-xl font-bold mb-3">진영 선택 튜토리얼</h2>
            <ul className="text-sm text-[#C5CBD6] space-y-2">
              <li>1) 상황 요약에서 ‘if 한 줄 vs 블록’ 주제를 확인합니다.</li>
              <li>2) 참고 자료에서 핵심 개념과 팀별 관점을 확인합니다.</li>
              <li>3) 쟁점과 타임라인으로 핵심 주장들을 살펴봅니다.</li>
              <li>4) 마지막 단계에서 A/B/중립을 선택하고 배틀로 이동합니다.</li>
            </ul>
          </>
        )}
        <div className="mt-6">
          {step === 0 && (
            <Button
              type="button"
              onClick={onNext}
              fullWidth
              className="h-11 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#FF6900] to-[#FB2C36]"
            >
              다음
            </Button>
          )}
          {step === 1 && (
            <Button
              type="button"
              onClick={onStart}
              fullWidth
              className="h-11 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#FF6900] to-[#FB2C36]"
            >
              시작하기
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
