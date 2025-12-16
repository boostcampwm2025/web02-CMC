const MOCK_DATA = {
  title: '퀵 소트 알고리즘 구현',
  description: '퀵 소트 알고리즘을 구현하는 방법 중 어느것이 더 좋을까요?'
};

export default function TeamSelectPage() {
  return (
    <main>
      <h1>진영을 선택해주세요</h1>
      <div>
        <p>{MOCK_DATA.title}</p>
        <p>{MOCK_DATA.description}</p>
      </div>
      <div className="flex gap-4">
        <button> A팀</button>
        <button> 중립</button>
        <button> B팀</button>
      </div>
      <button>돌아가기</button>
    </main>
  );
}
