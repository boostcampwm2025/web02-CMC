import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VolumeSlider from '../VolumeSlider';

describe('VolumeSlider', () => {
  it('라벨과 값 표시', () => {
    const handleChange = vi.fn();
    render(<VolumeSlider label="테스트 볼륨" value={0.5} onChange={handleChange} />);

    expect(screen.getByText('테스트 볼륨')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('슬라이더 값 변경 시 onChange 호출', () => {
    const handleChange = vi.fn();
    render(<VolumeSlider label="테스트" value={0.5} onChange={handleChange} />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '0.7' } });

    expect(handleChange).toHaveBeenCalledWith(0.7);
  });

  it('퍼센트 계산 정확성', () => {
    const handleChange = vi.fn();
    const { rerender } = render(<VolumeSlider label="테스트" value={0.25} onChange={handleChange} />);

    expect(screen.getByText('25%')).toBeInTheDocument();

    rerender(<VolumeSlider label="테스트" value={0.75} onChange={handleChange} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });
});
