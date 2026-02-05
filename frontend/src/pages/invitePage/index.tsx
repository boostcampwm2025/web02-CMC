import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function InvitePage() {
  const { inviteCode } = useParams<{ inviteCode: string }>();

  useEffect(() => {
    if (!inviteCode) {
      return;
    }
    window.location.href = `${import.meta.env.VITE_API_URL}/api/battles/${inviteCode}`;
  }, [inviteCode]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg">초대 링크를 확인하는 중...</p>
      </div>
    </div>
  );
}
