import BattleIcon from '@/assets/icon/battle.svg?react';
import GithubIcon from '@/assets/icon/github.svg?react';
import KakaoIcon from '@/assets/icon/kakao.svg?react';
import DevIcon from '@/assets/icon/dev.svg?react';
import { loginWithGitHub, loginWithKakao } from './api/oauth';

export default function LoginPage() {
  const handleGitHubLogin = () => {
    loginWithGitHub();
  };

  const handleKakaoLogin = () => {
    loginWithKakao();
  };

  return (
    <div className="min-h-screen w-full flex flex-col gap-8 lg:gap-12 items-center justify-center px-4 py-8 lg:py-12">
      {/* 로고 및 타이틀 */}
      <div className="flex flex-col gap-3 lg:gap-4 items-center">
        <div className="flex flex-col gap-4 lg:gap-6 items-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 translate-y-1 w-12 h-12 lg:w-16 lg:h-16 bg-orange-500 rounded-xl blur-xl opacity-70 -z-10"></div>
          {/* 오렌지 배경 아이콘 */}
          <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl bg-orange-500 flex items-center justify-center relative z-10">
            <BattleIcon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
          </div>
          <h1 className="text-white text-4xl lg:text-5xl xl:text-6xl font-extrabold">코문철</h1>
        </div>
        <p className="text-gray-400 text-sm lg:text-base text-center px-4">
          {' '}
          두 가지 코드 중 당신의 선택은? 코드 리뷰 배틀을 시작해보세요!
        </p>
      </div>

      {/* 로그인 카드 */}
      <div className="w-full max-w-sm lg:max-w-md bg-[#1A1A2E] rounded-2xl overflow-hidden shadow-2xl">
        {/* 상단 바 */}
        <div className="h-1 w-full bg-orange-500" />

        <div className="p-6 lg:p-8 xl:p-10 flex flex-col items-center gap-4 lg:gap-6">
          <h2 className="text-white text-2xl lg:text-3xl font-bold">로그인</h2>
          <p className="text-gray-400 text-sm lg:text-base text-center">소셜 계정으로 간편하게 시작하세요</p>

          {/* GitHub 로그인 버튼 */}
          <button
            onClick={handleGitHubLogin}
            className="w-full flex items-center justify-center gap-3 px-5 lg:px-6 py-3 lg:py-4 bg-[#24292e] hover:bg-[#2d3339] rounded-xl transition-all duration-200 border border-[#364153] group"
          >
            <GithubIcon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            <span className="font-medium text-sm lg:text-base xl:text-lg">GitHub로 계속하기</span>
          </button>

          {/* 구분선 */}
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 h-px bg-[#2D2D3F]"></div>
            <span className="text-gray-400 text-xs lg:text-sm">또는</span>
            <div className="flex-1 h-px bg-[#2D2D3F]"></div>
          </div>

          {/* Kakao 로그인 버튼 */}
          <button
            onClick={handleKakaoLogin}
            className="w-full flex items-center justify-center gap-3 px-5 lg:px-6 py-3 lg:py-4 bg-[#FEE500] hover:bg-[#FDD835] rounded-xl transition-all duration-200 group"
          >
            <KakaoIcon className="w-5 h-5 lg:w-6 lg:h-6 text-black" />
            <span className="text-black font-medium text-sm lg:text-base xl:text-lg">카카오로 계속하기</span>
          </button>

          {/* 안내 문구 */}
          <div className="mt-4 lg:mt-6 flex items-start gap-2 text-gray-400 text-xs lg:text-sm">
            <DevIcon className="w-4 h-4 lg:w-5 lg:h-5 shrink-0 mt-0.5" />
            <p className="text-left leading-relaxed">로그인하면 코문철의 모든 기능을 이용할 수 있습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
