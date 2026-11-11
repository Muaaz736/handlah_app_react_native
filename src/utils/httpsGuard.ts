
export function enforceHttps(url: string): string {
  if (!url) return url;
  if (url.startsWith('http://')) {
    const secured = url.replace(/^http:\/\//, 'https://');
    if (__DEV__) {
      throw new Error(
        `[HTTPS Guard] Insecure URL detected and blocked: "${url}". Use HTTPS instead.`,
      );
    }
    return secured;
  }
  return url;
}


export function assertAllHttps(config: Record<string, string | null | undefined>): void {
  if (!__DEV__) return; 
  Object.entries(config).forEach(([key, value]) => {
    if (typeof value === 'string' && value.startsWith('http://')) {
      throw new Error(
        `[HTTPS Guard] Insecure HTTP URL found in config key "${key}": "${value}". ` +
        'Update your .env file to use HTTPS.',
      );
    }
  });
}
