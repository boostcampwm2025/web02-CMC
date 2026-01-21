import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserIcon from '@/assets/icon/user.svg?react';
import { useAuthStore } from '@/commons/stores/authStore';
import updateOAuthNickname from '@/commons/apis/patchOAuthNickname';

export default function NicknamePage() {
  const navigate = useNavigate();
  const [inputNickname, setInputNickname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    const trimmedNickname = inputNickname.trim();
    if (trimmedNickname.length > 8) {
      setError('닉네임은 8글자까지 가능합니다.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateOAuthNickname(trimmedNickname);
      // store의 user를 null로 설정하여 메인 페이지 loader에서 최신 정보를 가져오도록 함
      useAuthStore.setState({ user: null });
      navigate('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : '닉네임 설정에 실패했습니다.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a1a] flex flex-col gap-8 lg:gap-12 items-center justify-center px-4 py-8 lg:py-12">
      {/* 로고 및 타이틀 */}
      <div className="flex flex-col gap-3 lg:gap-4 items-center">
        <div className="flex flex-col gap-4 lg:gap-6 items-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 translate-y-1 w-12 h-12 lg:w-16 lg:h-16 bg-orange-500 rounded-xl blur-xl opacity-70 -z-10"></div>
          {/* 오렌지 배경 아이콘 */}
          <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl bg-orange-500 flex items-center justify-center relative z-10">
            <UserIcon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
          </div>
          <h1 className="text-white text-4xl lg:text-5xl xl:text-6xl font-extrabold">코문철</h1>
        </div>
        <p className="text-gray-400 text-sm lg:text-base text-center px-4">
          두 가지 코드 중 당신의 선택은? 코드 리뷰 배틀을 시작해보세요!
        </p>
      </div>

      {/* 닉네임 설정 카드 */}
      <div className="w-full max-w-sm lg:max-w-md bg-[#1A1A2E] rounded-2xl overflow-hidden shadow-2xl">
        <div className="h-1 w-full bg-orange-500" />

        <div className="p-6 lg:p-8 xl:p-10 flex flex-col items-center gap-4 lg:gap-6">
          <h2 className="text-white text-2xl lg:text-3xl font-bold">닉네임 설정</h2>
          <p className="text-gray-400 text-sm lg:text-base text-center">코문철에서 사용할 닉네임을 입력하세요</p>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 lg:gap-6">
            <div>
              <input
                value={inputNickname}
                onChange={(e) => {
                  setInputNickname(e.target.value);
                  setError(null);
                }}
                placeholder="닉네임을 입력하세요 (최대 8자)"
                maxLength={8}
                className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-[#0a0a1a] text-white border border-gray-800 rounded-xl focus:border-orange-500 focus:outline-none text-sm lg:text-base transition-all duration-200"
                autoFocus
              />
              {error && <p className="mt-2 text-red-400 text-xs lg:text-sm">{error}</p>}
            </div>

            <button
              disabled={isSubmitting}
              type="submit"
              className="w-full px-5 lg:px-6 py-3 lg:py-4 rounded-xl font-semibold text-sm lg:text-base xl:text-lg bg-linear-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 transition-all duration-200 hover:from-orange-400 hover:to-orange-500 hover:shadow-orange-500/40 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:from-orange-500 disabled:hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400/50"
            >
              {isSubmitting ? '설정 중...' : '시작하기'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
