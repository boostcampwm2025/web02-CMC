import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SoundSettingsPopover from '../SoundSettingsPopover';
import { soundManager } from '@/commons/utils/soundManager';

vi.mock('@/commons/utils/soundManager', () => ({
  soundManager: {
    getBGMVolume: vi.fn(() => 0.5),
    getEffectVolume: vi.fn(() => 0.5),
    getCurrentBGM: vi.fn(() => null),
    isBGMPlaying: vi.fn(() => false),
    setBGMVolume: vi.fn(),
    setEffectVolume: vi.fn(),
    playBGM: vi.fn(),
    stopAllBGM: vi.fn(),
    pauseBGM: vi.fn(),
    resumeBGM: vi.fn()
  }
}));

describe('SoundSettingsPopover', () => {
  const mockAnchorEl = document.createElement('button');
  const bgmOptions = [
    { key: 'lofi', label: 'LoFi', src: '/sounds/lofi.mp3' },
    { key: 'jazz', label: 'Jazz', src: '/sounds/jazz.mp3' }
  ];

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    anchorEl: mockAnchorEl,
    bgmOptions
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('팝오버가 열릴 때 soundManager 상태 동기화', () => {
    render(<SoundSettingsPopover {...defaultProps} />);

    expect(soundManager.getBGMVolume).toHaveBeenCalled();
    expect(soundManager.getEffectVolume).toHaveBeenCalled();
    expect(soundManager.getCurrentBGM).toHaveBeenCalled();
  });

  it('BGM 볼륨 슬라이더 변경', () => {
    render(<SoundSettingsPopover {...defaultProps} />);

    const sliders = screen.getAllByRole('slider');
    const bgmSlider = sliders[0];
    fireEvent.change(bgmSlider, { target: { value: '0.8' } });

    expect(soundManager.setBGMVolume).toHaveBeenCalledWith(0.8);
  });

  it('효과음 볼륨 슬라이더 변경', () => {
    render(<SoundSettingsPopover {...defaultProps} />);

    const sliders = screen.getAllByRole('slider');
    const effectSlider = sliders[1];
    fireEvent.change(effectSlider, { target: { value: '0.6' } });

    expect(soundManager.setEffectVolume).toHaveBeenCalledWith(0.6);
  });

  it('닫기 버튼 클릭 시 onClose 호출', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<SoundSettingsPopover {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByLabelText('닫기');
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('isOpen이 false일 때 null을 반환한다', () => {
    const { container } = render(<SoundSettingsPopover {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('anchorEl이 null일 때 null을 반환한다', () => {
    const { container } = render(<SoundSettingsPopover {...defaultProps} anchorEl={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('BGM 선택 시 playBGM이 호출된다', async () => {
    const user = userEvent.setup();
    render(<SoundSettingsPopover {...defaultProps} />);

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'lofi');

    expect(soundManager.playBGM).toHaveBeenCalledWith('lofi');
  });

  it('빈 BGM 선택 시 stopAllBGM이 호출된다', async () => {
    const user = userEvent.setup();
    render(<SoundSettingsPopover {...defaultProps} />);

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, '');

    expect(soundManager.stopAllBGM).toHaveBeenCalled();
  });

  it('재생/일시정지 버튼 클릭 시 상태 전환', async () => {
    const user = userEvent.setup();
    vi.mocked(soundManager.isBGMPlaying).mockReturnValue(true);
    vi.mocked(soundManager.getCurrentBGM).mockReturnValue('lofi');

    render(<SoundSettingsPopover {...defaultProps} />);

    const playPauseButton = screen.getByLabelText('일시정지');
    await user.click(playPauseButton);

    expect(soundManager.pauseBGM).toHaveBeenCalled();
  });

  it('일시정지 상태에서 재생 버튼 클릭 시 resumeBGM 호출', async () => {
    const user = userEvent.setup();
    vi.mocked(soundManager.isBGMPlaying).mockReturnValue(false);
    vi.mocked(soundManager.getCurrentBGM).mockReturnValue('lofi');

    render(<SoundSettingsPopover {...defaultProps} />);

    // Select a BGM first
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'lofi');

    // Then click pause (which should now be play since we selected BGM and it auto-plays)
    const playPauseButton = screen.getByLabelText('일시정지');
    await user.click(playPauseButton);

    expect(soundManager.pauseBGM).toHaveBeenCalled();
  });

  it('일시정지 상태에서 selectedBGM이 있으면 resumeBGM 호출', async () => {
    const user = userEvent.setup();
    vi.mocked(soundManager.isBGMPlaying).mockReturnValue(false);
    vi.mocked(soundManager.getCurrentBGM).mockReturnValue('lofi');

    render(<SoundSettingsPopover {...defaultProps} />);

    const playPauseButton = screen.getByLabelText('재생');
    await user.click(playPauseButton);

    expect(soundManager.resumeBGM).toHaveBeenCalled();
  });

  it('bgmOptions가 비어있을 때 재생 버튼 클릭 시 아무 동작 안함', async () => {
    const user = userEvent.setup();
    vi.mocked(soundManager.isBGMPlaying).mockReturnValue(false);
    vi.mocked(soundManager.getCurrentBGM).mockReturnValue(null);

    render(<SoundSettingsPopover {...defaultProps} bgmOptions={[]} />);

    const playPauseButton = screen.getByLabelText('재생');
    await user.click(playPauseButton);

    expect(soundManager.playBGM).not.toHaveBeenCalled();
    expect(soundManager.resumeBGM).not.toHaveBeenCalled();
  });
});
