export default function GameIntroduceSection() {
  return (
    <section className="h-screen snap-start snap-always flex flex-col justify-between py-10">
      <h2>
        <span className="text-yellow-500 font-bold text-4xl">코문철 </span>
        <span className="text-white font-bold text-4xl">게임소개</span>
      </h2>
      <div className="mx-auto w-[50rem] h-[30rem] rounded-xl bg-white overflow-hidden"></div>
      <button> 아래 버튼</button>
    </section>
  );
}
