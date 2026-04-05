import Icon from '@/commons/components/Icon';
import Button from '@/commons/components/Button';

interface BookmarkButtonProps {
  onOpen: (tab: 'info' | 'timeline' | 'reference') => void;
  isOpen: boolean;
  highlight?: boolean;
  hasReferenceData?: boolean;
}

export default function BookmarkButton({
  onOpen,
  isOpen,
  highlight = false,
  hasReferenceData = false
}: BookmarkButtonProps) {
  if (isOpen) return null;

  return (
    <div
      className={`fixed left-0 top-1/2 -translate-y-1/2 flex flex-col gap-2 ${highlight ? 'z-[120]' : 'z-30'}`}
      data-tutorial="sidebar-buttons"
    >
      {/* 문제 설명 */}
      <Button
        onClick={() => onOpen('info')}
        rounded="r-md"
        size="sm"
        className="group relative bg-linear-to-r from-[#FF6900] to-[#FF8533] shadow-md hover:shadow-lg hover:translate-x-1"
        aria-label="문제 설명 보기"
      >
        <Icon name="message" className="w-3.5 h-3.5" />
        <span className="text-sm">문제 설명</span>
      </Button>

      {/* 타임라인 */}
      <Button
        onClick={() => onOpen('timeline')}
        rounded="r-md"
        size="sm"
        className="group relative bg-linear-to-r from-[#AD46FF] to-[#6BA3FF] shadow-md hover:shadow-lg hover:translate-x-1"
        aria-label="타임라인 보기"
      >
        <Icon name="clock" className="w-3.5 h-3.5" />
        <span className="text-sm">타임라인</span>
      </Button>

      {/* 참고 자료 */}
      {hasReferenceData && (
        <Button
          onClick={() => onOpen('reference')}
          rounded="r-md"
          size="sm"
          className="group relative bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg hover:translate-x-1"
          aria-label="참고 자료 보기"
        >
          <Icon name="bookOpen" className="w-3.5 h-3.5" />
          <span className="text-sm">참고 자료</span>
        </Button>
      )}
    </div>
  );
}
