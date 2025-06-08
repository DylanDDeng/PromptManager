import { 
  Prompt, 
  Category, 
  Tag, 
  UserSettings, 
  StorageData, 
  SearchQuery,
  SearchResult 
} from '../types';
import { 
  STORAGE_KEYS, 
  DEFAULT_CATEGORIES, 
  DEFAULT_SETTINGS 
} from '../constants';
import { v4 as uuidv4 } from 'uuid';

class StorageService {
  // 获取Chrome存储数据
  private async getStorageData<T>(key: string): Promise<T | null> {
    try {
      const result = await chrome.storage.local.get(key);
      return result[key] || null;
    } catch (error) {
      console.error(`Failed to get storage data for key: ${key}`, error);
      return null;
    }
  }

  // 设置Chrome存储数据
  private async setStorageData<T>(key: string, data: T): Promise<void> {
    try {
      await chrome.storage.local.set({ [key]: data });
    } catch (error) {
      console.error(`Failed to set storage data for key: ${key}`, error);
      throw error;
    }
  }

  // 初始化存储
  async initializeStorage(): Promise<void> {
    try {
      // 检查是否已初始化
      const metadata = await this.getStorageData(STORAGE_KEYS.METADATA);
      
      if (!metadata) {
        // 首次初始化
        await this.setStorageData(STORAGE_KEYS.PROMPTS, {});
        await this.setStorageData(STORAGE_KEYS.CATEGORIES, this.createDefaultCategories());
        await this.setStorageData(STORAGE_KEYS.TAGS, {});
        await this.setStorageData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
        await this.setStorageData(STORAGE_KEYS.METADATA, {
          version: '1.0.0',
          totalPrompts: 0,
          lastBackup: null,
        });
      }
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      throw error;
    }
  }

  // 创建默认分类
  private createDefaultCategories(): Record<string, Category> {
    const categories: Record<string, Category> = {};
    DEFAULT_CATEGORIES.forEach(cat => {
      categories[cat.id] = { ...cat };
    });
    return categories;
  }

  // 提示词相关方法
  async getAllPrompts(): Promise<Prompt[]> {
    const prompts = await this.getStorageData<Record<string, Prompt>>(STORAGE_KEYS.PROMPTS);
    return prompts ? Object.values(prompts) : [];
  }

  async getPromptById(id: string): Promise<Prompt | null> {
    const prompts = await this.getStorageData<Record<string, Prompt>>(STORAGE_KEYS.PROMPTS);
    return prompts?.[id] || null;
  }

  async savePrompt(prompt: Prompt): Promise<void> {
    const prompts = await this.getStorageData<Record<string, Prompt>>(STORAGE_KEYS.PROMPTS) || {};
    
    // 如果是新提示词，生成ID
    if (!prompt.id) {
      prompt.id = uuidv4();
      prompt.createdAt = new Date();
    }
    
    prompt.updatedAt = new Date();
    prompts[prompt.id] = prompt;
    
    await this.setStorageData(STORAGE_KEYS.PROMPTS, prompts);
    
    // 更新元数据
    await this.updateMetadata();
  }

  async deletePrompt(id: string): Promise<void> {
    const prompts = await this.getStorageData<Record<string, Prompt>>(STORAGE_KEYS.PROMPTS) || {};
    delete prompts[id];
    await this.setStorageData(STORAGE_KEYS.PROMPTS, prompts);
    await this.updateMetadata();
  }

  async searchPrompts(query: SearchQuery): Promise<SearchResult> {
    const allPrompts = await this.getAllPrompts();
    let filteredPrompts = allPrompts;

    // 文本搜索
    if (query.text) {
      const searchText = query.text.toLowerCase();
      filteredPrompts = filteredPrompts.filter(prompt => 
        prompt.title.toLowerCase().includes(searchText) ||
        prompt.content.toLowerCase().includes(searchText) ||
        prompt.description?.toLowerCase().includes(searchText) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(searchText))
      );
    }

    // 分类筛选
    if (query.categories && query.categories.length > 0) {
      filteredPrompts = filteredPrompts.filter(prompt => 
        query.categories!.includes(prompt.category)
      );
    }

    // 标签筛选
    if (query.tags && query.tags.length > 0) {
      filteredPrompts = filteredPrompts.filter(prompt => 
        query.tags!.some(tag => prompt.tags.includes(tag))
      );
    }

    // 日期范围筛选
    if (query.dateRange) {
      filteredPrompts = filteredPrompts.filter(prompt => {
        const createdAt = new Date(prompt.createdAt);
        return createdAt >= query.dateRange!.start && createdAt <= query.dateRange!.end;
      });
    }

    // 排序
    if (query.sortBy) {
      filteredPrompts.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (query.sortBy) {
          case 'createdAt':
          case 'updatedAt':
            aValue = new Date(a[query.sortBy!]);
            bValue = new Date(b[query.sortBy!]);
            break;
          case 'usageCount':
            aValue = a.metadata.usageCount;
            bValue = b.metadata.usageCount;
            break;
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          default:
            return 0;
        }

        if (query.sortOrder === 'desc') {
          return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
      });
    }

    return {
      prompts: filteredPrompts,
      total: filteredPrompts.length,
      hasMore: false, // 暂时不实现分页
    };
  }

  // 分类相关方法
  async getAllCategories(): Promise<Category[]> {
    const categories = await this.getStorageData<Record<string, Category>>(STORAGE_KEYS.CATEGORIES);
    return categories ? Object.values(categories).sort((a, b) => a.order - b.order) : [];
  }

  async saveCategory(category: Category): Promise<void> {
    const categories = await this.getStorageData<Record<string, Category>>(STORAGE_KEYS.CATEGORIES) || {};
    
    if (!category.id) {
      category.id = uuidv4();
    }
    
    categories[category.id] = category;
    await this.setStorageData(STORAGE_KEYS.CATEGORIES, categories);
  }

  async deleteCategory(id: string): Promise<void> {
    const categories = await this.getStorageData<Record<string, Category>>(STORAGE_KEYS.CATEGORIES) || {};
    delete categories[id];
    await this.setStorageData(STORAGE_KEYS.CATEGORIES, categories);
  }

  // 标签相关方法
  async getAllTags(): Promise<Tag[]> {
    const tags = await this.getStorageData<Record<string, Tag>>(STORAGE_KEYS.TAGS);
    return tags ? Object.values(tags).sort((a, b) => b.usageCount - a.usageCount) : [];
  }

  async saveTag(tag: Tag): Promise<void> {
    const tags = await this.getStorageData<Record<string, Tag>>(STORAGE_KEYS.TAGS) || {};
    
    if (!tag.id) {
      tag.id = uuidv4();
    }
    
    tags[tag.id] = tag;
    await this.setStorageData(STORAGE_KEYS.TAGS, tags);
  }

  async deleteTag(id: string): Promise<void> {
    const tags = await this.getStorageData<Record<string, Tag>>(STORAGE_KEYS.TAGS) || {};
    delete tags[id];
    await this.setStorageData(STORAGE_KEYS.TAGS, tags);
  }

  // 设置相关方法
  async getSettings(): Promise<UserSettings> {
    const settings = await this.getStorageData<UserSettings>(STORAGE_KEYS.SETTINGS);
    return settings || DEFAULT_SETTINGS;
  }

  async saveSettings(settings: Partial<UserSettings>): Promise<void> {
    const currentSettings = await this.getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    await this.setStorageData(STORAGE_KEYS.SETTINGS, updatedSettings);
  }

  // 更新元数据
  private async updateMetadata(): Promise<void> {
    const prompts = await this.getAllPrompts();
    const metadata = {
      version: '1.0.0',
      totalPrompts: prompts.length,
      lastBackup: new Date(),
    };
    await this.setStorageData(STORAGE_KEYS.METADATA, metadata);
  }

  // 导出数据
  async exportData(): Promise<StorageData> {
    const [prompts, categories, tags, settings, metadata] = await Promise.all([
      this.getStorageData<Record<string, Prompt>>(STORAGE_KEYS.PROMPTS),
      this.getStorageData<Record<string, Category>>(STORAGE_KEYS.CATEGORIES),
      this.getStorageData<Record<string, Tag>>(STORAGE_KEYS.TAGS),
      this.getStorageData<UserSettings>(STORAGE_KEYS.SETTINGS),
      this.getStorageData<any>(STORAGE_KEYS.METADATA),
    ]);

    const defaultMetadata = {
      version: '1.0.0',
      totalPrompts: 0,
      lastBackup: undefined as Date | undefined
    };

    return {
      prompts: prompts || {},
      categories: categories || {},
      tags: tags || {},
      settings: settings || DEFAULT_SETTINGS,
      metadata: metadata || defaultMetadata,
    };
  }

  // 导入数据
  async importData(data: StorageData): Promise<void> {
    await Promise.all([
      this.setStorageData(STORAGE_KEYS.PROMPTS, data.prompts),
      this.setStorageData(STORAGE_KEYS.CATEGORIES, data.categories),
      this.setStorageData(STORAGE_KEYS.TAGS, data.tags),
      this.setStorageData(STORAGE_KEYS.SETTINGS, data.settings),
      this.setStorageData(STORAGE_KEYS.METADATA, data.metadata),
    ]);
  }

  // 清空所有数据
  async clearAllData(): Promise<void> {
    await chrome.storage.local.clear();
    await this.initializeStorage();
  }
}

export const storageService = new StorageService();
