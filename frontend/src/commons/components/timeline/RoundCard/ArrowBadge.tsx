import Icon from '@/commons/components/Icon';

export default function ArrowBadge() {
  return (
    <div className="hidden md:flex items-center justify-center px-4 bg-[#0a0a1a] border-r border-[#2d2d3f]">
      <div className="relative">
        <div className="absolute inset-0 bg-orange-500/20 blur-lg rounded-full" />
        <div className="relative bg-gradient-to-r from-orange-500 to-blue-600 w-12 h-12 rounded-full flex items-center justify-center border-2 border-orange-400/50 shadow-lg">
          <Icon name="arrowRight" className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}
