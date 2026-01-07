import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Step1BattleInfo from '../Step1BattleInfo';

describe('Step1BattleInfo', () => {
  const mockProps = {
    title: 'Promise vs Async/Await',
    description: '비동기 처리, 어떤 방식이 더 좋을까요?',
    category: 'JavaScript',
    language: 'javascript',
    currentRound: 3,
    totalRounds: 5,
    totalParticipants: 95
  };

  it('렌더링된다', () => {
    render(<Step1BattleInfo {...mockProps} />);

    expect(screen.getByText('Promise vs Async/Await')).toBeInTheDocument();
    expect(screen.getByText('비동기 처리, 어떤 방식이 더 좋을까요?')).toBeInTheDocument();
  });

  it('배틀 제목이 표시된다', () => {
    render(<Step1BattleInfo {...mockProps} />);

    expect(screen.getByText('Promise vs Async/Await')).toBeInTheDocument();
  });

  it('배틀 설명이 표시된다', () => {
    render(<Step1BattleInfo {...mockProps} />);

    expect(screen.getByText('비동기 처리, 어떤 방식이 더 좋을까요?')).toBeInTheDocument();
  });

  it('카테고리와 언어가 표시된다', () => {
    render(<Step1BattleInfo {...mockProps} />);

    expect(screen.getByText(/JavaScript/)).toBeInTheDocument();
    expect(screen.getByText(/javascript/)).toBeInTheDocument();
  });

  it('현재 라운드와 총 라운드가 표시된다', () => {
    render(<Step1BattleInfo {...mockProps} />);

    // "라운드 3 / 5" 텍스트가 있는지 확인
    expect(screen.getByText(/라운드\s*3\s*\/\s*5/)).toBeInTheDocument();
  });

  it('총 참여자 수가 표시된다', () => {
    render(<Step1BattleInfo {...mockProps} />);

    expect(screen.getByText(/95/)).toBeInTheDocument();
  });

  it('라운드 진행 상황이 "라운드 N/M" 형식으로 표시된다', () => {
    render(<Step1BattleInfo {...mockProps} />);

    expect(screen.getByText(/라운드\s*3\s*\/\s*5/)).toBeInTheDocument();
  });

  it('참여자 수가 "N명 참여 중" 형식으로 표시된다', () => {
    render(<Step1BattleInfo {...mockProps} />);

    expect(screen.getByText(/95명/)).toBeInTheDocument();
  });
});
