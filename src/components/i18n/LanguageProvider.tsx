import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

type Language = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'zh' | 'ja' | 'ko' | 'ar';

interface Translation {
  [key: string]: string | Translation;
}

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
  isRTL: boolean;
  availableLanguages: Array<{ code: Language; name: string; nativeName: string }>;
}

const translations: Record<Language, Translation> = {
  en: {
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      next: 'Next',
      previous: 'Previous',
      close: 'Close'
    },
    nav: {
      dashboard: 'Dashboard',
      designs: 'Designs',
      collaboration: 'Collaboration',
      analytics: 'Analytics',
      settings: 'Settings'
    },
    dashboard: {
      welcome: 'Welcome back!',
      recentActivity: 'Recent Activity',
      statistics: 'Statistics',
      quickActions: 'Quick Actions'
    }
  },
  es: {
    common: {
      loading: 'Cargando...',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      create: 'Crear',
      search: 'Buscar',
      next: 'Siguiente',
      previous: 'Anterior',
      close: 'Cerrar'
    },
    nav: {
      dashboard: 'Panel',
      designs: 'Diseños',
      collaboration: 'Colaboración',
      analytics: 'Analíticas',
      settings: 'Configuración'
    },
    dashboard: {
      welcome: '¡Bienvenido de vuelta!',
      recentActivity: 'Actividad Reciente',
      statistics: 'Estadísticas',
      quickActions: 'Acciones Rápidas'
    }
  },
  fr: {
    common: {
      loading: 'Chargement...',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      create: 'Créer',
      search: 'Rechercher',
      next: 'Suivant',
      previous: 'Précédent',
      close: 'Fermer'
    },
    nav: {
      dashboard: 'Tableau de bord',
      designs: 'Designs',
      collaboration: 'Collaboration',
      analytics: 'Analytiques',
      settings: 'Paramètres'
    },
    dashboard: {
      welcome: 'Bon retour !',
      recentActivity: 'Activité Récente',
      statistics: 'Statistiques',
      quickActions: 'Actions Rapides'
    }
  },
  de: {
    common: {
      loading: 'Wird geladen...',
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      create: 'Erstellen',
      search: 'Suchen',
      next: 'Weiter',
      previous: 'Zurück',
      close: 'Schließen'
    },
    nav: {
      dashboard: 'Dashboard',
      designs: 'Designs',
      collaboration: 'Zusammenarbeit',
      analytics: 'Analytik',
      settings: 'Einstellungen'
    },
    dashboard: {
      welcome: 'Willkommen zurück!',
      recentActivity: 'Letzte Aktivität',
      statistics: 'Statistiken',
      quickActions: 'Schnellaktionen'
    }
  },
  pt: {
    common: {
      loading: 'Carregando...',
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      edit: 'Editar',
      create: 'Criar',
      search: 'Pesquisar',
      next: 'Próximo',
      previous: 'Anterior',
      close: 'Fechar'
    },
    nav: {
      dashboard: 'Painel',
      designs: 'Designs',
      collaboration: 'Colaboração',
      analytics: 'Analíticos',
      settings: 'Configurações'
    },
    dashboard: {
      welcome: 'Bem-vindo de volta!',
      recentActivity: 'Atividade Recente',
      statistics: 'Estatísticas',
      quickActions: 'Ações Rápidas'
    }
  },
  zh: {
    common: {
      loading: '加载中...',
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      create: '创建',
      search: '搜索',
      next: '下一个',
      previous: '上一个',
      close: '关闭'
    },
    nav: {
      dashboard: '仪表板',
      designs: '设计',
      collaboration: '协作',
      analytics: '分析',
      settings: '设置'
    },
    dashboard: {
      welcome: '欢迎回来！',
      recentActivity: '最近活动',
      statistics: '统计',
      quickActions: '快速操作'
    }
  },
  ja: {
    common: {
      loading: '読み込み中...',
      save: '保存',
      cancel: 'キャンセル',
      delete: '削除',
      edit: '編集',
      create: '作成',
      search: '検索',
      next: '次へ',
      previous: '前へ',
      close: '閉じる'
    },
    nav: {
      dashboard: 'ダッシュボード',
      designs: 'デザイン',
      collaboration: 'コラボレーション',
      analytics: '分析',
      settings: '設定'
    },
    dashboard: {
      welcome: 'おかえりなさい！',
      recentActivity: '最近のアクティビティ',
      statistics: '統計',
      quickActions: 'クイックアクション'
    }
  },
  ko: {
    common: {
      loading: '로딩 중...',
      save: '저장',
      cancel: '취소',
      delete: '삭제',
      edit: '편집',
      create: '생성',
      search: '검색',
      next: '다음',
      previous: '이전',
      close: '닫기'
    },
    nav: {
      dashboard: '대시보드',
      designs: '디자인',
      collaboration: '협업',
      analytics: '분석',
      settings: '설정'
    },
    dashboard: {
      welcome: '다시 오신 것을 환영합니다!',
      recentActivity: '최근 활동',
      statistics: '통계',
      quickActions: '빠른 작업'
    }
  },
  ar: {
    common: {
      loading: 'جاري التحميل...',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تحرير',
      create: 'إنشاء',
      search: 'بحث',
      next: 'التالي',
      previous: 'السابق',
      close: 'إغلاق'
    },
    nav: {
      dashboard: 'لوحة التحكم',
      designs: 'التصاميم',
      collaboration: 'التعاون',
      analytics: 'التحليلات',
      settings: 'الإعدادات'
    },
    dashboard: {
      welcome: 'مرحباً بعودتك!',
      recentActivity: 'النشاط الحديث',
      statistics: 'الإحصائيات',
      quickActions: 'الإجراءات السريعة'
    }
  }
};

const availableLanguages = [
  { code: 'en' as Language, name: 'English', nativeName: 'English' },
  { code: 'es' as Language, name: 'Spanish', nativeName: 'Español' },
  { code: 'fr' as Language, name: 'French', nativeName: 'Français' },
  { code: 'de' as Language, name: 'German', nativeName: 'Deutsch' },
  { code: 'pt' as Language, name: 'Portuguese', nativeName: 'Português' },
  { code: 'zh' as Language, name: 'Chinese', nativeName: '中文' },
  { code: 'ja' as Language, name: 'Japanese', nativeName: '日本語' },
  { code: 'ko' as Language, name: 'Korean', nativeName: '한국어' },
  { code: 'ar' as Language, name: 'Arabic', nativeName: 'العربية' }
];

const rtlLanguages: Language[] = ['ar'];

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const { toast } = useToast();

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('preferred-language') as Language;
    if (savedLanguage && availableLanguages.some(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    } else {
      // Detect browser language
      const browserLanguage = navigator.language.split('-')[0] as Language;
      if (availableLanguages.some(lang => lang.code === browserLanguage)) {
        setCurrentLanguage(browserLanguage);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    localStorage.setItem('preferred-language', lang);
    
    // Update document direction for RTL languages
    document.dir = rtlLanguages.includes(lang) ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    toast({
      title: 'Language Changed',
      description: `Language changed to ${availableLanguages.find(l => l.code === lang)?.nativeName}`
    });
  };

  const getNestedValue = (obj: Translation, path: string): string => {
    return path.split('.').reduce((current, key) => {
      return (current && typeof current === 'object' && key in current) 
        ? current[key] as Translation
        : '';
    }, obj) as string;
  };

  const t = (key: string, params?: Record<string, string>): string => {
    const translation = getNestedValue(translations[currentLanguage], key) || 
                       getNestedValue(translations.en, key) || 
                       key;
    
    if (params && typeof translation === 'string') {
      return Object.entries(params).reduce(
        (str, [paramKey, paramValue]) => str.replace(`{{${paramKey}}}`, paramValue),
        translation
      );
    }
    
    return translation;
  };

  const isRTL = rtlLanguages.includes(currentLanguage);

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    isRTL,
    availableLanguages
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};