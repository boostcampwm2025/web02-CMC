interface Props {
  title: string;
  description: string;
}

export default function BattleCategoryCard({ title, description }: Props) {
  return (
    <div className="flex flex-col gap-4  p-6 text-left  rounded-2xl  bg-[#1A1A2E] border border-[#364153] hover:border-orange-500">
      <h3 className="text-xl font-semibold text-orange-500">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}
