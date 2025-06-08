import { Prompt, Category, Tag, PromptVersion } from '../types';

export interface ExportItem {
  prompt: Prompt;
  version?: string;
  includeHistory: boolean;
}

export type ExportFormat = 'json' | 'markdown' | 'csv';

export interface ExportData {
  prompts: any[];
  categories: Category[];
  tags: Tag[];
}

class ExportService {
  // 主导出方法
  async exportData(
    items: ExportItem[], 
    categories: Category[], 
    tags: Tag[], 
    format: ExportFormat
  ): Promise<void> {
    const exportData = this.prepareExportData(items, categories, tags, format);
    
    switch (format) {
      case 'json':
        this.downloadJSON(exportData);
        break;
      case 'markdown':
        this.downloadMarkdown(exportData);
        break;
      case 'csv':
        this.downloadCSV(exportData);
        break;
    }
  }

  // 准备导出数据
  private prepareExportData(
    items: ExportItem[],
    categories: Category[],
    tags: Tag[],
    format: ExportFormat
  ): ExportData {
    const processedPrompts = items.map(item => {
      if (item.includeHistory) {
        // 导出完整提示词（只保留必要字段）
        return {
          id: item.prompt.id,
          title: item.prompt.title,
          content: item.prompt.content,
          description: item.prompt.description,
          category: item.prompt.category,
          tags: item.prompt.tags,
          version: item.prompt.version,
          versions: item.prompt.versions, // 包含版本历史
          createdAt: item.prompt.createdAt,
          updatedAt: item.prompt.updatedAt,
        };
      } else {
        // 导出特定版本（只保留必要字段）
        const targetVersion = item.prompt.versions.find(v => v.version === item.version);
        if (!targetVersion) {
          // 如果找不到指定版本，返回当前版本的精简数据
          return {
            id: item.prompt.id,
            title: item.prompt.title,
            content: item.prompt.content,
            description: item.prompt.description,
            category: item.prompt.category,
            tags: item.prompt.tags,
            version: item.prompt.version,
            createdAt: item.prompt.createdAt,
            updatedAt: item.prompt.updatedAt,
          };
        }

        return {
          id: item.prompt.id,
          title: targetVersion.title,
          content: targetVersion.content,
          description: targetVersion.description,
          category: item.prompt.category,
          tags: item.prompt.tags,
          version: targetVersion.version,
          createdAt: targetVersion.createdAt,
        };
      }
    });

    // 只导出相关的分类和标签
    const usedCategoryIds = new Set(processedPrompts.map(p => p.category));
    const usedTagNames = new Set(processedPrompts.flatMap(p => p.tags || []));

    const relevantCategories = categories.filter(cat => usedCategoryIds.has(cat.id));
    const relevantTags = tags.filter(tag => usedTagNames.has(tag.name));

    return {
      prompts: processedPrompts,
      categories: relevantCategories,
      tags: relevantTags,
    };
  }

  // JSON格式导出
  private downloadJSON(data: ExportData): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    this.downloadFile(blob, `prompt-manager-export-${this.getDateString()}.json`);
  }

  // Markdown格式导出
  private downloadMarkdown(data: ExportData): void {
    let markdown = `# Prompt Manager Export\n\n`;
    markdown += `**Exported at:** ${new Date().toLocaleString()}\n`;
    markdown += `**Total items:** ${data.prompts.length}\n\n`;

    // 导出分类信息
    if (data.categories.length > 0) {
      markdown += `## Categories\n\n`;
      data.categories.forEach(category => {
        markdown += `- **${category.name}** (${category.id})\n`;
      });
      markdown += `\n`;
    }

    // 导出标签信息
    if (data.tags.length > 0) {
      markdown += `## Tags\n\n`;
      data.tags.forEach(tag => {
        markdown += `- ${tag.name} (used ${tag.usageCount} times)\n`;
      });
      markdown += `\n`;
    }

    // 导出提示词
    markdown += `## Prompts\n\n`;
    data.prompts.forEach((prompt, index) => {
      markdown += `### ${index + 1}. ${prompt.title}\n\n`;
      markdown += `**Version:** ${prompt.version}\n`;
      markdown += `**Category:** ${prompt.category}\n`;
      if (prompt.tags && prompt.tags.length > 0) {
        markdown += `**Tags:** ${prompt.tags.join(', ')}\n`;
      }
      if (prompt.description) {
        markdown += `**Description:** ${prompt.description}\n`;
      }
      markdown += `**Created:** ${new Date(prompt.createdAt).toLocaleString()}\n\n`;
      
      markdown += `**Content:**\n\n`;
      markdown += `\`\`\`\n${prompt.content}\n\`\`\`\n\n`;

      // 如果包含版本历史
      if (prompt.versions && prompt.versions.length > 1) {
        markdown += `**Version History:**\n\n`;
        prompt.versions.forEach((version: PromptVersion) => {
          markdown += `- **${version.version}** (${new Date(version.createdAt).toLocaleString()})`;
          if (version.changes) {
            markdown += `: ${version.changes}`;
          }
          markdown += `\n`;
        });
        markdown += `\n`;
      }

      markdown += `---\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    this.downloadFile(blob, `prompt-manager-export-${this.getDateString()}.md`);
  }

  // CSV格式导出
  private downloadCSV(data: ExportData): void {
    const headers = [
      'ID',
      'Title', 
      'Content',
      'Description',
      'Category',
      'Tags',
      'Version',
      'Created At'
    ];

    const rows = data.prompts.map(prompt => [
      prompt.id,
      this.escapeCsvField(prompt.title),
      this.escapeCsvField(prompt.content),
      this.escapeCsvField(prompt.description || ''),
      prompt.category,
      prompt.tags ? prompt.tags.join('; ') : '',
      prompt.version,
      new Date(prompt.createdAt).toISOString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    this.downloadFile(blob, `prompt-manager-export-${this.getDateString()}.csv`);
  }

  // CSV字段转义
  private escapeCsvField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  // 下载文件
  private downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 获取日期字符串
  private getDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  // 预览导出内容（用于调试）
  previewExport(items: ExportItem[], categories: Category[], tags: Tag[], format: ExportFormat): string {
    const data = this.prepareExportData(items, categories, tags, format);

    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'markdown':
        // 返回markdown预览（简化版）
        return `# Export Preview\n\nPrompts: ${data.prompts.length}\nCategories: ${data.categories.length}\nTags: ${data.tags.length}`;
      case 'csv':
        return `CSV Export Preview\nPrompts: ${data.prompts.length}`;
      default:
        return 'Unknown format';
    }
  }
}

export const exportService = new ExportService();
