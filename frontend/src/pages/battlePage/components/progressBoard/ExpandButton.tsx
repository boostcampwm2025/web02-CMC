interface ExpandButtonProps {
  onClick: () => void;
}

export function ExpandButton({ onClick }: ExpandButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        absolute left-1/2 -translate-x-1/2 top-[calc(100%+6rem)]
        w-8 h-8
        rounded-full
        bg-[#FF6900]
        shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]
        flex items-center justify-center
        transition-all duration-200 ease-out
        hover:scale-110 hover:bg-[#FF5200]
        active:scale-95
      "
    >
      <div
        className="
          w-2.5 h-2.5
          border-r-2 border-b-2 border-white
          rotate-45
        "
      />
    </button>
  );
}
