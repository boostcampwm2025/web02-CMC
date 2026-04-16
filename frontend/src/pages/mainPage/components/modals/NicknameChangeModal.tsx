import Modal from '@/commons/components/Modal';
import Icon from '@/commons/components/Icon';
import Button from '@/commons/components/Button';
import { useNicknameForm } from '../../hooks/useNicknameForm';

interface NicknameChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NicknameChangeModal({ isOpen, onClose }: NicknameChangeModalProps) {
  const { inputNickname, error, isPending, handleChange, handleSubmit } = useNicknameForm({ onSuccess: onClose });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-sm lg:max-w-md bg-[#1A1A2E] rounded-2xl overflow-hidden shadow-2xl">
        <div className="h-1 w-full bg-orange-500" />

        <div className="p-6 lg:p-8 xl:p-10 flex flex-col items-center gap-4 lg:gap-6">
          <div className="relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 translate-y-1 w-12 h-12 bg-orange-500 rounded-xl blur-xl opacity-70 -z-10" />
            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center relative z-10">
              <Icon name="user" className="w-8 h-8 text-white" />
            </div>
          </div>

          <h2 className="text-white text-2xl lg:text-3xl font-bold">닉네임 설정</h2>
          <p className="text-gray-400 text-sm lg:text-base text-center">코문철에서 사용할 닉네임을 입력하세요</p>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 lg:gap-6">
            <div>
              <input
                value={inputNickname}
                onChange={handleChange}
                placeholder="닉네임을 입력하세요 (최대 8자)"
                maxLength={8}
                className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-[#0a0a1a] text-white border border-gray-800 rounded-xl focus:border-orange-500 focus:outline-none text-sm lg:text-base transition-all duration-200"
                autoFocus
              />
              {error && <p className="mt-2 text-red-400 text-xs lg:text-sm">{error}</p>}
            </div>

            <Button
              disabled={isPending}
              type="submit"
              fullWidth
              size="lg"
              className="shadow-lg shadow-orange-500/30 active:scale-[0.97] focus:ring-2 focus:ring-orange-400/50"
            >
              {isPending ? '설정 중...' : '시작하기'}
            </Button>
          </form>
        </div>
      </div>
    </Modal>
  );
}
