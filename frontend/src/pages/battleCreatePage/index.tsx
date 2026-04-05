import { useMemo, useState } from 'react';
import { BATTLE_CATEGORY_CONFIG } from '../mainPage/types/battle';
import BattleTopicInput from './components/BattleTopicInput';
import { formatCode } from '@/commons/utils/codeFormatter';
import { selectUser, useAuthStore } from '@/commons/stores/authStore';
import { useToastStore, selectAddToast } from '@/commons/stores/toastStore';
import { useCreateBattle } from './hooks/useCreateBattle';
import LoadingOverlay from '@/commons/components/LoadingOverlay';
import Button from '@/commons/components/Button';
import type { BattleType, BattleLanguage, BattlePlayTime } from './api/types';

const LANGUAGE_OPTIONS: Array<{ label: string; value: BattleLanguage }> = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' }
];

const PLAYTIME_OPTIONS: Array<{ label: string; value: BattlePlayTime; rounds: number }> = [
  { label: '15분', value: 'FIFTEEN_MIN', rounds: 1 },
  { label: '30분', value: 'THIRTY_MIN', rounds: 2 }
];

const VISIBILITY_OPTIONS: Array<{ label: string; value: BattleType }> = [
  { label: '공개', value: 'PUBLIC' },
  { label: '비공개', value: 'PRIVATE' }
];

export default function BattleCreatePage() {
  const { createBattle, isPending } = useCreateBattle();
  const addToast = useToastStore(selectAddToast);

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
  const [type, setType] = useState<BattleType>('PRIVATE');

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
    if (!canSubmit || isPending) return;

    const [formattedA, formattedB] = await Promise.all([formatCode(aCode, language), formatCode(bCode, language)]);

    if (!authorId) {
      addToast({ message: '로그인이 필요합니다.' });
      return;
    }

    await createBattle({
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
  };

  return (
    <main>
      <LoadingOverlay isOpen={isPending} message="배틀 생성 중입니다..." />
      <div className="min-h-screen w-full px-6 py-8">
        <div className="mx-auto create-max-width">
          <div className="flex items-center justify-start gap-4 mt-10 mb-8">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.history.back()}
              className="shrink-0 w-[100px] sm:w-auto sm:min-w-[100px]"
            >
              ← 돌아가기
            </Button>
          </div>

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

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">배틀 공개 여부</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as BattleType)}
                      className="w-full rounded-xl border border-[#2b2b3e] bg-[#0f0f1f] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/60"
                    >
                      {VISIBILITY_OPTIONS.map((o: { label: string; value: BattleType }) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <BattleTopicInput rounds={rounds} selectedTopics={topics} onTopicsChange={setTopics} />

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button type="button" variant="ghost" onClick={() => (window.location.href = '/main')}>
                    취소
                  </Button>

                  <Button
                    type="button"
                    disabled={!canSubmit || isPending}
                    onClick={handleSubmit}
                    data-testid="create-battle-button"
                    className="shadow-[0_12px_24px_rgba(255,105,0,0.25)] hover:bg-orange-400 disabled:bg-orange-500/50"
                  >
                    배틀 생성하기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
