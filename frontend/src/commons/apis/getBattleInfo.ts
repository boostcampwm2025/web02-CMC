const fetchBattleInfo = async (id: string) => {
  try {
    const response = await fetch(`/api/battles/${id}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('배틀 데이터를 불러오는데 실패했습니다.');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('배틀 정보를 불러오는 중 오류 발생했습니다', error);
  }
};

export default fetchBattleInfo;
