import MessageIcon from '@/assets/icon/message.svg?react';
import BattleIcon from '@/assets/icon/battle.svg?react';
import ShieldIcon from '@/assets/icon/shield.svg?react';
import SwitchIcon from '@/assets/icon/switch.svg?react';

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
  const baseSize = small ? 48 : 52.8;
  const activeSize = small ? 56 : 60;
  const size = active ? activeSize : baseSize;

  const iconClass = `w-[20px] h-[20px] transition-all`;
  const iconStyle = active ? { color: text } : { color: '#99A1AF' };

  const renderIcon = () => {
    switch (icon) {
      case 'message':
        return <MessageIcon className={iconClass} style={iconStyle} />;
      case 'battle':
        return <BattleIcon className={iconClass} style={iconStyle} />;
      case 'shield':
        return <ShieldIcon className={iconClass} style={iconStyle} />;
      case 'switch':
        return <SwitchIcon className={iconClass} style={iconStyle} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative flex flex-col items-center gap-1 group">
      <div
        className={`
          rounded-[12px]
          flex items-center justify-center
          border-[1.333px]
          transition-all duration-300 ease-in-out
          ${active ? 'shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.25)]' : ''}
        `}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: active ? bg : '#0A0A1A',
          borderColor: active ? border : '#364153'
        }}
      >
        {renderIcon()}
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
          <div
            className="
              absolute bottom-full left-1/2 -translate-x-1/2
              w-0 h-0
              border-l-[6px] border-l-transparent
              border-r-[6px] border-r-transparent
              border-b-[6px] border-b-[#1E1E2F]
            "
          />
        </div>
      )}
    </div>
  );
}
