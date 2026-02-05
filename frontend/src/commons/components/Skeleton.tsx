interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

export default function Skeleton({ width, height, className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-gradient-to-r from-[#1a1a2e] via-[#252540] to-[#1a1a2e] bg-[length:200%_100%] animate-pulse  ${className}`}
      style={{ width: width, height: height }}
    />
  );
}
