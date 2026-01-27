import { useState } from 'react';
import CheckIcon from '@/assets/icon/check.svg?react';
import CopyIcon from '@/assets/icon/copy.svg?react';

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
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-[#1A1A2E] border border-[#2D2D3F] rounded-lg px-4 py-2 flex items-center gap-2">
        <input
          type="text"
          value={inviteLink}
          readOnly
          className="flex-1 bg-transparent text-white text-sm focus:outline-none"
          onClick={(e) => e.currentTarget.select()}
        />
      </div>

      <button
        onClick={handleCopy}
        className="px-4 py-2 bg-[#2D2D3F] hover:bg-[#3D3D4F] text-white rounded-lg transition-colors flex items-center justify-center min-w-[60px] sm:min-w-[100px]"
        title="링크 복사"
      >
        {copied ? (
          <div className="flex items-center gap-2">
            <CheckIcon className="w-4 h-4 shrink-0" />
            <span className="text-sm hidden sm:inline">복사됨</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <CopyIcon className="w-4 h-4 shrink-0" />
            <span className="text-sm hidden sm:inline">복사</span>
          </div>
        )}
      </button>
    </div>
  );
}
