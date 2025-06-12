// 存储键名
export const STORAGE_KEYS = {
  PROMPTS: 'prompts',
  CATEGORIES: 'categories',
  TAGS: 'tags',
  SETTINGS: 'settings',
  METADATA: 'metadata',
} as const;

// 默认分类
export const DEFAULT_CATEGORIES = [
  {
    id: 'writing',
    name: '写作',
    color: '#2196F3',
    icon: 'edit',
    order: 1,
  },
  {
    id: 'coding',
    name: '编程',
    color: '#4CAF50',
    icon: 'code',
    order: 2,
  },
  {
    id: 'analysis',
    name: '分析',
    color: '#FF9800',
    icon: 'analytics',
    order: 3,
  },
  {
    id: 'creative',
    name: '创意',
    color: '#E91E63',
    icon: 'lightbulb',
    order: 4,
  },
  {
    id: 'business',
    name: '商务',
    color: '#9C27B0',
    icon: 'business',
    order: 5,
  },
  {
    id: 'academic',
    name: '学术',
    color: '#607D8B',
    icon: 'school',
    order: 6,
  },
] as const;

// 默认设置
export const DEFAULT_SETTINGS = {
  theme: 'auto' as const,
  language: 'zh' as const,
  defaultCategory: 'writing',
  autoBackup: true,
  obsidian: {
    vaultName: '',
    enabled: false,
    autoOpen: true,
    folderStructure: 'flat' as const,
    includeFrontMatter: true,
    includeBacklinks: false,
  },
  shortcuts: {
    'open-prompt-manager': 'Ctrl+Shift+P',
    'quick-insert': 'Ctrl+Shift+I',
  },
  ui: {
    showLineNumbers: true,
    wordWrap: true,
    fontSize: 14,
  },
};

// 版本号格式
export const VERSION_PATTERN = /^v?(\d+)\.(\d+)\.(\d+)$/;

// 搜索配置
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  MAX_RESULTS: 50,
  DEBOUNCE_DELAY: 300,
} as const;

// UI配置
export const UI_CONFIG = {
  POPUP_WIDTH: 400,
  POPUP_HEIGHT: 600,
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_CONTENT_LENGTH: 10000,
} as const;

// 消息类型
export const MESSAGE_TYPES = {
  GET_PROMPTS: 'GET_PROMPTS',
  SAVE_PROMPT: 'SAVE_PROMPT',
  DELETE_PROMPT: 'DELETE_PROMPT',
  INSERT_TEXT: 'INSERT_TEXT',
  GET_PAGE_INFO: 'GET_PAGE_INFO',
  SHOW_PROMPT_SELECTOR: 'SHOW_PROMPT_SELECTOR',
  COPY_TO_CLIPBOARD: 'COPY_TO_CLIPBOARD',
} as const;

// 错误消息
export const ERROR_MESSAGES = {
  STORAGE_ERROR: '存储操作失败',
  NETWORK_ERROR: '网络连接错误',
  VALIDATION_ERROR: '数据验证失败',
  PERMISSION_ERROR: '权限不足',
  UNKNOWN_ERROR: '未知错误',
} as const;

// 成功消息
export const SUCCESS_MESSAGES = {
  PROMPT_SAVED: '提示词保存成功',
  PROMPT_DELETED: '提示词删除成功',
  PROMPT_COPIED: '提示词已复制到剪贴板',
  SETTINGS_SAVED: '设置保存成功',
  DATA_EXPORTED: '数据导出成功',
  DATA_IMPORTED: '数据导入成功',
} as const;

// 文件类型
export const FILE_TYPES = {
  JSON: 'application/json',
  CSV: 'text/csv',
  MARKDOWN: 'text/markdown',
} as const;

// 主题颜色
export const THEME_COLORS = {
  primary: '#1976d2',
  secondary: '#dc004e',
  success: '#2e7d32',
  warning: '#ed6c02',
  error: '#d32f2f',
  info: '#0288d1',
} as const;

// 动画配置
export const ANIMATION_CONFIG = {
  DURATION: {
    SHORT: 200,
    MEDIUM: 300,
    LONG: 500,
  },
  EASING: {
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
  },
} as const;
