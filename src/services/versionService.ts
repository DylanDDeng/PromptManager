import { Prompt, PromptVersion, ChangeType } from '../types';
import { VERSION_PATTERN } from '../constants';

class VersionService {
  // 生成新版本号
  generateVersion(currentVersion: string, changeType: ChangeType): string {
    const match = currentVersion.match(VERSION_PATTERN);
    
    if (!match) {
      // 如果当前版本格式不正确，返回默认版本
      return 'v1.0.0';
    }

    let [, major, minor, patch] = match.map(Number);

    switch (changeType) {
      case 'major':
        major += 1;
        minor = 0;
        patch = 0;
        break;
      case 'minor':
        minor += 1;
        patch = 0;
        break;
      case 'patch':
        patch += 1;
        break;
    }

    return `v${major}.${minor}.${patch}`;
  }

  // 比较版本号
  compareVersions(version1: string, version2: string): number {
    const v1Match = version1.match(VERSION_PATTERN);
    const v2Match = version2.match(VERSION_PATTERN);

    if (!v1Match || !v2Match) {
      return 0;
    }

    const [, major1, minor1, patch1] = v1Match.map(Number);
    const [, major2, minor2, patch2] = v2Match.map(Number);

    if (major1 !== major2) return major1 - major2;
    if (minor1 !== minor2) return minor1 - minor2;
    return patch1 - patch2;
  }

  // 检测变更类型
  detectChangeType(oldContent: string, newContent: string, oldTitle: string, newTitle: string): ChangeType {
    // 如果标题改变，认为是minor变更
    if (oldTitle !== newTitle) {
      return 'minor';
    }

    // 计算内容变更程度
    const changeRatio = this.calculateChangeRatio(oldContent, newContent);

    if (changeRatio > 0.5) {
      return 'major'; // 超过50%的变更认为是major
    } else if (changeRatio > 0.1) {
      return 'minor'; // 超过10%的变更认为是minor
    } else {
      return 'patch'; // 小幅变更认为是patch
    }
  }

  // 计算变更比例
  private calculateChangeRatio(oldText: string, newText: string): number {
    if (oldText === newText) return 0;
    if (!oldText || !newText) return 1;

    const oldWords = oldText.split(/\s+/);
    const newWords = newText.split(/\s+/);
    const maxLength = Math.max(oldWords.length, newWords.length);

    if (maxLength === 0) return 0;

    // 简单的差异计算
    const commonWords = this.findCommonWords(oldWords, newWords);
    return 1 - (commonWords / maxLength);
  }

  // 找到共同词汇
  private findCommonWords(words1: string[], words2: string[]): number {
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    let common = 0;

    for (const word of set1) {
      if (set2.has(word)) {
        common++;
      }
    }

    return common;
  }

  // 创建新版本
  createVersion(prompt: Prompt, changes?: string): PromptVersion {
    const changeType = prompt.versions.length > 0 
      ? this.detectChangeType(
          prompt.versions[prompt.versions.length - 1].content,
          prompt.content,
          prompt.versions[prompt.versions.length - 1].title,
          prompt.title
        )
      : 'major';

    const newVersion = prompt.versions.length > 0
      ? this.generateVersion(prompt.version, changeType)
      : 'v1.0.0';

    return {
      version: newVersion,
      content: prompt.content,
      title: prompt.title,
      description: prompt.description,
      createdAt: new Date(),
      changes: changes || this.generateChangeDescription(changeType),
    };
  }

  // 生成变更描述
  private generateChangeDescription(changeType: ChangeType): string {
    switch (changeType) {
      case 'major':
        return '重大更新：内容结构发生显著变化';
      case 'minor':
        return '功能更新：添加新内容或修改标题';
      case 'patch':
        return '小幅修正：修复错误或微调内容';
      default:
        return '内容更新';
    }
  }

  // 应用版本到提示词
  applyVersion(prompt: Prompt, version: string): Prompt {
    const targetVersion = prompt.versions.find(v => v.version === version);
    
    if (!targetVersion) {
      throw new Error(`Version ${version} not found`);
    }

    return {
      ...prompt,
      title: targetVersion.title,
      content: targetVersion.content,
      description: targetVersion.description,
      version: targetVersion.version,
      updatedAt: new Date(),
    };
  }

  // 获取版本历史
  getVersionHistory(prompt: Prompt): PromptVersion[] {
    return prompt.versions.sort((a, b) => 
      this.compareVersions(b.version, a.version)
    );
  }

  // 获取最新版本
  getLatestVersion(prompt: Prompt): PromptVersion | null {
    if (prompt.versions.length === 0) return null;
    
    return prompt.versions.reduce((latest, current) => 
      this.compareVersions(current.version, latest.version) > 0 ? current : latest
    );
  }

  // 检查是否有新版本
  hasNewerVersion(prompt: Prompt, version: string): boolean {
    const latestVersion = this.getLatestVersion(prompt);
    if (!latestVersion) return false;
    
    return this.compareVersions(latestVersion.version, version) > 0;
  }

  // 计算版本差异
  calculateDiff(oldContent: string, newContent: string): Array<{
    type: 'added' | 'removed' | 'unchanged';
    content: string;
  }> {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    const diff: Array<{ type: 'added' | 'removed' | 'unchanged'; content: string }> = [];

    let oldIndex = 0;
    let newIndex = 0;

    while (oldIndex < oldLines.length || newIndex < newLines.length) {
      if (oldIndex >= oldLines.length) {
        // 只剩新行
        diff.push({ type: 'added', content: newLines[newIndex] });
        newIndex++;
      } else if (newIndex >= newLines.length) {
        // 只剩旧行
        diff.push({ type: 'removed', content: oldLines[oldIndex] });
        oldIndex++;
      } else if (oldLines[oldIndex] === newLines[newIndex]) {
        // 相同行
        diff.push({ type: 'unchanged', content: oldLines[oldIndex] });
        oldIndex++;
        newIndex++;
      } else {
        // 不同行，简单处理：标记为删除旧行，添加新行
        diff.push({ type: 'removed', content: oldLines[oldIndex] });
        diff.push({ type: 'added', content: newLines[newIndex] });
        oldIndex++;
        newIndex++;
      }
    }

    return diff;
  }

  // 验证版本号格式
  isValidVersion(version: string): boolean {
    return VERSION_PATTERN.test(version);
  }

  // 获取下一个建议版本
  getSuggestedNextVersion(currentVersion: string): {
    major: string;
    minor: string;
    patch: string;
  } {
    return {
      major: this.generateVersion(currentVersion, 'major'),
      minor: this.generateVersion(currentVersion, 'minor'),
      patch: this.generateVersion(currentVersion, 'patch'),
    };
  }
}

export const versionService = new VersionService();
