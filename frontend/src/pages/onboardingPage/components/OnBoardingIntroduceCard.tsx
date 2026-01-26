interface OnBoardingIntroduceCardProps {
  image: string;
  description: string;
}

export default function OnBoardingIntroduceCard({ image, description }: OnBoardingIntroduceCardProps) {
  return (
    <div className="w-full h-full relative overflow-hidden">
      <img src={image} alt={description} className="w-full h-full object-cover" />
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-6">
        <p className="text-white text-lg font-bold leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
