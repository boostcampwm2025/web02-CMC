import { Link } from 'react-router-dom';
import BattleIcon from '@/assets/icon/battle.svg?react';

export default function Header() {
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
            {/* 로그인 */}
            <Link to="/login" className="px-3 py-1.5 text-gray-400">
              로그인
            </Link>
            {/* 가입하기 */}
            <Link to="/signup" className="px-3 py-1.5 rounded-full bg-orange-500">
              가입하기
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
