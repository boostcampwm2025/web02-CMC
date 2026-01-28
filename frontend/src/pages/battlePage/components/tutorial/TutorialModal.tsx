import QuestionIcon from '@/assets/icon/question.svg?react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
  dontShowAgain: boolean;
  onDontShowAgainChange: (value: boolean) => void;
}

export default function TutorialModal({
  isOpen,
  onClose,
  onStart,
  dontShowAgain,
  onDontShowAgainChange
}: TutorialModalProps) {
  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };

  const handleStart = () => {
    onStart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative max-w-md rounded-2xl bg-[#1E2432] border border-[#2D3648] shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <div className="w-15 h-15 rounded-full bg-gradient-to-br from-[#FF6900] to-[#FB2C36] flex items-center justify-center">
            <QuestionIcon className="w-10 h-10 text-white" />
          </div>
        </div>

        <h2 className="text-center text-2xl font-bold text-white mb-4">배틀 페이지 튜토리얼</h2>

        <p className="text-center text-sm text-[#99A1AF] leading-relaxed mb-6">
          처음이신가요? 배틀 페이지 사용법을 안내해드릴게요!
          <br />
          7단계의 가이드로 쉽게 배워보세요.
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

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 h-12 rounded-lg bg-[#2D3648] hover:bg-[#3A4255] text-white text-base font-medium transition-colors"
          >
            건너뛰기
          </button>
          <button
            onClick={handleStart}
            className="flex-1 h-12 rounded-lg bg-gradient-to-r from-[#FF6900] to-[#FB2C36] hover:from-[#FF7A1A] hover:to-[#FC3D47] text-white text-base font-bold transition-all shadow-lg shadow-orange-500/30"
          >
            시작하기
          </button>
        </div>

        <div className="flex items-center justify-center gap-1 mt-4">
          <span className="text-[0.625rem] text-[#6A7282]">💡 우측 상단</span>
          <span className="text-[0.625rem] text-white">? </span>
          <span className="text-[0.625rem] text-[#6A7282]">버튼을 클릭하면 언제든지 튜토리얼을 다시 볼 수 있어요.</span>
        </div>
      </div>
    </div>
  );
}
