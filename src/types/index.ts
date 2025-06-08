// 提示词接口
export interface Prompt {
  id: string;                    // 唯一标识
  title: string;                 // 标题
  content: string;               // 内容
  description?: string;          // 描述
  category: string;              // 分类
  tags: string[];               // 标签
  variables: Variable[];         // 模板变量
  version: string;              // 当前版本
  versions: PromptVersion[];     // 版本历史
  metadata: PromptMetadata;      // 元数据
  createdAt: Date;              // 创建时间
  updatedAt: Date;              // 更新时间
}

// 版本信息
export interface PromptVersion {
  version: string;              // 版本号
  content: string;              // 版本内容
  title: string;                // 版本标题
  description?: string;         // 版本描述
  createdAt: Date;             // 创建时间
  changes?: string;            // 变更说明
  label?: string;              // 版本标签
}

// 元数据
export interface PromptMetadata {
  usageCount: number;          // 使用次数
  lastUsedAt?: Date;          // 最后使用时间
  isFavorite: boolean;        // 是否收藏
  isTemplate: boolean;        // 是否为模板
  author?: string;            // 作者
  source?: string;            // 来源
}

// 模板变量
export interface Variable {
  name: string;               // 变量名
  type: 'text' | 'select' | 'number'; // 变量类型
  label: string;              // 显示标签
  defaultValue?: string;      // 默认值
  options?: string[];         // 选项（select类型）
  required: boolean;          // 是否必填
}

// 分类
export interface Category {
  id: string;                 // 分类ID
  name: string;               // 分类名称
  color: string;              // 分类颜色
  icon?: string;              // 分类图标
  parentId?: string;          // 父分类ID
  order: number;              // 排序
}

// 标签
export interface Tag {
  id: string;                 // 标签ID
  name: string;               // 标签名称
  color: string;              // 标签颜色
  usageCount: number;         // 使用次数
}

// Chrome Storage 数据结构
export interface StorageData {
  prompts: Record<string, Prompt>;      // 提示词数据
  categories: Record<string, Category>; // 分类数据
  tags: Record<string, Tag>;           // 标签数据
  settings: UserSettings;              // 用户设置
  metadata: {
    version: string;                   // 数据版本
    lastBackup?: Date;                // 最后备份时间
    totalPrompts: number;             // 提示词总数
  };
}

// 用户设置
export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';   // 主题
  language: 'zh' | 'en';              // 语言
  defaultCategory: string;            // 默认分类
  autoBackup: boolean;                // 自动备份
  shortcuts: Record<string, string>;  // 快捷键设置
  ui: {
    showLineNumbers: boolean;         // 显示行号
    wordWrap: boolean;               // 自动换行
    fontSize: number;                // 字体大小
  };
}

// 搜索查询
export interface SearchQuery {
  text?: string;                      // 搜索文本
  categories?: string[];              // 分类筛选
  tags?: string[];                   // 标签筛选
  dateRange?: {                      // 日期范围
    start: Date;
    end: Date;
  };
  sortBy?: 'createdAt' | 'updatedAt' | 'usageCount' | 'title'; // 排序字段
  sortOrder?: 'asc' | 'desc';        // 排序方向
}

// 搜索结果
export interface SearchResult {
  prompts: Prompt[];
  total: number;
  hasMore: boolean;
}

// 消息类型
export interface Message {
  action: string;
  data?: any;
}

// 页面信息
export interface PageInfo {
  url: string;
  title: string;
  selectedText?: string;
}

// 导入导出格式
export type ExportFormat = 'json' | 'csv' | 'markdown';

// 版本变更类型
export type ChangeType = 'major' | 'minor' | 'patch';

// 应用状态
export interface AppState {
  prompts: Prompt[];
  categories: Category[];
  tags: Tag[];
  settings: UserSettings;
  ui: {
    loading: boolean;
    selectedPrompt?: string;
    searchQuery: string;
    activeCategory?: string;
    theme: 'light' | 'dark';
  };
}

// 应用动作
export type AppAction = 
  | { type: 'LOAD_PROMPTS'; payload: Prompt[] }
  | { type: 'ADD_PROMPT'; payload: Prompt }
  | { type: 'UPDATE_PROMPT'; payload: { id: string; updates: Partial<Prompt> } }
  | { type: 'DELETE_PROMPT'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SELECTED_PROMPT'; payload: string | undefined }
  | { type: 'SET_ACTIVE_CATEGORY'; payload: string | undefined }
  | { type: 'LOAD_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: { id: string; updates: Partial<Category> } }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'LOAD_TAGS'; payload: Tag[] }
  | { type: 'ADD_TAG'; payload: Tag }
  | { type: 'UPDATE_TAG'; payload: { id: string; updates: Partial<Tag> } }
  | { type: 'DELETE_TAG'; payload: string }
  | { type: 'LOAD_SETTINGS'; payload: UserSettings }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> };
