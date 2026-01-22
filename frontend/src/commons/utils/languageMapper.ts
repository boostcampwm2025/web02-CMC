export function languageMapper(language: string): string {
  const languageMap: Record<string, string> = {
    TS: 'typescript',
    JS: 'javascript',
    PYTHON: 'python',
    typescript: 'typescript',
    javascript: 'javascript',
    python: 'python'
  };

  return languageMap[language] || language;
}
