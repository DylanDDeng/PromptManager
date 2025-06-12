import { Prompt, Category, Tag, PromptVersion, ObsidianConfig } from '../types';

export interface ExportItem {
  prompt: Prompt;
  version?: string;
  includeHistory: boolean;
}

export type ExportFormat = 'json' | 'markdown' | 'csv' | 'obsidian';

export interface ExportData {
  prompts: Prompt[];
  categories: Category[];
  tags: Tag[];
}

class ExportService {
  // 主导出方法
  async exportData(
    items: ExportItem[],
    categories: Category[],
    tags: Tag[],
    format: ExportFormat,
    obsidianConfig?: ObsidianConfig
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
      case 'obsidian':
        await this.exportToObsidian(exportData, obsidianConfig);
        break;
    }
  }

  // 准备导出数据
  private prepareExportData(
    items: ExportItem[],
    categories: Category[],
    tags: Tag[],
    _format: ExportFormat
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
          variables: item.prompt.variables || [],
          version: item.prompt.version,
          versions: item.prompt.versions, // 包含版本历史
          metadata: item.prompt.metadata || {
            usageCount: 0,
            isFavorite: false,
            isTemplate: false,
          },
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
            variables: item.prompt.variables || [],
            version: item.prompt.version,
            versions: item.prompt.versions,
            metadata: item.prompt.metadata || {
              usageCount: 0,
              isFavorite: false,
              isTemplate: false,
            },
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
          variables: item.prompt.variables || [],
          version: targetVersion.version,
          versions: [targetVersion], // 只包含目标版本
          metadata: item.prompt.metadata || {
            usageCount: 0,
            isFavorite: false,
            isTemplate: false,
          },
          createdAt: targetVersion.createdAt,
          updatedAt: targetVersion.createdAt,
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
      markdown += `**Created:** ${this.formatDateLocal(prompt.createdAt)}\n\n`;
      
      markdown += `**Content:**\n\n`;
      markdown += `\`\`\`\n${prompt.content}\n\`\`\`\n\n`;

      // 如果包含版本历史
      if (prompt.versions && prompt.versions.length > 1) {
        markdown += `**Version History:**\n\n`;
        prompt.versions.forEach((version: PromptVersion) => {
          markdown += `- **${version.version}** (${this.formatDateLocal(version.createdAt)})`;
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
      this.escapeCsvField(prompt.id || ''),
      this.escapeCsvField(prompt.title || ''),
      this.escapeCsvField(prompt.content || ''),
      this.escapeCsvField(prompt.description || ''),
      this.escapeCsvField(prompt.category || ''),
      this.escapeCsvField(prompt.tags ? prompt.tags.join('; ') : ''),
      this.escapeCsvField(prompt.version || ''),
      this.escapeCsvField(this.formatDate(prompt.createdAt))
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
    // 确保field是字符串
    const str = String(field || '');

    // 如果包含逗号、引号、换行符或回车符，需要用引号包围
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      // 将内部的引号转义为双引号
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  // 获取当前语言（用于国际化）
  private getCurrentLanguage(): string {
    // 从localStorage或其他地方获取语言设置，默认中文
    return localStorage.getItem('language') || 'zh';
  }

  // 获取翻译文本
  private t(key: string): string {
    const lang = this.getCurrentLanguage();
    const translations: Record<string, Record<string, string>> = {
      zh: {
        unknownDate: '未知时间',
        invalidDate: '无效日期',
        dateFormatError: '日期格式错误'
      },
      en: {
        unknownDate: 'Unknown date',
        invalidDate: 'Invalid date', 
        dateFormatError: 'Date format error'
      }
    };
    return translations[lang]?.[key] || translations.zh[key] || key;
  }

  // 安全的日期处理 - 统一的日期验证
  private validateDate(date: unknown): Date | null {
    if (!date) return null;
    
    try {
      let d: Date;
      if (date instanceof Date) {
        d = date;
      } else if (typeof date === 'string' || typeof date === 'number') {
        d = new Date(date);
      } else {
        return null;
      }
      
      // 检查是否为有效日期
      if (isNaN(d.getTime())) return null;
      
      // 检查日期范围是否合理（1970-2100）
      const year = d.getFullYear();
      if (year < 1970 || year > 2100) return null;
      
      return d;
    } catch (error) {
      console.warn('Date validation failed:', date, error);
      return null;
    }
  }

  // 格式化日期为ISO字符串
  private formatDate(date: unknown): string {
    const validDate = this.validateDate(date);
    return validDate ? validDate.toISOString() : '';
  }

  // 格式化日期为本地字符串
  private formatDateLocal(date: unknown): string {
    const validDate = this.validateDate(date);
    if (!validDate) return this.t('unknownDate');
    
    try {
      return validDate.toLocaleString(this.getCurrentLanguage() === 'en' ? 'en-US' : 'zh-CN');
    } catch (error) {
      console.warn('Failed to format date locally:', date, error);
      return this.t('dateFormatError');
    }
  }

  // 格式化日期为YYYY-MM-DD格式
  private formatDateShort(date: unknown): string {
    const validDate = this.validateDate(date);
    if (!validDate) return '';
    
    try {
      return validDate.toISOString().split('T')[0];
    } catch (error) {
      console.warn('Failed to format date short:', date, error);
      return '';
    }
  }

  // 检查Obsidian配置的有效性
  private validateObsidianConfig(config?: ObsidianConfig): { isValid: boolean; error?: string } {
    if (!config) {
      return { isValid: false, error: '未提供Obsidian配置信息' };
    }

    if (!config.enabled) {
      return { isValid: false, error: 'Obsidian集成未启用\n请在设置中启用"启用Obsidian集成"' };
    }

    if (!config.vaultName || config.vaultName.trim() === '') {
      return { isValid: false, error: 'Vault名称为空\n请在设置中输入正确的Obsidian vault名称' };
    }

    // 检查vault名称是否包含非法字符
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(config.vaultName)) {
      return { isValid: false, error: 'Vault名称包含非法字符\n请使用有效的文件夹名称' };
    }

    return { isValid: true };
  }

  // 估算URI长度（更精确）
  private estimateUriLength(content: string, vaultName: string, fileName: string): number {
    const baseUri = 'obsidian://new?vault=';
    const encodedVault = encodeURIComponent(vaultName);
    const encodedName = encodeURIComponent(fileName);
    const encodedContent = encodeURIComponent(content);
    
    return baseUri.length + encodedVault.length + encodedName.length + encodedContent.length + 20; // +20 for other parameters
  }

  // 智能选择导出策略
  private selectExportStrategy(content: string, vaultName: string, fileName: string): 'full' | 'minimal' | 'core' | 'download' {
    const fullLength = this.estimateUriLength(content, vaultName, fileName);
    
    // 根据浏览器类型调整限制
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const maxLength = isMobile ? 2000 : 8000; // 移动设备更低的限制
    
    if (fullLength <= maxLength * 0.5) return 'full';
    if (fullLength <= maxLength * 0.8) return 'minimal';
    if (fullLength <= maxLength) return 'core';
    return 'download';
  }

  // Obsidian导出
  private async exportToObsidian(data: ExportData, config?: ObsidianConfig): Promise<void> {
    console.log('Obsidian export config:', config);

    // 验证配置
    const validation = this.validateObsidianConfig(config);
    if (!validation.isValid) {
      this.showNotification(`错误：${validation.error}`, 'error');
      return;
    }

    console.log(`Exporting to Obsidian vault: "${config!.vaultName}"`);
    console.log(`Number of prompts: ${data.prompts.length}`);

    try {
      // 单个prompt：使用智能策略
      if (data.prompts.length === 1) {
        await this.exportSingleToObsidian(data.prompts[0], config!);
      } else {
        // 多个prompt：下载优化的Markdown文件
        this.exportMultipleToObsidian(data, config!);
      }
    } catch (error) {
      console.error('Obsidian export failed:', error);
      this.showNotification(`导出失败：${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  }

  // 智能内容分块处理
  private generateSmartContent(prompt: Prompt, maxLength: number): string {
    const content = `# ${prompt.title}\n\n`;
    
    // 优先级：标题 > 描述 > 内容第一段 > 元数据
    const parts = [
      { text: content, priority: 1 },
      { text: prompt.description ? `## 描述\n\n${prompt.description}\n\n` : '', priority: 2 },
      { text: `## 内容\n\n${prompt.content}\n\n`, priority: 3 },
      { text: `**分类**: ${prompt.category} | **版本**: ${prompt.version}`, priority: 4 }
    ];
    
    let result = '';
    const remainingLength = maxLength;
    
    // 按优先级添加内容
    for (const part of parts.sort((a, b) => a.priority - b.priority)) {
      if (part.text && (result.length + part.text.length) <= remainingLength) {
        result += part.text;
      } else if (part.priority === 3 && result.length < remainingLength) {
        // 内容太长时，智能截断
        const availableLength = remainingLength - result.length - 50; // 留余量
        if (availableLength > 100) {
          const truncatedContent = this.truncateAtSentence(prompt.content, availableLength);
          result += `## 内容\n\n${truncatedContent}\n\n`;
        }
      }
    }
    
    return result.trim();
  }

  // 在句子边界截断
  private truncateAtSentence(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    
    // 在句子结尾截断（中文和英文）
    const sentenceEnders = /[.！？。!?]/;
    const truncated = text.substring(0, maxLength);
    
    for (let i = truncated.length - 1; i >= maxLength * 0.7; i--) {
      if (sentenceEnders.test(truncated[i])) {
        return truncated.substring(0, i + 1) + '\n\n> [[内容已截断，请查看完整文件]]';
      }
    }
    
    // 如果找不到合适的截断点，在空格处截断
    for (let i = maxLength - 1; i >= maxLength * 0.8; i--) {
      if (truncated[i] === ' ' || truncated[i] === '\n') {
        return truncated.substring(0, i) + '\n\n> [[内容已截断，请查看完整文件]]';
      }
    }
    
    return truncated + '\n\n> [[内容已截断，请查看完整文件]]';
  }

  // 导出单个prompt到Obsidian（优化版）
  private async exportSingleToObsidian(prompt: Prompt, config: ObsidianConfig): Promise<void> {
    try {
      console.log('Generating Obsidian markdown for prompt:', prompt.title);
      const fileName = this.sanitizeFileName(prompt.title);
      
      // 智能选择策略
      const fullContent = this.generateObsidianMarkdown(prompt, config);
      const strategy = this.selectExportStrategy(fullContent, config.vaultName, fileName);
      
      console.log(`Selected strategy: ${strategy}`);
      console.log('Full content length:', fullContent.length);
      
      switch (strategy) {
        case 'full':
          await this.exportWithFullContent(prompt, config, fileName, fullContent);
          break;
          
        case 'minimal':
          await this.exportWithMinimalContent(prompt, config, fileName);
          break;
          
        case 'core':
          await this.exportWithCoreContent(prompt, config, fileName);
          break;
          
        case 'download':
        default:
          console.log('Content too large, falling back to file download');
          this.downloadObsidianFile(prompt, config);
          break;
      }
      
    } catch (error) {
      console.error('Failed to export to Obsidian:', error);
      this.showNotification(`导出到Obsidian失败：${error instanceof Error ? error.message : String(error)}`, 'error');
      this.downloadObsidianFile(prompt, config);
    }
  }

  // 完整内容导出
  private async exportWithFullContent(prompt: Prompt, config: ObsidianConfig, fileName: string, content: string): Promise<void> {
    const uri = `obsidian://new?vault=${encodeURIComponent(config.vaultName)}&name=${encodeURIComponent(fileName)}&content=${encodeURIComponent(content)}`;
    console.log('Using full content URI');
    await this.openObsidianWithUri(uri, prompt, config, false);
  }

  // 精简内容导出
  private async exportWithMinimalContent(prompt: Prompt, config: ObsidianConfig, fileName: string): Promise<void> {
    const content = this.generateObsidianMarkdownWithoutFrontMatter(prompt);
    const uri = `obsidian://new?vault=${encodeURIComponent(config.vaultName)}&name=${encodeURIComponent(fileName)}&content=${encodeURIComponent(content)}`;
    console.log('Using minimal content URI');
    await this.openObsidianWithUri(uri, prompt, config, false);
  }

  // 核心内容导出
  private async exportWithCoreContent(prompt: Prompt, config: ObsidianConfig, fileName: string): Promise<void> {
    const content = this.generateCoreObsidianContent(prompt);
    const uri = `obsidian://new?vault=${encodeURIComponent(config.vaultName)}&name=${encodeURIComponent(fileName)}&content=${encodeURIComponent(content)}`;
    console.log('Using core content URI with download backup');
    await this.openObsidianWithUri(uri, prompt, config, true); // 同时下载完整文件
  }

  // 改进的URI打开机制（带超时和重试）
  private async openObsidianWithUri(uri: string, prompt: Prompt, config: ObsidianConfig, alsoDownload: boolean): Promise<void> {
    console.log('Opening Obsidian with URI...');
    console.log('URI length:', uri.length);
    console.log('URI preview:', uri.substring(0, 200) + '...');

    try {
      // 检查URI长度是否合理
      if (uri.length > 32000) { // 大多数浏览器的实际限制
        console.warn('URI too long, falling back to download');
        this.showNotification('内容过长，无法通过URI打开，正在下载文件', 'info');
        this.downloadObsidianFile(prompt, config);
        return;
      }

      // 尝试打开Obsidian
      const opened = window.open(uri, '_blank');

      if (!opened) {
        console.warn('Failed to open URI, popup might be blocked');
        
        // 尝试通过location.href的方式
        try {
          window.location.href = uri;
          this.showNotification('✅ 正在尝试打开Obsidian...', 'info');
        } catch (locationError) {
          console.error('Location redirect also failed:', locationError);
          this.showNotification('无法打开Obsidian，可能被浏览器阻止，正在下载文件', 'info');
          this.downloadObsidianFile(prompt, config);
        }
        return;
      }

      // 显示成功消息
      if (alsoDownload) {
        this.showNotification('✅ 已在Obsidian中创建笔记，同时下载完整格式文件', 'success');
        // 延迟一点下载完整文件，避免与URI打开冲突
        setTimeout(() => {
          this.downloadObsidianFile(prompt, config, true);
        }, 1000);
      } else {
        this.showNotification('✅ 已在Obsidian中创建笔记，包含完整内容', 'success');
      }

    } catch (error) {
      console.error('Error opening Obsidian URI:', error);
      this.showNotification('URI打开失败，正在下载文件作为备用方案', 'info');
      this.downloadObsidianFile(prompt, config);
    }
  }

  // 导出多个prompt到Obsidian（下载文件方式）
  private exportMultipleToObsidian(data: ExportData, config: ObsidianConfig): void {
    const markdown = this.generateObsidianBatchMarkdown(data, config);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const fileName = `obsidian-prompts-export-${this.getDateString()}.md`;

    this.downloadFile(blob, fileName);

    // 显示使用说明
    this.showObsidianImportInstructions(config.vaultName);
  }

  // 下载单个Obsidian文件（URI太长时的回退方案）
  private downloadObsidianFile(prompt: Prompt, config: ObsidianConfig, isSupplementary: boolean = false): void {
    const content = this.generateObsidianMarkdown(prompt, config);
    const blob = new Blob([content], { type: 'text/markdown' });
    const fileName = `${this.sanitizeFileName(prompt.title)}.md`;

    this.downloadFile(blob, fileName);

    if (isSupplementary) {
      // 这是补充的完整文件
      console.log(`Downloaded supplementary file: ${fileName}`);
    } else {
      // 这是主要的下载方式
      this.showNotification(`ℹ️ 内容较长，已下载完整文件：${fileName}`, 'info');
    }
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

  // 生成无Front Matter的Obsidian内容
  private generateObsidianMarkdownWithoutFrontMatter(prompt: Prompt): string {
    let markdown = '';

    // 标题
    markdown += `# ${prompt.title}\n\n`;

    // 描述（如果有）
    if (prompt.description) {
      markdown += `## 描述\n\n${prompt.description}\n\n`;
    }

    // 内容
    markdown += `## 内容\n\n${prompt.content}\n\n`;

    // 标签（Obsidian格式）
    if (prompt.tags && prompt.tags.length > 0) {
      markdown += `## 标签\n\n`;
      markdown += prompt.tags.map((tag: string) => `#${tag.replace(/\s+/g, '_')}`).join(' ') + '\n\n';
    }

    // 元信息
    markdown += `## 元信息\n\n`;
    markdown += `- **分类**: ${prompt.category}\n`;
    markdown += `- **版本**: ${prompt.version}\n`;
    markdown += `- **创建时间**: ${this.formatDateLocal(prompt.createdAt)}\n`;

    return markdown;
  }

  // 生成核心Obsidian内容（只包含标题和主要内容）
  private generateCoreObsidianContent(prompt: Prompt): string {
    let content = '';

    // 标题
    content += `# ${prompt.title}\n\n`;

    // 主要内容
    content += `${prompt.content}\n\n`;

    // 基本信息
    content += `---\n`;
    content += `**分类**: ${prompt.category} | **版本**: ${prompt.version}`;
    if (prompt.tags && prompt.tags.length > 0) {
      content += ` | **标签**: ${prompt.tags.map((tag: string) => `#${tag.replace(/\s+/g, '_')}`).join(' ')}`;
    }

    return content;
  }

  // 生成Obsidian格式的Markdown（单个prompt）
  private generateObsidianMarkdown(prompt: Prompt, config: ObsidianConfig): string {
    console.log('Generating markdown for prompt:', {
      title: prompt.title,
      createdAt: prompt.createdAt,
      createdAtType: typeof prompt.createdAt,
      versions: prompt.versions?.length || 0
    });

    let markdown = '';

    // Front Matter（如果启用）
    if (config.includeFrontMatter) {
      markdown += '---\n';
      markdown += `title: ${prompt.title}\n`;
      markdown += `category: ${prompt.category}\n`;
      if (prompt.tags && prompt.tags.length > 0) {
        markdown += `tags: [${prompt.tags.join(', ')}]\n`;
      }
      markdown += `version: ${prompt.version}\n`;
      markdown += `created: ${this.formatDateShort(prompt.createdAt)}\n`;
      if (prompt.metadata?.usageCount) {
        markdown += `usage_count: ${prompt.metadata.usageCount}\n`;
      }
      markdown += '---\n\n';
    }

    // 标题
    markdown += `# ${prompt.title}\n\n`;

    // 描述（如果有）
    if (prompt.description) {
      markdown += `## 描述\n\n${prompt.description}\n\n`;
    }

    // 内容
    markdown += `## 内容\n\n${prompt.content}\n\n`;

    // 标签（Obsidian格式）
    if (prompt.tags && prompt.tags.length > 0) {
      markdown += `## 标签\n\n`;
      markdown += prompt.tags.map((tag: string) => `#${tag.replace(/\s+/g, '_')}`).join(' ') + '\n\n';
    }

    // 元信息
    markdown += `## 元信息\n\n`;
    markdown += `- **分类**: ${prompt.category}\n`;
    markdown += `- **版本**: ${prompt.version}\n`;
    markdown += `- **创建时间**: ${this.formatDateLocal(prompt.createdAt)}\n`;
    if (prompt.metadata?.usageCount) {
      markdown += `- **使用次数**: ${prompt.metadata.usageCount}次\n`;
    }
    markdown += '\n';

    // 版本历史（如果有）
    if (prompt.versions && prompt.versions.length > 1) {
      markdown += `## 版本历史\n\n`;
      prompt.versions.forEach((version: any) => {
        markdown += `- **${version.version}** (${this.formatDateLocal(version.createdAt)})`;
        if (version.changes) {
          markdown += `: ${version.changes}`;
        }
        markdown += '\n';
      });
      markdown += '\n';
    }

    return markdown;
  }

  // 生成批量导出的Obsidian Markdown
  private generateObsidianBatchMarkdown(data: ExportData, _config: ObsidianConfig): string {
    let markdown = `# Prompt Manager - Obsidian Export\n\n`;
    markdown += `**导出时间**: ${new Date().toLocaleString()}\n`;
    markdown += `**提示词数量**: ${data.prompts.length}\n`;
    markdown += `**Vault**: ${_config.vaultName}\n\n`;

    // 使用说明
    markdown += `## 使用说明\n\n`;
    markdown += `1. 将此文件保存到你的Obsidian vault中\n`;
    markdown += `2. 每个提示词都有独立的标题，可以通过双向链接引用\n`;
    markdown += `3. 使用标签进行分类和搜索\n\n`;

    // 目录
    markdown += `## 目录\n\n`;
    data.prompts.forEach((prompt, index) => {
      markdown += `${index + 1}. [[#${prompt.title}]]\n`;
    });
    markdown += '\n';

    // 分类信息
    if (data.categories.length > 0) {
      markdown += `## 分类\n\n`;
      data.categories.forEach(category => {
        markdown += `- **${category.name}**: ${category.id}\n`;
      });
      markdown += '\n';
    }

    // 提示词内容
    data.prompts.forEach((prompt, index) => {
      markdown += `## ${prompt.title}\n\n`;

      // 基本信息
      markdown += `**分类**: ${prompt.category} | **版本**: ${prompt.version}`;
      if (prompt.tags && prompt.tags.length > 0) {
        markdown += ` | **标签**: ${prompt.tags.map((tag: string) => `#${tag.replace(/\s+/g, '_')}`).join(' ')}`;
      }
      markdown += '\n\n';

      // 内容
      markdown += `${prompt.content}\n\n`;

      // 分隔线
      if (index < data.prompts.length - 1) {
        markdown += `---\n\n`;
      }
    });

    return markdown;
  }

  // 文件名安全化（改进版）
  private sanitizeFileName(title: string): string {
    if (!title || typeof title !== 'string') {
      return 'untitled';
    }
    
    return title
      .replace(/[<>:"/\\|?*]/g, '-')          // 替换非法字符
      .replace(/[\u0000-\u001f]/g, '-')        // 替换控制字符
      .replace(/\s+/g, ' ')                     // 合并空格
      .replace(/-+/g, '-')                      // 合并连续的破折号
      .replace(/^-+|-+$/g, '')                  // 去除开头和结尾的破折号
      .trim()                                   // 去除首尾空格
      .substring(0, 100)                        // 限制长度
      .replace(/\.$/, '')                       // 去除结尾的点号（Windows文件系统）
      || 'untitled';                            // 如果结果为空，使用默认名称
  }

  // 创建通知元素
  private createNotificationElement(message: string, type: 'success' | 'error' | 'info'): HTMLElement {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#2196f3'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 350px;
      word-wrap: break-word;
      animation: slideIn 0.3s ease-out;
    `;
    
    // 添加动画样式
    if (!document.querySelector('#notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = /* css */`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    const prefix = type === 'error' ? '❌ ' : type === 'success' ? '✅ ' : 'ℹ️ ';
    notification.textContent = `${prefix}${message}`;
    
    return notification;
  }

  // 显示通知消息
  private showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    try {
      // 创建通知元素
      const notification = this.createNotificationElement(message, type);
      document.body.appendChild(notification);
      
      // 自动移除通知
      setTimeout(() => {
        if (notification.parentNode) {
          notification.style.animation = 'slideOut 0.3s ease-in';
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 300);
        }
      }, type === 'error' ? 5000 : 3000); // 错误消息显示更长时间
      
    } catch (error) {
      // 如果通知系统失败，回退到console和alert
      console.error('Notification system failed:', error);
      const prefix = type === 'error' ? '❌ ' : type === 'success' ? '✅ ' : 'ℹ️ ';
      alert(`${prefix}${message}`);
    }
  }

  // 显示Obsidian导入说明
  private showObsidianImportInstructions(vaultName: string): void {
    const message = this.getCurrentLanguage() === 'en' 
      ? `File downloaded!\n\nSteps to import to Obsidian:\n1. Copy the downloaded .md file to your Obsidian vault "${vaultName}"\n2. Refresh the file list in Obsidian\n3. Start using your prompts!`
      : `文件已下载！\n\n导入到Obsidian的步骤：\n1. 将下载的.md文件复制到你的Obsidian vault "${vaultName}" 中\n2. 在Obsidian中刷新文件列表\n3. 开始使用你的提示词！`;
    
    this.showNotification(message, 'success');
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
      case 'csv': {
        // 生成CSV预览（前几行）
        const headers = ['ID', 'Title', 'Content', 'Description', 'Category', 'Tags', 'Version', 'Created At'];
        const previewRows = data.prompts.slice(0, 3).map(prompt => [
          prompt.id || '',
          (prompt.title || '').substring(0, 20) + '...',
          (prompt.content || '').substring(0, 30) + '...',
          (prompt.description || '').substring(0, 20) + '...',
          prompt.category || '',
          prompt.tags ? prompt.tags.slice(0, 2).join('; ') : '',
          prompt.version || '',
          this.formatDate(prompt.createdAt)
        ]);

        const csvPreview = [
          headers.join(','),
          ...previewRows.map(row => row.join(',')),
          data.prompts.length > 3 ? `... and ${data.prompts.length - 3} more rows` : ''
        ].filter(Boolean).join('\n');

        return `CSV Export Preview:\n\n${csvPreview}`;
      }
      case 'obsidian':
        return `Obsidian Export Preview:\n\n提示词数量: ${data.prompts.length}\n格式: Obsidian Markdown\n包含: Front Matter, 标签, 版本历史`;
      default:
        return 'Unknown format';
    }
  }
}

export const exportService = new ExportService();
