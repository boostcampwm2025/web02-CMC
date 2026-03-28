import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function InvitePage() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const [isInvalid, setIsInvalid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!inviteCode) {
      setIsInvalid(true);
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/battles/${inviteCode}`, {
      redirect: 'manual'
    })
      .then((res) => {
        if (res.type === 'opaqueredirect' || (res.status >= 300 && res.status < 400)) {
          window.location.href = `${import.meta.env.VITE_API_URL}/api/battles/${inviteCode}`;
        } else {
          setIsInvalid(true);
        }
      })
      .catch(() => setIsInvalid(true));
  }, [inviteCode]);

  if (isInvalid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-4">유효하지 않은 초대 링크입니다.</p>
          <button
            onClick={() => navigate('/main')}
            className="px-4 py-2 rounded-lg bg-[#2D2D3F] hover:bg-[#3D3D4F] text-white transition-colors"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg">초대 링크를 확인하는 중...</p>
      </div>
    </div>
  );
}
