interface InfoSectionProps {
  title: string;
  description: string;
  language: string;
  category: string;
}

export default function BattleInfoSection({ title, description, language, category }: InfoSectionProps) {
  return (
    <div className="p-6 space-y-8">
      <div className="text-left">
        <p className="text-orange-500  font-semibold  mb-3">제목</p>
        <h3 className=" text-xl   leading-relaxed">{title}</h3>
      </div>

      <div className="text-left">
        <p className="text-orange-500  font-semibold  mb-3">설명</p>
        <p className="leading-relaxed">{description}</p>
      </div>

      <div className="flex gap-4">
        <div className="bg-[#1E1E2F] rounded-lg px-4 py-3 shadow w-1/2 flex flex-col  gap-2 items-start">
          <h3 className="text-gray-400  text-sm">언어</h3>
          <p className="text-white text-[14px] font-semibold">{language}</p>
        </div>
        <div className="bg-[#1E1E2F] rounded-lg px-4 py-3 shadow w-1/2 flex flex-col  gap-2 items-start">
          <h3 className="text-gray-400  text-sm">카테고리</h3>
          <p className="text-white text-[14px] font-semibold">{category}</p>
        </div>
      </div>
    </div>
  );
}
