import { useState } from 'react';
import Icon from '@/commons/components/Icon';

interface InviteLinkProps {
  inviteCode: string;
}

export default function InviteLinkButton({ inviteCode }: InviteLinkProps) {
  const [copied, setCopied] = useState(false);

  const inviteLink = `${window.location.origin}/battles/${inviteCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('링크 복사 실패:', error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="px-4 py-2 rounded-lg bg-[#2D2D3F] hover:bg-[#3D3D4F] text-white transition-colors flex items-center justify-center gap-2 text-sm w-[100px] sm:w-auto sm:min-w-[100px]"
      title="링크 복사"
    >
      {copied ? (
        <>
          <Icon name="check" className="w-4 h-4 shrink-0" />
          <span className="text-sm hidden sm:inline">복사됨</span>
        </>
      ) : (
        <>
          <Icon name="copy" className="w-4 h-4 shrink-0" />
          <span className="text-sm hidden sm:inline">친구 초대</span>
        </>
      )}
    </button>
  );
}
