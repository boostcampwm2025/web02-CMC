import { useState } from 'react';
import UserIcon from '@/assets/icon/user.svg?react';

interface GuestLoginModalProps {
  disabled: boolean;
  onClose: () => void;
  onLogin: (username: string) => void;
}

export default function GuestLoginModal({ disabled, onClose, onLogin }: GuestLoginModalProps) {
  const [inputUsername, setInputUsername] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUsername.trim()) return;

    onLogin(inputUsername.trim());
    setInputUsername('');
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1a2e] rounded-xl overflow-hidden max-w-md w-full border border-gray-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 bg-orange-500 neon-bar" />

        <div className="p-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-white text-2xl mb-2">환영합니다!</h2>
            <p className="text-gray-400">닉네임을 입력하고 배틀에 참여하세요</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label className="block text-gray-300 mb-2 uppercase text-sm tracking-wider">닉네임</label>
              <input
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                placeholder="닉네임을 입력하세요"
                className="w-full px-4 py-3 bg-[#0a0a1a] text-white border border-gray-800 rounded-lg focus:border-orange-500"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="
                    flex-1 px-4 py-3 rounded-lg
                    bg-[#0a0a1a] text-gray-300
                    border border-gray-800
                    transition-all duration-200
                    hover:bg-[#14142a] hover:border-gray-700 hover:text-white
                    active:scale-[0.98]
                    focus:outline-none focus:ring-2 focus:ring-gray-700/40
                  "
              >
                취소
              </button>
              <button
                disabled={disabled}
                type="submit"
                className="
                  flex-1 px-4 py-3 rounded-lg font-semibold
                  bg-gradient-to-r from-orange-500 to-orange-600
                  text-white
                  shadow-lg shadow-orange-500/30
                  transition-all duration-200
                  hover:from-orange-400 hover:to-orange-500 hover:shadow-orange-500/40
                  active:scale-[0.97]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  disabled:hover:shadow-none disabled:hover:from-orange-500 disabled:hover:to-orange-600
                  focus:outline-none focus:ring-2 focus:ring-orange-400/50
                "
              >
                시작하기
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
