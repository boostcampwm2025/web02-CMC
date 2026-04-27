import Icon from '@/commons/components/Icon';
import type { IconName } from '@/commons/components/Icon';

export function StageIcon({
  icon,
  bg,
  border,
  text,
  active,
  small,
  tooltip
}: {
  icon: 'message' | 'battle' | 'shield' | 'switch';
  bg: string;
  border: string;
  text: string;
  active?: boolean;
  small?: boolean;
  tooltip?: string;
}) {
  const baseSize = small ? 3 : 3.3;
  const activeSize = small ? 3.5 : 3.75;
  const size = active ? activeSize : baseSize;

  const iconClass = `w-5 h-5 transition-all`;
  const iconStyle = active ? { color: text } : { color: '#99A1AF' };

  return (
    <div className="relative flex flex-col items-center gap-1 group">
      <div
        className={`
          rounded-xl
          flex items-center justify-center
          border-[1.333px]
          transition-all duration-300 ease-in-out
          ${active ? 'shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.25)]' : ''}
        `}
        style={{
          width: `${size}rem`,
          height: `${size}rem`,
          background: active ? bg : '#0A0A1A',
          borderColor: active ? border : '#364153'
        }}
      >
        <Icon name={icon as IconName} className={iconClass} style={iconStyle} />
      </div>
      {tooltip && (
        <div
          className="
            absolute top-full mt-2 px-3 py-2
            bg-[#1E1E2F] text-white text-sm rounded-lg
            shadow-lg border border-[#364153]
            opacity-0 group-hover:opacity-100
            pointer-events-none
            transition-opacity duration-200
            whitespace-nowrap z-20
          "
        >
          {tooltip}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 translate-y-[0.5px] w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-[#364153]" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[1.5rem] border-l-transparent border-r-[1.5rem] border-r-transparent border-b-[1.5rem] border-b-[#1E1E2F]" />
        </div>
      )}
    </div>
  );
}
