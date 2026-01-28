import { useState } from 'react';

const DEFAULT_TOPICS = ['효율성', '가독성', '유지보수성', '테스트', '성능', '확장성'];

type BattleTopicInputProps = {
  rounds: number;
  selectedTopics: string[];
  onTopicsChange: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function BattleTopicInput({ rounds, selectedTopics, onTopicsChange }: BattleTopicInputProps) {
  const [topics, setTopics] = useState<string[]>(DEFAULT_TOPICS);
  const [customTopic, setCustomTopic] = useState('');

  const addTopic = (prev: string[], topic: string) => {
    if (prev.includes(topic)) return prev;
    if (prev.length >= rounds) return prev;
    return [...prev, topic];
  };

  const handleTopicToggle = (topic: string) => {
    onTopicsChange((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : addTopic(prev, topic)));
  };

  const handleAddCustomTopic = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && customTopic.trim()) {
      e.preventDefault();

      const trimmedTopic = customTopic.trim();

      if (!topics.includes(trimmedTopic)) {
        setTopics((prev) => [...prev, trimmedTopic]);
        onTopicsChange((prev) => addTopic(prev, trimmedTopic));
      }

      setCustomTopic('');
    }
  };

  return (
    <div>
      <label className="block text-gray-300 mb-3 uppercase text-sm tracking-wider">대주제 선택</label>
      <div className="bg-[#0a0a1a] border border-gray-800 rounded-lg p-4">
        {/* 기본 주제 체크박스 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {topics.map((topic) => (
            <label
              key={topic}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                selectedTopics.includes(topic)
                  ? 'bg-orange-500/20 border border-orange-500/50'
                  : 'bg-[#1a1a2e] border border-gray-800 hover:border-orange-500/30'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedTopics.includes(topic)}
                onChange={() => handleTopicToggle(topic)}
                className="w-4 h-4 rounded border-gray-600 text-orange-500 focus:ring-orange-500 focus:ring-offset-0 bg-[#0a0a1a]"
              />
              <span className={`text-sm ${selectedTopics.includes(topic) ? 'text-orange-400' : 'text-gray-300'}`}>
                {topic}
              </span>
            </label>
          ))}
        </div>

        {/* 커스텀 주제 입력 */}
        <div>
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            onKeyDown={handleAddCustomTopic}
            placeholder="직접 입력하여 추가 (Enter)"
            className="w-full px-4 py-2 bg-[#1a1a2e] text-white border border-gray-800 rounded-lg focus:outline-none focus:border-orange-500 transition-colors text-sm"
          />
          <p className="text-gray-500 text-xs mt-2">💡 직접 주제를 입력하고 Enter를 눌러 추가하세요</p>
        </div>

        {/* 선택된 주제 개수 표시 */}
        {selectedTopics.length > 0 && (
          <div className="mt-3 text-gray-400 text-xs">선택된 주제: {selectedTopics.length}개</div>
        )}
      </div>
    </div>
  );
}
