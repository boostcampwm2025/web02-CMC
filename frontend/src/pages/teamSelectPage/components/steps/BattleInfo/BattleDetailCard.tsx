import Icon from '@/commons/components/Icon';

interface BattleDetailCardProps {
  title: string;
  description: string;
  category: string;
  language: string;
}

export default function BattleDetailCard({ title, description, category, language }: BattleDetailCardProps) {
  return (
    <div className="bg-[#16162a] rounded-lg battle-info-card-padding border border-[#2d2d3f] mb-4 shadow-lg w-full">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="battle" className="battle-info-swords-size text-orange-500 flex-shrink-0" />
        <h3 className="text-white battle-info-title-size font-bold break-words min-w-0 text-left">{title}</h3>
      </div>
      <p className="text-gray-400 battle-info-desc-size mb-4 text-left break-words">{description}</p>
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">카테고리</span>
          <span className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg border border-orange-500/50 text-sm font-medium">
            {category}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">언어</span>
          <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/50 text-sm font-medium">
            {language}
          </span>
        </div>
      </div>
    </div>
  );
}
