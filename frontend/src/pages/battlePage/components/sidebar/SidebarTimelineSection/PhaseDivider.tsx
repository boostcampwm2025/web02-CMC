export default function PhaseDivider() {
  return (
    <div className="relative py-3 bg-gradient-to-r from-orange-950/30 via-orange-900/50 to-orange-950/30">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-lg shadow-orange-500/50"></div>
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 bg-gradient-to-r from-transparent via-orange-400/60 to-transparent blur-md"></div>
      <div className="relative z-10 flex items-center justify-center gap-2">
        <div className="w-2 h-2 rounded-full bg-orange-500 shadow-lg shadow-orange-500/80 animate-pulse"></div>
        <div className="w-3 h-3 rounded-full bg-orange-400 shadow-lg shadow-orange-400/80"></div>
        <div className="w-2 h-2 rounded-full bg-orange-500 shadow-lg shadow-orange-500/80 animate-pulse"></div>
      </div>
    </div>
  );
}
