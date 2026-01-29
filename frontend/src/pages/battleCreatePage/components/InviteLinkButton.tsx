import { useState } from 'react';
import CheckIcon from '@/assets/icon/check.svg?react';
import CopyIcon from '@/assets/icon/copy.svg?react';

interface InviteLinkProps {
  inviteCode: string;
}

export default function InviteLinkButton({ inviteCode }: InviteLinkProps) {
  const [copied, setCopied] = useState(false);

  const inviteLink = `${window.location.origin}/battles/${inviteCode}`;

  // HTTPS 환경
  const copyWithNavigator = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  // HTTP 환경
  const copyWithExecCommand = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await copyWithNavigator(inviteLink);
      } else {
        copyWithExecCommand(inviteLink);
      }
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
          <CheckIcon className="w-4 h-4 shrink-0" />
          <span className="text-sm hidden sm:inline">복사됨</span>
        </>
      ) : (
        <>
          <CopyIcon className="w-4 h-4 shrink-0" />
          <span className="text-sm hidden sm:inline">친구 초대</span>
        </>
      )}
    </button>
  );
}
