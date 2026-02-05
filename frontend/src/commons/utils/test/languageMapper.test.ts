import { describe, it, expect } from 'vitest';
import { languageMapper } from '../languageMapper';

describe('languageMapper', () => {
  it('대문자 약어를 소문자 전체 이름으로 변환한다', () => {
    expect(languageMapper('TS')).toBe('typescript');
    expect(languageMapper('JS')).toBe('javascript');
    expect(languageMapper('PYTHON')).toBe('python');
  });

  it('소문자 전체 이름은 그대로 반환한다', () => {
    expect(languageMapper('typescript')).toBe('typescript');
    expect(languageMapper('javascript')).toBe('javascript');
    expect(languageMapper('python')).toBe('python');
  });

  it('매핑에 없는 언어는 입력값 그대로 반환한다', () => {
    expect(languageMapper('rust')).toBe('rust');
    expect(languageMapper('go')).toBe('go');
    expect(languageMapper('')).toBe('');
  });
});
