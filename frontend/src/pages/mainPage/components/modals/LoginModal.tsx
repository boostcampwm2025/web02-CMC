import Modal from '@/commons/components/Modal';
import Icon from '@/commons/components/Icon';
import Button from '@/commons/components/Button';
import { useLoginHandlers } from '../../hooks/useLoginHandlers';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { handleGitHubLogin, handleKakaoLogin } = useLoginHandlers();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-sm lg:max-w-md bg-[#1A1A2E] rounded-2xl overflow-hidden shadow-2xl">
        <div className="h-1 w-full bg-orange-500" />

        <div className="p-6 lg:p-8 xl:p-10 flex flex-col items-center gap-4 lg:gap-6">
          <div className="relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 translate-y-1 w-12 h-12 bg-orange-500 rounded-xl blur-xl opacity-70 -z-10" />
            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center relative z-10">
              <Icon name="battle" className="w-8 h-8 text-white" />
            </div>
          </div>

          <h2 className="text-white text-2xl lg:text-3xl font-bold">로그인</h2>
          <p className="text-gray-400 text-sm lg:text-base text-center">소셜 계정으로 간편하게 시작하세요</p>

          <Button
            onClick={handleGitHubLogin}
            fullWidth
            className="bg-[#24292e] hover:bg-[#2d3339] rounded-xl border border-[#364153] px-5 lg:px-6 py-3 lg:py-4"
          >
            <Icon name="github" className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            <span className="font-medium text-sm lg:text-base xl:text-lg">GitHub로 계속하기</span>
          </Button>

          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 h-px bg-[#2D2D3F]" />
            <span className="text-gray-400 text-xs lg:text-sm">또는</span>
            <div className="flex-1 h-px bg-[#2D2D3F]" />
          </div>

          <Button
            onClick={handleKakaoLogin}
            fullWidth
            className="bg-[#FEE500] hover:bg-[#FDD835] text-black rounded-xl px-5 lg:px-6 py-3 lg:py-4"
          >
            <Icon name="kakao" className="w-5 h-5 lg:w-6 lg:h-6 text-black" />
            <span className="text-black font-medium text-sm lg:text-base xl:text-lg">카카오로 계속하기</span>
          </Button>

          <div className="mt-4 lg:mt-6 flex items-start gap-2 text-gray-400 text-xs lg:text-sm">
            <Icon name="dev" className="w-4 h-4 lg:w-5 lg:h-5 shrink-0 mt-0.5" />
            <p className="text-left leading-relaxed">로그인하면 코문철의 모든 기능을 이용할 수 있습니다.</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
