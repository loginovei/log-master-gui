import { useAppContext } from '../context/AppContext';
import { translations } from './translations';
import type { Lang } from './translations';

export function useT() {
  const { selectedLang } = useAppContext();
  const lang: Lang = selectedLang in translations ? (selectedLang as Lang) : 'ru';
  return translations[lang];
}
