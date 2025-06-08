# 🚀 Prompt Manager

A powerful Chrome extension for managing and organizing AI prompts with advanced version control and quick access features.

## ✨ Features

### 📝 Core Features
- **Prompt Storage**: Store and organize your valuable AI prompts
- **Smart Categorization**: Pre-built categories (Writing, Coding, Analysis, Creative, Business, Academic)
- **Tag System**: Flexible tagging for better organization
- **Quick Search**: Real-time search across titles, content, and tags

### 🔄 Version Control
- **Automatic Versioning**: Smart version detection based on content changes
- **Version History**: Complete history of all prompt modifications
- **Version Comparison**: Side-by-side diff view with syntax highlighting
- **Version Rollback**: Restore any previous version with one click
- **Version Labels**: Add custom labels to important versions

### ⚡ Quick Access
- **Popup Interface**: Quick access to all prompts
- **Keyboard Shortcuts**: `Ctrl+Shift+P` to open prompt selector
- **Right-click Menu**: Insert prompts directly into text fields
- **One-click Copy**: Copy prompts to clipboard with usage tracking

### 📊 Advanced Features
- **Usage Statistics**: Track how often prompts are used
- **Data Export/Import**: Backup and restore your prompt library
- **Template Variables**: Support for dynamic placeholders (coming soon)
- **Dark/Light Theme**: Automatic theme switching

## 🛠️ Installation

### From Source
1. Clone this repository:

   ```bash
   git clone https://github.com/DylanDDeng/PromptManager.git
   cd PromptManager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked extension"
   - Select the `dist` folder

### From Chrome Web Store
*Coming soon...*

## 🎯 Usage

### Adding Prompts
1. Click the extension icon in the toolbar
2. Click the settings icon to open the options page
3. Click "Add Prompt" and fill in the details
4. Save to create your first prompt (v1.0.0)

### Version Control
- **Edit a prompt**: Automatically creates new versions based on change magnitude
- **View history**: Click the history icon on any prompt card
- **Compare versions**: Select two versions and click "Compare"
- **Add labels**: Click the label icon to tag important versions
- **Rollback**: Click the restore icon to revert to any version

### Quick Access
- **Keyboard shortcut**: Press `Ctrl+Shift+P` in any text field
- **Right-click menu**: Right-click in text fields and select "Insert Prompt"
- **Copy to clipboard**: Click the copy icon on any prompt

## 🏗️ Technical Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **UI Library**: Material-UI (MUI)
- **Build Tool**: Vite
- **Storage**: Chrome Storage API
- **State Management**: React Context

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components
│   └── prompt/         # Prompt-specific components
├── pages/              # Extension pages
│   ├── popup/          # Popup interface
│   ├── options/        # Options page
│   └── content/        # Content script
├── services/           # Business logic
├── contexts/           # React contexts
├── types/              # TypeScript definitions
└── constants/          # App constants
```

### Version Control Logic
- **Patch** (v1.0.0 → v1.0.1): Content changes < 10%
- **Minor** (v1.0.1 → v1.1.0): Title changes or content changes 10-50%
- **Major** (v1.1.0 → v2.0.0): Content changes > 50%

## 🧪 Development

### Prerequisites
- Node.js 16+
- Chrome 88+

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

### Testing
1. Load the extension in Chrome (see Installation)
2. Test basic CRUD operations
3. Test version control features
4. Test keyboard shortcuts and right-click menu
5. Test data persistence

## 📝 Version History

### v1.0.0 (Current)
- ✅ Core prompt management (CRUD)
- ✅ Automatic version control
- ✅ Version history and comparison
- ✅ Version rollback and labeling
- ✅ Quick access features
- ✅ Data export/import
- ✅ Search and categorization

### Roadmap
- 🔄 Template variable system
- 🔄 Cloud synchronization
- 🔄 Prompt sharing and marketplace
- 🔄 Advanced analytics
- 🔄 Multi-language support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [Material-UI](https://mui.com/)
- Inspired by the need for better AI prompt management
- Thanks to the open-source community for amazing tools and libraries

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on [GitHub](https://github.com/DylanDDeng/PromptManager/issues)

---

Made with ❤️ for the AI community
