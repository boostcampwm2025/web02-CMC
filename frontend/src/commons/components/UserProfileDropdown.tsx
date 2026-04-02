import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { useLogout } from '@/commons/hooks/useLogout';
import Button from '@/commons/components/Button';

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
  const { mutate: logout } = useLogout();

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

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 사용자 프로필 버튼 */}
      <Button onClick={() => setIsOpen(!isOpen)} variant="ghost" className="px-3 py-1.5 border-none hover:bg-[#1A1A2E]">
        <div className="w-8 h-8 rounded-full bg-linear-to-br from-orange-500 via-orange-600 to-orange-700 flex items-center justify-center shadow-lg">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.nickname} className="w-full h-full rounded-full object-cover" />
          ) : (
            <Icon name="user" className="w-5 h-5 text-white" />
          )}
        </div>
        <span className="text-white text-sm font-medium">{user.nickname}</span>
      </Button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[#1A1A2E] rounded-xl border border-[#2D2D3F] shadow-2xl overflow-hidden z-50">
          {/* 메뉴 아이템 */}
          <div className="py-2">
            <Button
              variant="ghost"
              fullWidth
              onClick={() => {
                navigate('/nickname');
                setIsOpen(false);
              }}
              className="px-4 py-2 border-none justify-start text-sm hover:bg-[#24292e]"
            >
              닉네임 변경
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => {
                navigate('/profile');
                setIsOpen(false);
              }}
              className="px-4 py-2 border-none justify-start text-sm hover:bg-[#24292e]"
            >
              내 프로필
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => {
                navigate('/my-battles');
                setIsOpen(false);
              }}
              className="px-4 py-2 border-none justify-start text-sm hover:bg-[#24292e]"
            >
              내 배틀
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => {
                navigate('/settings');
                setIsOpen(false);
              }}
              className="px-4 py-2 border-none justify-start text-sm hover:bg-[#24292e]"
            >
              설정
            </Button>
          </div>

          {/* 로그아웃 버튼 */}
          <div className="border-t border-[#2D2D3F] py-2">
            <Button
              variant="ghost"
              fullWidth
              onClick={handleLogout}
              className="px-4 py-2 border-none justify-start text-sm text-red-400 hover:bg-[#24292e] hover:text-red-400"
            >
              로그아웃
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
