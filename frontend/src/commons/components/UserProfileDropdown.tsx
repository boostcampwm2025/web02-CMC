import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserIcon from '@/assets/icon/user.svg?react';
import { useAuthStore } from '@/commons/stores/authStore';

interface UserProfileDropdownProps {
  user: {
    id: string;
    nickname: string;
    avatarUrl?: string;
  };
}

export default function UserProfileDropdown({ user }: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      // 로그아웃 성공했을 때만 드롭다운 닫고 홈으로 이동
      setIsOpen(false);
      navigate('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 사용자 프로필 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#1A1A2E] rounded-lg transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-linear-to-br from-orange-500 via-orange-600 to-orange-700 flex items-center justify-center shadow-lg ">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.nickname} className="w-full h-full rounded-full object-cover" />
          ) : (
            <UserIcon className="w-5 h-5 text-white" />
          )}
        </div>
        <span className="text-white text-sm font-medium">{user.nickname}</span>
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[#1A1A2E] rounded-xl border border-[#2D2D3F] shadow-2xl overflow-hidden z-50">
          {/* 메뉴 아이템 */}
          <div className="py-2">
            <button
              onClick={() => {
                navigate('/nickname');
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-white text-sm hover:bg-[#24292e] transition-colors"
            >
              닉네임 변경
            </button>
            <button
              onClick={() => {
                navigate('/profile');
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-white text-sm hover:bg-[#24292e] transition-colors"
            >
              내 프로필
            </button>
            <button
              onClick={() => {
                navigate('/my-battles');
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-white text-sm hover:bg-[#24292e] transition-colors"
            >
              내 배틀
            </button>
            <button
              onClick={() => {
                navigate('/settings');
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-white text-sm hover:bg-[#24292e] transition-colors"
            >
              설정
            </button>
          </div>

          {/* 로그아웃 버튼 */}
          <div className="border-t border-[#2D2D3F] py-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-red-400 text-sm hover:bg-[#24292e] transition-colors flex items-center gap-2"
            >
              <span className="text-red-400">로그아웃</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
