import { useApp } from '../contexts/AppContext';
import { translations } from '../i18n/translations';

export const useTranslation = () => {
  const { state } = useApp();
  const currentLanguage = state.settings.language || 'zh';
  
  const t = (key: string, params?: Record<string, string | number>): string => {
    // 支持嵌套键，如 'categories.writing'
    const keys = key.split('.');
    let value: any = translations[currentLanguage as keyof typeof translations];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // 如果找不到翻译，返回键名
        console.warn(`Translation key not found: ${key} for language: ${currentLanguage}`);
        return key;
      }
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`);
      return key;
    }
    
    // 替换参数
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }
    
    return value;
  };
  
  return { t, currentLanguage };
};
