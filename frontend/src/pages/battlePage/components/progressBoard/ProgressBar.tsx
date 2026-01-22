interface ProgressBarProps {
  expiredAt: number;
  startedAt: number;
}

export function ProgressBar({ expiredAt, startedAt }: ProgressBarProps) {
  const duration = Math.max(0, (expiredAt - startedAt) / 1000);

  return (
    <div className="mt-1.5 h-1.5 bg-[#0A0A1A] rounded-full overflow-hidden">
      <div
        key={`${expiredAt}-${startedAt}`}
        className="h-full bg-gradient-to-r from-[#FF6900] via-[#FF8904] to-[#F54900]"
        style={{
          animation: `shrink ${duration}s linear`,
          animationFillMode: 'forwards'
        }}
      />
    </div>
  );
}
