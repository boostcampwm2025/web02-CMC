interface VolumeSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export default function VolumeSlider({ label, value, onChange }: VolumeSliderProps) {
  const percentage = Math.round(value * 100);

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-gray-300">{label}</label>
        <span className="text-xs text-gray-400 font-mono">{percentage}%</span>
      </div>
      <div className="relative flex items-center group">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-white hover:accent-blue-400 transition-all"
          style={{
            background: `linear-gradient(to right, #60A5FA 0%, #60A5FA ${percentage}%, #2D2D3F ${percentage}%, #2D2D3F 100%)`
          }}
        />
      </div>
    </div>
  );
}
