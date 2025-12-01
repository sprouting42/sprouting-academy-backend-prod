import type { LocalizedMessage } from '@/common/errors/types/error-code.type';
import { Language } from '@/enums/language.enum';

export const createLocalizedMessage = (
  en: string,
  th: string,
): LocalizedMessage => {
  return {
    [Language.EN]: en,
    [Language.TH]: th,
  } as LocalizedMessage;
};
