# VS Code Setup for GroupTracker

## 🚀 Quick Start

1. **Open VS Code** with the project:
   ```bash
   code .
   ```

2. **Open the workspace file**:
   - Double-click `tagyou.code-workspace` in VS Code
   - Or go to `File > Open Workspace from File...`

## 🛠️ Development Workflow

### Starting the Development Server
1. **Using VS Code Tasks** (Recommended):
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type "Tasks: Run Task"
   - Select "Start Development Server"

2. **Using Terminal**:
   ```bash
   python3 -m http.server 8000
   ```

### Opening the Application
1. **Using VS Code Tasks**:
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type "Tasks: Run Task"
   - Select "Open in Browser"

2. **Manual**:
   - Open `http://localhost:8000/grouptracker.html` in your browser

### Debugging
1. **Using VS Code Debugger**:
   - Press `F5` or go to `Run > Start Debugging`
   - Select "Launch Chrome" configuration
   - Set breakpoints in your JavaScript code

## 📁 Project Structure

```
tagyou/
├── grouptracker.html          # Main application file
├── tagyou.code-workspace      # VS Code workspace config
├── VSCODE_SETUP.md           # This file
├── IMPROVEMENTS.md           # Feature documentation
├── README.md                 # Project documentation
├── package.json              # Dependencies
└── [other project files]
```

## 🔧 VS Code Features Enabled

### Auto-Formatting
- **Format on Save**: Automatically formats code when you save
- **Tab Size**: 2 spaces for consistent indentation
- **Auto-closing tags**: HTML tags close automatically

### Extensions Recommended
- **Live Server**: For real-time development
- **Prettier**: Code formatting
- **JavaScript Debugger**: For debugging
- **Tailwind CSS**: If using Tailwind (optional)

### Keyboard Shortcuts
- `Cmd+S` (Mac) / `Ctrl+S` (Windows/Linux): Save file
- `F5`: Start debugging
- `Cmd+Shift+P` / `Ctrl+Shift+P`: Command palette
- `Cmd+Shift+E` / `Ctrl+Shift+E`: Explorer
- `Cmd+Shift+F` / `Ctrl+Shift+F`: Search

## 🎯 Development Tips

### 1. **Live Editing**
- The server automatically serves your files
- Refresh your browser to see changes
- Use browser dev tools for debugging

### 2. **File Organization**
- Main application: `grouptracker.html`
- Documentation: `README.md`, `IMPROVEMENTS.md`
- Configuration: `package.json`, `tagyou.code-workspace`

### 3. **Testing Features**
- **Map Functionality**: Test stall markers and navigation
- **Group Features**: Test location sharing and emergency alerts
- **Profile System**: Test user management and settings
- **Mobile Responsive**: Test on different screen sizes

### 4. **Debugging**
- Use browser console for JavaScript debugging
- Set breakpoints in VS Code debugger
- Check network tab for API calls (if any)

## 🚀 Deployment

### Local Development
```bash
# Start server
python3 -m http.server 8000

# Open in browser
open http://localhost:8000/grouptracker.html
```

### Production Deployment
- Upload all files to any web hosting service
- No build process required (static HTML)
- Works on GitHub Pages, Netlify, Vercel, etc.

## 🎉 Ready to Code!

Your GroupTracker project is now fully set up in VS Code with:
- ✅ Optimized workspace configuration
- ✅ Development server integration
- ✅ Debugging capabilities
- ✅ Auto-formatting and linting
- ✅ Recommended extensions

**Happy coding!** 🎪🗺️✨
