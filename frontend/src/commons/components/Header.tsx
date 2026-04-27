import { Link } from 'react-router-dom';
import Icon, { type TierName } from './Icon';
import { useAuthStore, selectUser, selectIsOAuth } from '@/commons/stores/authStore';
import UserProfileDropdown from './UserProfileDropdown';

interface HeaderProps {
  onLoginClick?: () => void;
  onNicknameClick?: () => void;
}

export default function Header({ onLoginClick, onNicknameClick }: HeaderProps) {
  const user = useAuthStore(selectUser);
  const isOAuth = useAuthStore(selectIsOAuth);

  return (
    <header className="w-full">
      <div className="h-[64px] w-full bg-[#0A0A1A] border-b border-[#2D2D3F]">
        <div className="w-full px-8 h-full flex items-center justify-between">
          {/* 좌측 로고 */}
          <Link to="/main" className="flex items-center gap-2">
            <Icon name="battle" className="w-6 h-6 text-orange-500" />
            <span className=" font-semibold ">배틀 아레나</span>
          </Link>

          {/* 우측 메뉴 */}
          <nav className="flex items-center gap-3">
            {user && isOAuth ? (
              // OAuth 로그인 사용자: 프로필 드롭다운 표시
              <div className="flex items-center gap-1">
                {user.tier && (
                  <div className="relative group flex items-center">
                    <div className="w-[25px] h-[25px] flex items-center justify-center overflow-hidden">
                      <Icon
                        name={user.tier.toLowerCase() as TierName}
                        alt={`${user.tier} tier`}
                        className="w-full h-full object-contain block"
                        style={{ transform: 'scale(1.12)' }}
                      />
                    </div>
                    <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 scale-95 opacity-0 pointer-events-none transition-all duration-150 group-hover:opacity-100 group-hover:scale-100">
                      <div className="min-w-[140px] rounded-lg border border-[#2D2D3F] bg-[#0F111B] px-3 py-2 shadow-lg text-xs text-gray-200">
                        <div className="font-semibold text-orange-300">{user.tier}</div>
                        <div className="mt-1 text-gray-300">{user.rating ?? 0} Point</div>
                      </div>
                    </div>
                  </div>
                )}
                <UserProfileDropdown
                  user={{
                    id: user.id,
                    nickname: user.nickname,
                    avatarUrl: user.avatarUrl
                  }}
                  onNicknameClick={onNicknameClick}
                />
              </div>
            ) : (
              <>
                <button onClick={onLoginClick} className="mr-8 px-3 py-1.5 text-gray-400">
                  로그인
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
