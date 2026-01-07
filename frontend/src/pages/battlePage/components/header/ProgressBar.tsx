export default function ProgressBar() {
  const teamAProgress = 33;
  const neutralProgress = 33;
  const teamBProgress = 34;

  return (
    <div className="flex h-[12px]">
      <div className="flex-1 bg-blue-500" style={{ width: `${teamAProgress}%` }}></div>
      <div className="flex-1 bg-gray-600" style={{ width: `${neutralProgress}%` }}></div>
      <div className="flex-1 bg-red-500" style={{ width: `${teamBProgress}%` }}></div>
    </div>
  );
}
