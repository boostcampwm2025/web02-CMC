import { Link } from 'react-router-dom';
import BattleIcon from '@/assets/icon/battle.svg?react';
import { useAuthStore, selectUser, selectIsOAuth } from '@/commons/stores/authStore';
import UserProfileDropdown from './UserProfileDropdown';

export default function Header() {
  const user = useAuthStore(selectUser);
  const isOAuth = useAuthStore(selectIsOAuth);

  return (
    <header className="w-full">
      <div className="h-[64px] w-full bg-[#0A0A1A] border-b border-[#2D2D3F]">
        <div className="w-full px-8 h-full flex items-center justify-between">
          {/* 좌측 로고 */}
          <Link to="/" className="flex items-center gap-2">
            <BattleIcon className="w-6 h-6 text-orange-500" />
            <span className=" font-semibold ">배틀 아레나</span>
          </Link>

          {/* 우측 메뉴 */}
          <nav className="flex items-center gap-3">
            {user && isOAuth ? (
              // OAuth 로그인 사용자: 프로필 드롭다운 표시
              <UserProfileDropdown
                user={{
                  id: user.id,
                  nickname: user.nickname,
                  avatarUrl: user.avatarUrl
                }}
              />
            ) : (
              // 비로그인 또는 비회원 사용자: 로그인/가입 버튼 표시
              <>
                <Link to="/login" className="px-3 py-1.5 text-gray-400">
                  로그인
                </Link>
                <Link to="/signup" className="px-3 py-1.5 rounded-full bg-orange-500">
                  가입하기
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
