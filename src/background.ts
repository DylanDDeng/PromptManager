import { storageService } from './services/storageService';
import { MESSAGE_TYPES } from './constants';

// 扩展安装时初始化
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Prompt Manager installed');
  
  try {
    // 初始化存储
    await storageService.initializeStorage();
    
    // 创建右键菜单
    chrome.contextMenus.create({
      id: 'insert-prompt',
      title: '插入提示词',
      contexts: ['editable'],
    });

    chrome.contextMenus.create({
      id: 'save-selection',
      title: '保存选中文本为提示词',
      contexts: ['selection'],
    });
  } catch (error) {
    console.error('Failed to initialize extension:', error);
  }
});

// 右键菜单点击事件
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;

  try {
    switch (info.menuItemId) {
      case 'insert-prompt':
        // 显示提示词选择器
        await chrome.tabs.sendMessage(tab.id, {
          action: MESSAGE_TYPES.SHOW_PROMPT_SELECTOR,
          data: {},
        });
        break;

      case 'save-selection':
        // 保存选中文本
        if (info.selectionText) {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'SAVE_SELECTION',
            data: { text: info.selectionText },
          });
        }
        break;
    }
  } catch (error) {
    console.error('Context menu action failed:', error);
  }
});

// 快捷键命令
chrome.commands.onCommand.addListener(async (command) => {
  try {
    switch (command) {
      case 'open-prompt-manager':
        // 打开弹窗
        await chrome.action.openPopup();
        break;

      case 'quick-insert':
        // 快速插入
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
          await chrome.tabs.sendMessage(tab.id, {
            action: MESSAGE_TYPES.SHOW_PROMPT_SELECTOR,
            data: {},
          });
        }
        break;
    }
  } catch (error) {
    console.error('Command execution failed:', error);
  }
});

// 消息处理
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // 保持消息通道开放
});

// 处理消息
async function handleMessage(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
  try {
    switch (message.action) {
      case MESSAGE_TYPES.GET_PROMPTS:
        const prompts = await storageService.getAllPrompts();
        sendResponse({ success: true, data: prompts });
        break;

      case MESSAGE_TYPES.SAVE_PROMPT:
        await storageService.savePrompt(message.data);
        sendResponse({ success: true });
        break;

      case MESSAGE_TYPES.DELETE_PROMPT:
        await storageService.deletePrompt(message.data.id);
        sendResponse({ success: true });
        break;

      case MESSAGE_TYPES.GET_PAGE_INFO:
        if (sender.tab) {
          sendResponse({
            success: true,
            data: {
              url: sender.tab.url,
              title: sender.tab.title,
            },
          });
        }
        break;

      case MESSAGE_TYPES.COPY_TO_CLIPBOARD:
        // 在background script中无法直接访问剪贴板
        // 需要通过content script来实现
        if (sender.tab?.id) {
          await chrome.tabs.sendMessage(sender.tab.id, {
            action: 'COPY_TEXT',
            data: message.data,
          });
        }
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Message handling failed:', error);
    sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

// 标签页更新事件
chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  // 当页面加载完成时，可以注入content script
  if (changeInfo.status === 'complete' && tab.url) {
    // 这里可以添加一些页面特定的逻辑
  }
});

// 扩展启动时的初始化
chrome.runtime.onStartup.addListener(async () => {
  try {
    await storageService.initializeStorage();
  } catch (error) {
    console.error('Failed to initialize on startup:', error);
  }
});

// 处理扩展图标点击
chrome.action.onClicked.addListener(async (_tab) => {
  // 如果没有设置popup，这里会被调用
  // 我们已经设置了popup，所以这个事件不会触发
});

// 监听存储变化
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    // 可以在这里处理存储变化事件
    console.log('Storage changed:', changes);
  }
});

// 错误处理
self.addEventListener('error', (event) => {
  console.error('Background script error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

export {};
