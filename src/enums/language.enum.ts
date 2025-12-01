export enum Language {
  EN = 'EN',
  TH = 'TH',
}

export const DEFAULT_LANGUAGE = Language.EN;

export const SUPPORTED_LANGUAGES = [Language.EN, Language.TH] as const;
