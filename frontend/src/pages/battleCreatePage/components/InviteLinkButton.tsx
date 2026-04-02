import { useState } from 'react';
import Icon from '@/commons/components/Icon';
import Button from '@/commons/components/Button';

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
    <Button
      variant="secondary"
      size="sm"
      onClick={handleCopy}
      title="링크 복사"
      className="w-[100px] sm:w-auto sm:min-w-[100px]"
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
    </Button>
  );
}
