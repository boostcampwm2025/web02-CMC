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
  small
}: {
  icon: 'message' | 'battle' | 'shield' | 'switch';
  bg: string;
  border: string;
  text: string;
  active?: boolean;
  small?: boolean;
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
    <div className="flex flex-col items-center gap-1">
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
    </div>
  );
}
