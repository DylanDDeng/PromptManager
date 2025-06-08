import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, AppAction, Prompt, Category, Tag, UserSettings } from '../types';
import { storageService } from '../services/storageService';
import { DEFAULT_SETTINGS } from '../constants';

// 初始状态
const initialState: AppState = {
  prompts: [],
  categories: [],
  tags: [],
  settings: DEFAULT_SETTINGS,
  ui: {
    loading: false,
    selectedPrompt: undefined,
    searchQuery: '',
    activeCategory: undefined,
    theme: 'light',
  },
};

// Reducer函数
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'LOAD_PROMPTS':
      return {
        ...state,
        prompts: action.payload,
        ui: { ...state.ui, loading: false },
      };

    case 'ADD_PROMPT':
      return {
        ...state,
        prompts: [...state.prompts, action.payload],
      };

    case 'UPDATE_PROMPT':
      return {
        ...state,
        prompts: state.prompts.map(prompt =>
          prompt.id === action.payload.id
            ? { ...prompt, ...action.payload.updates }
            : prompt
        ),
      };

    case 'DELETE_PROMPT':
      return {
        ...state,
        prompts: state.prompts.filter(prompt => prompt.id !== action.payload),
        ui: {
          ...state.ui,
          selectedPrompt: state.ui.selectedPrompt === action.payload 
            ? undefined 
            : state.ui.selectedPrompt,
        },
      };

    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        ui: { ...state.ui, searchQuery: action.payload },
      };

    case 'SET_LOADING':
      return {
        ...state,
        ui: { ...state.ui, loading: action.payload },
      };

    case 'SET_SELECTED_PROMPT':
      return {
        ...state,
        ui: { ...state.ui, selectedPrompt: action.payload },
      };

    case 'SET_ACTIVE_CATEGORY':
      return {
        ...state,
        ui: { ...state.ui, activeCategory: action.payload },
      };

    case 'LOAD_CATEGORIES':
      return {
        ...state,
        categories: action.payload,
      };

    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };

    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.id
            ? { ...category, ...action.payload.updates }
            : category
        ),
      };

    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(category => category.id !== action.payload),
      };

    case 'LOAD_TAGS':
      return {
        ...state,
        tags: action.payload,
      };

    case 'ADD_TAG':
      return {
        ...state,
        tags: [...state.tags, action.payload],
      };

    case 'UPDATE_TAG':
      return {
        ...state,
        tags: state.tags.map(tag =>
          tag.id === action.payload.id
            ? { ...tag, ...action.payload.updates }
            : tag
        ),
      };

    case 'DELETE_TAG':
      return {
        ...state,
        tags: state.tags.filter(tag => tag.id !== action.payload),
      };

    case 'LOAD_SETTINGS':
      return {
        ...state,
        settings: action.payload,
        ui: {
          ...state.ui,
          theme: action.payload.theme === 'auto' 
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : action.payload.theme,
        },
      };

    case 'UPDATE_SETTINGS':
      const updatedSettings = { ...state.settings, ...action.payload };
      return {
        ...state,
        settings: updatedSettings,
        ui: {
          ...state.ui,
          theme: updatedSettings.theme === 'auto'
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : updatedSettings.theme,
        },
      };

    default:
      return state;
  }
};

// Context类型
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    // 提示词操作
    loadPrompts: () => Promise<void>;
    savePrompt: (prompt: Prompt) => Promise<void>;
    deletePrompt: (id: string) => Promise<void>;
    selectPrompt: (id: string | undefined) => void;
    
    // 分类操作
    loadCategories: () => Promise<void>;
    saveCategory: (category: Category) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    setActiveCategory: (id: string | undefined) => void;
    
    // 标签操作
    loadTags: () => Promise<void>;
    saveTag: (tag: Tag) => Promise<void>;
    deleteTag: (id: string) => Promise<void>;
    
    // 设置操作
    loadSettings: () => Promise<void>;
    saveSettings: (settings: Partial<UserSettings>) => Promise<void>;
    
    // UI操作
    setSearchQuery: (query: string) => void;
    setLoading: (loading: boolean) => void;

    // 数据操作
    exportData: () => Promise<any>;
    importData: (data: any) => Promise<void>;
  };
}

// 创建Context
const AppContext = createContext<AppContextType | null>(null);

// Provider组件
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 初始化存储
  useEffect(() => {
    const initializeApp = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        await storageService.initializeStorage();
        await Promise.all([
          actions.loadPrompts(),
          actions.loadCategories(),
          actions.loadTags(),
          actions.loadSettings(),
        ]);
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeApp();
  }, []);

  // 监听系统主题变化
  useEffect(() => {
    if (state.settings.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        dispatch({
          type: 'UPDATE_SETTINGS',
          payload: { theme: 'auto' }, // 触发重新计算主题
        });
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [state.settings.theme]);

  // 操作方法
  const actions = {
    // 提示词操作
    loadPrompts: async () => {
      try {
        const prompts = await storageService.getAllPrompts();
        dispatch({ type: 'LOAD_PROMPTS', payload: prompts });
      } catch (error) {
        console.error('Failed to load prompts:', error);
      }
    },

    savePrompt: async (prompt: Prompt) => {
      try {
        await storageService.savePrompt(prompt);
        if (prompt.id && state.prompts.find(p => p.id === prompt.id)) {
          dispatch({ type: 'UPDATE_PROMPT', payload: { id: prompt.id, updates: prompt } });
        } else {
          dispatch({ type: 'ADD_PROMPT', payload: prompt });
        }
      } catch (error) {
        console.error('Failed to save prompt:', error);
        throw error;
      }
    },

    deletePrompt: async (id: string) => {
      try {
        await storageService.deletePrompt(id);
        dispatch({ type: 'DELETE_PROMPT', payload: id });
      } catch (error) {
        console.error('Failed to delete prompt:', error);
        throw error;
      }
    },

    selectPrompt: (id: string | undefined) => {
      dispatch({ type: 'SET_SELECTED_PROMPT', payload: id });
    },

    // 分类操作
    loadCategories: async () => {
      try {
        const categories = await storageService.getAllCategories();
        dispatch({ type: 'LOAD_CATEGORIES', payload: categories });
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    },

    saveCategory: async (category: Category) => {
      try {
        await storageService.saveCategory(category);
        if (category.id && state.categories.find(c => c.id === category.id)) {
          dispatch({ type: 'UPDATE_CATEGORY', payload: { id: category.id, updates: category } });
        } else {
          dispatch({ type: 'ADD_CATEGORY', payload: category });
        }
      } catch (error) {
        console.error('Failed to save category:', error);
        throw error;
      }
    },

    deleteCategory: async (id: string) => {
      try {
        await storageService.deleteCategory(id);
        dispatch({ type: 'DELETE_CATEGORY', payload: id });
      } catch (error) {
        console.error('Failed to delete category:', error);
        throw error;
      }
    },

    setActiveCategory: (id: string | undefined) => {
      dispatch({ type: 'SET_ACTIVE_CATEGORY', payload: id });
    },

    // 标签操作
    loadTags: async () => {
      try {
        const tags = await storageService.getAllTags();
        dispatch({ type: 'LOAD_TAGS', payload: tags });
      } catch (error) {
        console.error('Failed to load tags:', error);
      }
    },

    saveTag: async (tag: Tag) => {
      try {
        await storageService.saveTag(tag);
        if (tag.id && state.tags.find(t => t.id === tag.id)) {
          dispatch({ type: 'UPDATE_TAG', payload: { id: tag.id, updates: tag } });
        } else {
          dispatch({ type: 'ADD_TAG', payload: tag });
        }
      } catch (error) {
        console.error('Failed to save tag:', error);
        throw error;
      }
    },

    deleteTag: async (id: string) => {
      try {
        await storageService.deleteTag(id);
        dispatch({ type: 'DELETE_TAG', payload: id });
      } catch (error) {
        console.error('Failed to delete tag:', error);
        throw error;
      }
    },

    // 设置操作
    loadSettings: async () => {
      try {
        const settings = await storageService.getSettings();
        dispatch({ type: 'LOAD_SETTINGS', payload: settings });
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    },

    saveSettings: async (settings: Partial<UserSettings>) => {
      try {
        await storageService.saveSettings(settings);
        dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
      } catch (error) {
        console.error('Failed to save settings:', error);
        throw error;
      }
    },

    // UI操作
    setSearchQuery: (query: string) => {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    },

    setLoading: (loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    },

    // 数据操作
    exportData: async () => {
      try {
        return await storageService.exportData();
      } catch (error) {
        console.error('Failed to export data:', error);
        throw error;
      }
    },

    importData: async (data: any) => {
      try {
        await storageService.importData(data);
        // 重新加载所有数据
        await Promise.all([
          actions.loadPrompts(),
          actions.loadCategories(),
          actions.loadTags(),
          actions.loadSettings(),
        ]);
      } catch (error) {
        console.error('Failed to import data:', error);
        throw error;
      }
    },
  };

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook for using the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
