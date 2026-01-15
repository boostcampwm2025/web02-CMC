export function languageMapper(language: string): string {
  const languageMap: Record<string, string> = {
    TS: 'typescript',
    JS: 'javascript',
    PYTHON: 'python'
  };

  return languageMap[language];
}
