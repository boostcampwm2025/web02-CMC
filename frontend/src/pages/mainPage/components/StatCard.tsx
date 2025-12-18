import { STAT_CONFIG, type StatType } from '../types/stat';
import IconBox from './IconBox';

interface Props {
  type: StatType;
  value: number;
}

export default function StatCard({ type, value }: Props) {
  const { label, color, background, icon: Icon } = STAT_CONFIG[type];

  return (
    <div className="w-full rounded-2xl bg-[#1A1A2E] overflow-hidden">
      <div className="h-1 w-full" style={{ backgroundColor: color }} />

      <div className="flex items-center gap-4 p-6">
        <IconBox bgColor={background}>
          <Icon style={{ color }} />
        </IconBox>

        <div className="flex flex-col text-left">
          <p className="text-xl font-semibold">{value}</p>
          <p className="mt-1 text-sm text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}
