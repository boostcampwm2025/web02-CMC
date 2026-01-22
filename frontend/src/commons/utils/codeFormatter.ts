export type BattleLanguage = 'javascript' | 'typescript' | 'python';

interface FormatResult {
  code: string;
  formatted: boolean;
  error?: string;
}

async function formatJavaScript(code: string): Promise<string> {
  const prettier = await import('prettier/standalone');
  const babelPlugin = await import('prettier/plugins/babel');
  const estreePlugin = await import('prettier/plugins/estree');

  return prettier.format(code, {
    parser: 'babel',
    plugins: [babelPlugin.default, estreePlugin.default],
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'none'
  });
}

async function formatTypeScript(code: string): Promise<string> {
  const prettier = await import('prettier/standalone');
  const tsPlugin = await import('prettier/plugins/typescript');
  const estreePlugin = await import('prettier/plugins/estree');

  return prettier.format(code, {
    parser: 'typescript',
    plugins: [tsPlugin.default, estreePlugin.default],
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'none'
  });
}

async function formatPython(code: string): Promise<string> {
  const ruff = await import('@wasm-fmt/ruff_fmt');
  await ruff.default();
  return ruff.format(code);
}

export async function formatCode(code: string, language: BattleLanguage): Promise<FormatResult> {
  if (!code.trim()) {
    return { code, formatted: false };
  }

  try {
    let formattedCode: string;
    switch (language) {
      case 'javascript':
        formattedCode = await formatJavaScript(code);
        break;
      case 'typescript':
        formattedCode = await formatTypeScript(code);
        break;
      case 'python':
        formattedCode = await formatPython(code);
        break;
      default:
        return { code, formatted: false };
    }
    return { code: formattedCode, formatted: true };
  } catch (error) {
    console.error('코드 포맷팅 실패:', error);
    return { code, formatted: false, error: String(error) };
  }
}
