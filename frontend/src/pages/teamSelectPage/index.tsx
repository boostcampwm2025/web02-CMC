import TeamButton from './components/TeamButton';
import BattleIcon from '@public/icon/battle.svg?react';

const MOCK_DATA = {
  title: '퀵 소트 알고리즘 구현',
  description: '퀵 소트 알고리즘을 구현하는 방법 중 어느것이 더 좋을까요?',
  launguage: 'javascript',
  acode:
    " function quickSort(arr) { \n if (arr.length <= 1) { \n return arr; \n } \n const pivot = arr[arr.length - 1]; \n const left = []; \n const right = []; \n for (let i = 0; i < arr.length - 1; i++) { \n if (arr[i] < pivot) { \n left.push(arr[i]); \n } else { \n right.push(arr[i]); \n } \n } \n return [...quickSort(left), pivot, ...quickSort(right)]; \n } ',",
  bcode:
    " function quickSort(arr) { \n if (arr.length <= 1) { \n return arr; \n } \n const pivot = arr[arr.length - 1]; \n const left = []; \n const right = []; \n for (let i = 0; i < arr.length - 1; i++) { \n if (arr[i] < pivot) { \n left.push(arr[i]); \n } else { \n right.push(arr[i]); \n } \n } \n return [...quickSort(left), pivot, ...quickSort(right)]; \n } ',"
};

export default function TeamSelectPage() {
  return (
    <main className="text-white">
      <div className="flex w-fit mx-auto ">
        <BattleIcon className="w-[48px] h-[48px] text-[#FF6900]" />
        <h1 className="ml-2 text-[16px]  my-auto">진영을 선택해주세요</h1>
      </div>
      <div className="w-[768px] h-[113px] bg-[#1E1E2F] border-[1px] border-[#2D2D3F] rounded-lg mx-auto text-center py-6 mt-6 mb-10">
        <p className="font-bold text-[20px]">{MOCK_DATA.title}</p>
        <p className="mt-2 text-[#99A1AF] text-[16px]">{MOCK_DATA.description}</p>
      </div>
      <div className="w-fit mx-auto flex gap-4 text-white">
        <TeamButton
          team="A"
          title="구현 A지지"
          language={MOCK_DATA.launguage}
          code={MOCK_DATA.acode}
          description="구현 A가 더 우수하다고 생각한다면 이 진영을 선택하세요."
        />
        <TeamButton
          team="NONE"
          title="구현 A지지"
          language={MOCK_DATA.launguage}
          code={MOCK_DATA.acode}
          description="구현 A가 더 우수하다고 생각한다면 이 진영을 선택하세요."
        />
        <TeamButton
          team="B"
          title="구현 B지지"
          language={MOCK_DATA.launguage}
          code={MOCK_DATA.bcode}
          description="구현 B가 더 우수하다고 생각한다면 이 진영을 선택하세요."
        />
      </div>
      <button>돌아가기</button>
    </main>
  );
}
