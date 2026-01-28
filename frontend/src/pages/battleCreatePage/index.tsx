import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlusIcon from '@/assets/icon/plus.svg?react';
import { BATTLE_CATEGORY_CONFIG } from '../mainPage/types/battle';
import BattleTopicInput from './components/BattleTopicInput';
import { formatCode } from '@/commons/utils/codeFormatter';
import { selectUser, useAuthStore } from '@/commons/stores/authStore';
import postCreateBattle from '@/commons/apis/postCreateBattle';

export type BattleType = 'PUBLIC' | 'PRIVATE';
export type BattleLanguage = 'javascript' | 'typescript' | 'python';
export type BattlePlayTime = 'FIFTEEN_MIN' | 'THIRTY_MIN';

const LANGUAGE_OPTIONS: Array<{ label: string; value: BattleLanguage }> = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' }
];

const PLAYTIME_OPTIONS: Array<{ label: string; value: BattlePlayTime; rounds: number }> = [
  { label: '15분', value: 'FIFTEEN_MIN', rounds: 1 },
  { label: '30분', value: 'THIRTY_MIN', rounds: 2 }
];

// const VISIBILITY_OPTIONS: Array<{ label: string; value: BattleType }> = [
//   { label: '공개', value: 'PUBLIC' },
//   { label: '비공개', value: 'PRIVATE' }
// ];

export default function BattleCreatePage() {
  const navigate = useNavigate();

  const categoryOptions = useMemo(
    () =>
      Object.values(BATTLE_CATEGORY_CONFIG).map((c) => ({
        label: c.title.replace(/^[^ ]+ /, ''),
        value: c.key
      })),
    []
  );

  const user = useAuthStore(selectUser);
  const authorId = user?.id ?? null;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [aCode, setACode] = useState('');
  const [bCode, setBCode] = useState('');
  const [language, setLanguage] = useState<BattleLanguage>('javascript');
  const [category, setCategory] = useState(categoryOptions[0]?.value ?? 'ALGORITHM');
  const [playTime, setPlayTime] = useState<BattlePlayTime>('FIFTEEN_MIN');
  const [topics, setTopics] = useState<string[]>([]);
  const [type] = useState<BattleType>('PRIVATE'); // 현재는 비공개만

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const rounds = PLAYTIME_OPTIONS.find(({ value }) => value === playTime)?.rounds ?? 0;

  const canSubmit = (() => {
    if (!authorId) return false;
    if (!title.trim()) return false;
    if (!description.trim()) return false;
    if (!aCode.trim()) return false;
    if (!bCode.trim()) return false;
    if (topics.length !== rounds) return false;

    return true;
  })();

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const [formattedA, formattedB] = await Promise.all([formatCode(aCode, language), formatCode(bCode, language)]);

      if (!authorId) {
        throw new Error('로그인이 필요합니다.');
      }

      const data = await postCreateBattle({
        authorId,
        title: title.trim(),
        description: description.trim(),
        aCode: formattedA.code,
        bCode: formattedB.code,
        language,
        type,
        category,
        playTime,
        topics
      });

      navigate(`/battle/${data.battleId}/team-select/`);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full px-6 py-8">
      <div className="mx-auto create-max-width">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-gray-300 hover:text-white transition-colors"
        >
          ← 뒤로 가기
        </button>

        <div className="mt-4 rounded-2xl border border-[#2b2b3e] bg-[#121226] shadow-[0_18px_35px_rgba(0,0,0,0.35)]">
          <div className="h-1 w-full rounded-t-2xl bg-orange-500" />

          <div className="create-padding">
            <div className="mb-6">
              <p className="text-xs tracking-[0.24em] text-orange-500">CREATE NEW BATTLE</p>
              <h1 className="mt-2 create-title-size font-bold text-white">새 배틀 생성</h1>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-300">문제 제목</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 배열에서 중복 제거하기"
                  className="w-full rounded-xl border border-[#2b2b3e] bg-[#0f0f1f] px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/60"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">문제 설명</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="어떤 코드를 비교하고 싶으신가요?"
                  className="min-h-28 w-full resize-y rounded-xl border border-[#2b2b3e] bg-[#0f0f1f] px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/60"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-300">
                      A
                    </span>
                    <label className="text-sm text-gray-300">구현 A</label>
                  </div>
                  <textarea
                    value={aCode}
                    onChange={(e) => setACode(e.target.value)}
                    placeholder="첫 번째 코드를 입력하세요"
                    className="create-textarea-height w-full resize-y rounded-xl border border-[#2b2b3e] bg-[#0f0f1f] px-4 py-3 font-mono text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/60"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/20 text-xs font-bold text-rose-300">
                      B
                    </span>
                    <label className="text-sm text-gray-300">구현 B</label>
                  </div>
                  <textarea
                    value={bCode}
                    onChange={(e) => setBCode(e.target.value)}
                    placeholder="두 번째 코드를 입력하세요"
                    className="create-textarea-height w-full resize-y rounded-xl border border-[#2b2b3e] bg-[#0f0f1f] px-4 py-3 font-mono text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">언어</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as BattleLanguage)}
                    className="w-full rounded-xl border border-[#2b2b3e] bg-[#0f0f1f] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/60"
                  >
                    {LANGUAGE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-300">카테고리</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as typeof category)}
                    className="w-full rounded-xl border border-[#2b2b3e] bg-[#0f0f1f] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/60"
                  >
                    {categoryOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-300">배틀 시간</label>
                  <select
                    value={playTime}
                    onChange={(e) => setPlayTime(e.target.value as BattlePlayTime)}
                    className="w-full rounded-xl border border-[#2b2b3e] bg-[#0f0f1f] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/60"
                  >
                    {PLAYTIME_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">배틀 공개 여부</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as BattleType)}
                    className="w-full rounded-xl border border-[#2b2b3e] bg-[#0f0f1f] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/60"
                  >
                    {VISIBILITY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div> */}

              <BattleTopicInput rounds={rounds} selectedTopics={topics} onTopicsChange={setTopics} />

              {errorMessage && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {errorMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="rounded-xl border border-[#2b2b3e] bg-transparent px-5 py-3 text-gray-200 hover:bg-[#1a1a2e] transition-colors"
                >
                  취소
                </button>

                <button
                  type="button"
                  disabled={!canSubmit || isSubmitting}
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white shadow-[0_12px_24px_rgba(255,105,0,0.25)] hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-orange-500/50 transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                  {isSubmitting ? '생성 중...' : '배틀 시작'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
