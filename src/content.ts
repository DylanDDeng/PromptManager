// 内联消息类型常量，避免模块导入问题
const MESSAGE_TYPES = {
  GET_PROMPTS: 'GET_PROMPTS',
  SAVE_PROMPT: 'SAVE_PROMPT',
  DELETE_PROMPT: 'DELETE_PROMPT',
  INSERT_TEXT: 'INSERT_TEXT',
  GET_PAGE_INFO: 'GET_PAGE_INFO',
  SHOW_PROMPT_SELECTOR: 'SHOW_PROMPT_SELECTOR',
  COPY_TO_CLIPBOARD: 'COPY_TO_CLIPBOARD',
} as const;

class ContentScript {
  private floatingUI: HTMLElement | null = null;
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.isInitialized) return;
    
    // 监听来自background的消息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
    });

    // 监听键盘快捷键
    document.addEventListener('keydown', this.handleKeydown.bind(this));

    this.isInitialized = true;
    console.log('Prompt Manager content script initialized');
  }

  // 处理消息
  private handleMessage(message: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
    switch (message.action) {
      case MESSAGE_TYPES.SHOW_PROMPT_SELECTOR:
        this.showPromptSelector(message.data);
        sendResponse({ success: true });
        break;

      case MESSAGE_TYPES.INSERT_TEXT:
        this.insertText(message.data.text);
        sendResponse({ success: true });
        break;

      case 'COPY_TEXT':
        this.copyToClipboard(message.data.text);
        sendResponse({ success: true });
        break;

      case 'SAVE_SELECTION':
        this.showSaveSelectionDialog(message.data.text);
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  }

  // 处理键盘快捷键
  private handleKeydown(event: KeyboardEvent) {
    // Ctrl+Shift+P (或 Cmd+Shift+P on Mac)
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'P') {
      event.preventDefault();
      this.showPromptSelector({});
    }
  }

  // 显示提示词选择器
  private async showPromptSelector(data: { x?: number; y?: number }) {
    try {
      // 获取所有提示词
      const response = await chrome.runtime.sendMessage({
        action: MESSAGE_TYPES.GET_PROMPTS,
      });

      if (!response.success) {
        console.error('Failed to get prompts:', response.error);
        return;
      }

      const prompts = response.data;
      this.createFloatingSelector(prompts, data.x, data.y);
    } catch (error) {
      console.error('Failed to show prompt selector:', error);
    }
  }

  // 创建浮动选择器
  private createFloatingSelector(prompts: any[], x?: number, y?: number) {
    // 移除现有的选择器
    this.removeFloatingUI();

    // 创建容器
    const container = document.createElement('div');
    container.id = 'prompt-manager-selector';
    container.style.cssText = `
      position: fixed;
      top: ${y || 100}px;
      left: ${x || 100}px;
      width: 400px;
      max-height: 500px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: hidden;
    `;

    // 创建头部
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 12px 16px;
      background: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.innerHTML = `
      <span style="font-weight: 500; font-size: 14px;">选择提示词</span>
      <button id="close-selector" style="
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">×</button>
    `;

    // 创建搜索框
    const searchContainer = document.createElement('div');
    searchContainer.style.cssText = `
      padding: 12px 16px;
      border-bottom: 1px solid #e0e0e0;
    `;
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = '搜索提示词...';
    searchInput.style.cssText = `
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    `;
    searchContainer.appendChild(searchInput);

    // 创建列表容器
    const listContainer = document.createElement('div');
    listContainer.style.cssText = `
      max-height: 300px;
      overflow-y: auto;
    `;

    // 渲染提示词列表
    const renderPrompts = (filteredPrompts: any[]) => {
      listContainer.innerHTML = '';
      
      if (filteredPrompts.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.style.cssText = `
          padding: 24px;
          text-align: center;
          color: #666;
          font-size: 14px;
        `;
        emptyState.textContent = '没有找到匹配的提示词';
        listContainer.appendChild(emptyState);
        return;
      }

      filteredPrompts.forEach((prompt) => {
        const item = document.createElement('div');
        item.style.cssText = `
          padding: 12px 16px;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: background-color 0.2s;
        `;
        item.addEventListener('mouseenter', () => {
          item.style.backgroundColor = '#f5f5f5';
        });
        item.addEventListener('mouseleave', () => {
          item.style.backgroundColor = 'transparent';
        });

        item.innerHTML = `
          <div style="font-weight: 500; font-size: 14px; margin-bottom: 4px;">
            ${this.escapeHtml(prompt.title)}
          </div>
          <div style="font-size: 12px; color: #666; line-height: 1.4; max-height: 40px; overflow: hidden;">
            ${this.escapeHtml(prompt.content.substring(0, 100))}${prompt.content.length > 100 ? '...' : ''}
          </div>
          <div style="margin-top: 8px;">
            ${prompt.tags.slice(0, 3).map((tag: string) => 
              `<span style="
                display: inline-block;
                background: #e3f2fd;
                color: #1976d2;
                padding: 2px 6px;
                border-radius: 12px;
                font-size: 11px;
                margin-right: 4px;
              ">${this.escapeHtml(tag)}</span>`
            ).join('')}
          </div>
        `;

        item.addEventListener('click', () => {
          this.insertText(prompt.content);
          this.removeFloatingUI();
          
          // 更新使用统计
          chrome.runtime.sendMessage({
            action: MESSAGE_TYPES.SAVE_PROMPT,
            data: {
              ...prompt,
              metadata: {
                ...prompt.metadata,
                usageCount: prompt.metadata.usageCount + 1,
                lastUsedAt: new Date(),
              },
            },
          });
        });

        listContainer.appendChild(item);
      });
    };

    // 初始渲染
    renderPrompts(prompts);

    // 搜索功能
    searchInput.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value.toLowerCase();
      const filtered = prompts.filter(prompt => 
        prompt.title.toLowerCase().includes(query) ||
        prompt.content.toLowerCase().includes(query) ||
        prompt.tags.some((tag: string) => tag.toLowerCase().includes(query))
      );
      renderPrompts(filtered);
    });

    // 组装UI
    container.appendChild(header);
    container.appendChild(searchContainer);
    container.appendChild(listContainer);

    // 添加到页面
    document.body.appendChild(container);
    this.floatingUI = container;

    // 绑定关闭事件
    const closeBtn = container.querySelector('#close-selector');
    closeBtn?.addEventListener('click', () => {
      this.removeFloatingUI();
    });

    // 点击外部关闭
    const handleClickOutside = (e: MouseEvent) => {
      if (!container.contains(e.target as Node)) {
        this.removeFloatingUI();
        document.removeEventListener('click', handleClickOutside);
      }
    };
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);

    // ESC键关闭
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.removeFloatingUI();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    // 聚焦搜索框
    searchInput.focus();
  }

  // 移除浮动UI
  private removeFloatingUI() {
    if (this.floatingUI) {
      this.floatingUI.remove();
      this.floatingUI = null;
    }
  }

  // 插入文本到当前焦点元素
  private insertText(text: string) {
    const activeElement = document.activeElement as HTMLElement;
    
    if (!activeElement) return;

    if (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT') {
      const input = activeElement as HTMLInputElement | HTMLTextAreaElement;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const value = input.value;
      
      input.value = value.slice(0, start) + text + value.slice(end);
      input.setSelectionRange(start + text.length, start + text.length);
      input.focus();
      
      // 触发input事件
      input.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (activeElement.contentEditable === 'true') {
      // 处理contentEditable元素
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }

  // 复制到剪贴板
  private async copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast('已复制到剪贴板');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }

  // 显示保存选中文本对话框
  private showSaveSelectionDialog(text: string) {
    // 这里可以实现一个简单的对话框来保存选中的文本
    const title = prompt('请输入提示词标题：');
    if (title) {
      chrome.runtime.sendMessage({
        action: MESSAGE_TYPES.SAVE_PROMPT,
        data: {
          title,
          content: text,
          category: 'writing', // 默认分类
          tags: [],
          variables: [],
          version: 'v1.0.0',
          versions: [{
            version: 'v1.0.0',
            content: text,
            title,
            createdAt: new Date(),
            changes: '初始版本',
          }],
          metadata: {
            usageCount: 0,
            isFavorite: false,
            isTemplate: false,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      this.showToast('提示词保存成功');
    }
  }

  // 显示提示消息
  private showToast(message: string) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #333;
      color: white;
      padding: 12px 16px;
      border-radius: 4px;
      z-index: 10001;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // HTML转义
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// 初始化content script
new ContentScript();

export {};
