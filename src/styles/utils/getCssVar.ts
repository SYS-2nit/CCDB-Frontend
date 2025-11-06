// getCssVar 헬퍼

export const getCssVar = (name: string): string =>
  getComputedStyle(document.documentElement)
    .getPropertyValue(`--${name}`)
    .trim();
