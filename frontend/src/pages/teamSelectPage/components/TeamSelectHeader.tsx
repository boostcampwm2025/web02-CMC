import Button from '@/commons/components/Button';
import InviteLinkButton from '@/pages/battleCreatePage/components/InviteLinkButton';
import { useNavigate } from 'react-router-dom';

interface TeamSelectHeaderProps {
  inviteCode?: string;
}

export default function TeamSelectHeader({ inviteCode }: TeamSelectHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="relative mb-8">
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/main')}
          className="shrink-0 w-[100px] sm:w-auto sm:min-w-[100px]"
        >
          ← 돌아가기
        </Button>
        <h1 className="text-3xl font-bold text-white absolute left-1/2 -translate-x-1/2 pointer-events-none">
          배틀 참가하기
        </h1>
        <div className="shrink-0">{inviteCode && <InviteLinkButton inviteCode={inviteCode} />}</div>
      </div>
    </div>
  );
}
