import Icon from '@/commons/components/Icon';
import Button from '@/commons/components/Button';

interface TutorialModalProps {
  isOpen: boolean;
  onStart: () => void;
  dontShowAgain: boolean;
  onDontShowAgainChange: (value: boolean) => void;
}

export default function TutorialModal({ isOpen, onStart, dontShowAgain, onDontShowAgainChange }: TutorialModalProps) {
  if (!isOpen) return null;

  const handleStart = () => {
    onStart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative max-w-md rounded-2xl bg-[#1E2432] border border-[#2D3648] shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <div className="w-15 h-15 rounded-full bg-gradient-to-br from-[#FF6900] to-[#FB2C36] flex items-center justify-center">
            <Icon name="question" className="w-10 h-10 text-white" />
          </div>
        </div>

        <h2 className="text-center text-2xl font-bold text-white mb-4">배틀 페이지 튜토리얼</h2>

        <p className="text-center text-sm text-[#99A1AF] leading-relaxed mb-6">
          처음이신가요? 화면을 하나씩 따라가며 사용법을 안내해드릴게요!
          <br />
          9단계로 핵심 기능을 차근차근 익힐 수 있습니다.
        </p>

        <label className="flex items-center justify-center gap-2 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => onDontShowAgainChange(e.target.checked)}
            className="w-4 h-4 rounded border-[#4A5568] bg-[#0A0A1A] checked:bg-[#FF6900] checked:border-[#FF6900] cursor-pointer"
          />
          <span className="text-xs text-[#99A1AF]">다시 보지 않기</span>
        </label>

        <Button
          onClick={handleStart}
          fullWidth
          className="h-12 rounded-lg bg-gradient-to-r from-[#FF6900] to-[#FB2C36] hover:from-[#FF7A1A] hover:to-[#FC3D47] text-base font-bold shadow-lg shadow-orange-500/30"
        >
          시작하기
        </Button>

        <div className="flex items-center justify-center gap-1 mt-4">
          <span className="text-[0.625rem] text-[#6A7282]">💡 우측 상단</span>
          <span className="text-[0.625rem] text-white">? </span>
          <span className="text-[0.625rem] text-[#6A7282]">버튼을 클릭하면 언제든지 튜토리얼을 다시 볼 수 있어요.</span>
        </div>
      </div>
    </div>
  );
}
