interface ServiceValueCardProps {
  id: number;
  title: string;
  description: string;
}

export default function ServiceValueCard({ id, title, description }: ServiceValueCardProps) {
  return (
    <div key={id} className="group relative bg-[#1a1b23] rounded-2xl p-5 hover:bg-[#20212b]  border border-white/5">
      <div className="text-5xl font-black text-white/5 group-hover:text-orange-500/10 transition-colors absolute top-3 right-5 select-none">
        0{id}
      </div>

      <div className="relative z-10 mt-6 h-full flex flex-col">
        <h3 className="text-base font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300">{description}</p>
      </div>

      <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-orange-500 to-red-600 group-hover:w-full transition-all duration-500 rounded-b-2xl" />
    </div>
  );
}
