// 翻译文本定义
export const translations = {
  zh: {
    // 通用
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    search: '搜索',
    loading: '加载中...',
    close: '关闭',
    confirm: '确认',
    
    // 应用标题
    appTitle: 'Prompt Manager',
    
    // 主界面
    searchPlaceholder: '搜索提示词...',
    noPromptsFound: '没有找到匹配的提示词',
    noPromptsYet: '还没有提示词，点击下方按钮添加',
    
    // 提示词管理
    promptManagement: '提示词管理',
    addPrompt: '添加提示词',
    editPrompt: '编辑提示词',
    promptTitle: '标题',
    promptContent: '内容',
    promptDescription: '描述',
    promptCategory: '分类',
    promptTags: '标签',
    tagsPlaceholder: '输入标签并按回车',
    
    // 分类
    categories: {
      writing: '写作',
      coding: '编程',
      analysis: '分析',
      creative: '创意',
      business: '商务',
      academic: '学术',
    },
    
    // 版本控制
    versionHistory: '版本历史',
    currentVersion: '当前',
    compareVersions: '对比版本',
    restoreVersion: '恢复到此版本',
    addLabel: '添加标签',
    versionLabel: '版本标签',
    labelName: '标签名称',
    labelPlaceholder: '例如：重要版本、稳定版本、测试版本',
    
    // 设置
    settings: '设置',
    appearance: '外观设置',
    theme: '主题',
    language: '语言',
    themeLight: '浅色',
    themeDark: '深色',
    themeAuto: '跟随系统',
    languageZh: '中文',
    languageEn: 'English',
    
    // 编辑器设置
    editorSettings: '编辑器设置',
    showLineNumbers: '显示行号',
    wordWrap: '自动换行',
    fontSize: '字体大小',
    
    // 功能设置
    functionalSettings: '功能设置',
    defaultCategory: '默认分类',
    autoBackup: '自动备份',
    
    // 数据管理
    dataManagement: '数据管理',
    exportData: '导出数据',
    importData: '导入数据',
    dataStats: '当前数据统计：{count} 个提示词，{categories} 个分类',

    // 导出功能
    exportFormat: '导出格式',
    selectPrompts: '选择要导出的提示词',
    selectAll: '全选',
    unselectAll: '取消全选',
    includeHistory: '包含完整版本历史',
    selectVersion: '选择特定版本',
    contentPreview: '内容预览',
    exportSelected: '导出 ({count})',
    
    // 消息
    promptSaved: '提示词保存成功',
    promptDeleted: '提示词删除成功',
    promptCopied: '提示词已复制到剪贴板',
    settingsSaved: '设置保存成功！',
    saveFailed: '保存失败，请重试',
    dataExported: '数据导出成功',
    dataImported: '数据导入成功！',
    importFailed: '导入失败，请检查文件格式',
    
    // 确认对话框
    deleteConfirm: '确定要删除这个提示词吗？',
    restoreConfirm: '确定要恢复到版本 {version} 吗？这将创建一个新版本。',
    resetConfirm: '确定要重置所有设置吗？',
    
    // 版本变更说明
    initialVersion: '初始版本',
    majorUpdate: '重大更新：内容结构发生显著变化',
    minorUpdate: '功能更新：添加新内容或修改标题',
    patchUpdate: '小幅修正：修复错误或微调内容',
    restoredTo: '恢复到版本 {version}',
    
    // 统计信息
    usageCount: '使用 {count} 次',
    version: '版本',
    createdAt: '创建时间',
    updatedAt: '更新时间',
  },
  
  en: {
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    loading: 'Loading...',
    close: 'Close',
    confirm: 'Confirm',
    
    // App title
    appTitle: 'Prompt Manager',
    
    // Main interface
    searchPlaceholder: 'Search prompts...',
    noPromptsFound: 'No matching prompts found',
    noPromptsYet: 'No prompts yet, click the button below to add',
    
    // Prompt management
    promptManagement: 'Prompt Management',
    addPrompt: 'Add Prompt',
    editPrompt: 'Edit Prompt',
    promptTitle: 'Title',
    promptContent: 'Content',
    promptDescription: 'Description',
    promptCategory: 'Category',
    promptTags: 'Tags',
    tagsPlaceholder: 'Enter tags and press Enter',
    
    // Categories
    categories: {
      writing: 'Writing',
      coding: 'Coding',
      analysis: 'Analysis',
      creative: 'Creative',
      business: 'Business',
      academic: 'Academic',
    },
    
    // Version control
    versionHistory: 'Version History',
    currentVersion: 'Current',
    compareVersions: 'Compare Versions',
    restoreVersion: 'Restore to this version',
    addLabel: 'Add Label',
    versionLabel: 'Version Label',
    labelName: 'Label Name',
    labelPlaceholder: 'e.g.: Important version, Stable version, Test version',
    
    // Settings
    settings: 'Settings',
    appearance: 'Appearance',
    theme: 'Theme',
    language: 'Language',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeAuto: 'Follow System',
    languageZh: '中文',
    languageEn: 'English',
    
    // Editor settings
    editorSettings: 'Editor Settings',
    showLineNumbers: 'Show Line Numbers',
    wordWrap: 'Word Wrap',
    fontSize: 'Font Size',
    
    // Functional settings
    functionalSettings: 'Functional Settings',
    defaultCategory: 'Default Category',
    autoBackup: 'Auto Backup',
    
    // Data management
    dataManagement: 'Data Management',
    exportData: 'Export Data',
    importData: 'Import Data',
    dataStats: 'Current data: {count} prompts, {categories} categories',

    // Export features
    exportFormat: 'Export Format',
    selectPrompts: 'Select prompts to export',
    selectAll: 'Select All',
    unselectAll: 'Unselect All',
    includeHistory: 'Include complete version history',
    selectVersion: 'Select specific version',
    contentPreview: 'Content Preview',
    exportSelected: 'Export ({count})',
    
    // Messages
    promptSaved: 'Prompt saved successfully',
    promptDeleted: 'Prompt deleted successfully',
    promptCopied: 'Prompt copied to clipboard',
    settingsSaved: 'Settings saved successfully!',
    saveFailed: 'Save failed, please try again',
    dataExported: 'Data exported successfully',
    dataImported: 'Data imported successfully!',
    importFailed: 'Import failed, please check file format',
    
    // Confirmation dialogs
    deleteConfirm: 'Are you sure you want to delete this prompt?',
    restoreConfirm: 'Are you sure you want to restore to version {version}? This will create a new version.',
    resetConfirm: 'Are you sure you want to reset all settings?',
    
    // Version change descriptions
    initialVersion: 'Initial version',
    majorUpdate: 'Major update: Significant structural changes',
    minorUpdate: 'Minor update: Added new content or modified title',
    patchUpdate: 'Patch update: Fixed errors or minor adjustments',
    restoredTo: 'Restored to version {version}',
    
    // Statistics
    usageCount: 'Used {count} times',
    version: 'Version',
    createdAt: 'Created',
    updatedAt: 'Updated',
  },
};
