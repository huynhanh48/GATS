import slugifyLib from 'slugify';

const SLUGIFY_OPTIONS: Parameters<typeof slugifyLib>[1] = {
  lower: true,
  strict: true,
  locale: 'vi',
  trim: true,
};

export function slugify(text: string): string {
  return slugifyLib(text, SLUGIFY_OPTIONS);
}

export function appendSlugSuffix(base: string, suffix: number): string {
  return `${base}-${suffix}`;
}
