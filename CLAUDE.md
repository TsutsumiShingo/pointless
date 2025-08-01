# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (React)
- `yarn install` - Install dependencies
- `yarn start` - Start React development server (sets BROWSER=none)
- `yarn build` - Build React app for production
- `yarn test` - Run React tests
- `yarn lint` - Run ESLint with auto-fix
- `yarn format` - Format code with Prettier

### Desktop App (Tauri)
- `yarn run tauri dev` - Start Tauri development server (main development command)
- `yarn run tauri build` - Build production Tauri app for current platform

### Code Quality
- Pre-commit hooks automatically run ESLint and Prettier via husky/lint-staged
- ESLint config extends react-app and prettier with custom rules for comma-dangle and max-len

## Architecture Overview

### Technology Stack
**Frontend**: React 18 with Redux Toolkit for state management
**Backend**: Tauri (Rust) for desktop integration and file operations
**Canvas**: Pure SVG-based drawing engine (no Canvas or WebGL)
**Storage**: Local files with Brotli compression (.br extension)

### Core Application Structure

**Hybrid Architecture**: React frontend communicates with Rust backend via Tauri's IPC bridge
- React handles UI rendering and user interactions
- Rust handles file I/O, compression, and system integration
- All data persists locally with no network communication

**State Management**: Redux Toolkit with four main slices:
- `library` - Folders and papers management
- `paper` - Current drawing state and shapes
- `settings` - User preferences and app configuration  
- `router` - Navigation between library and drawing views

**Drawing Engine**: SVG-based with D3-shape for path generation
- Shapes stored as SVG elements with coordinates and styling
- Supports freehand drawing, rectangles, ellipses, arrows, selection
- Real-time auto-save during drawing operations

### Key Data Models

**Paper Structure**:
```javascript
{
  id: uuid,
  name: string,
  folderId: uuid,
  shapes: Shape[],
  createdAt: ISO string,
  updatedAt: ISO string
}
```

**Shape Structure**:
```javascript  
{
  id: uuid,
  type: 'freehand'|'rectangle'|'ellipse'|'arrow',
  points: [{x, y}],
  color: string,
  lineWidth: number
}
```

### File System Integration

**Storage Location**: Uses Tauri's app data directory
**File Format**: Brotli-compressed JSON (.br extension)
**File Structure**:
- `library.br` - Contains folders and papers metadata
- `{paperId}.br` - Individual paper data with shapes
- `settings.br` - User preferences

### Component Architecture

**Main Components**:
- `Paper/` - Drawing canvas and toolbar (Class component with complex state)
- `Library/` - File/folder management interface
- `Modal/` - Settings and help dialogs

**Drawing Components**:
- `Toolbar/` - Drawing tools and actions
- `Palette/` - Color picker with React Color integration
- `ExportButton/` - PNG/JPEG/SVG export functionality

### State Persistence

**Auto-save Strategy**: Middleware automatically saves state on specific actions
- Library changes (folder/paper CRUD) trigger `saveLibrary()`
- Settings changes trigger `saveSettings()`
- Paper shapes auto-save during drawing via `setPaperShapes()`

**Redux Middleware**: Custom middleware intercepts actions by reducer name and action type to trigger appropriate save operations

### Development Notes

**CSS Modules**: All components use CSS Modules for styling isolation
**SVG Icons**: Icon assets stored in `src/assets/icons/` as SVG files
**React Version**: Uses Class components for main Paper component, Function components elsewhere
**TypeScript**: Not used - pure JavaScript codebase with PropTypes for validation

### Tauri Integration

**Commands**: Rust commands exposed to frontend via `#[tauri::command]`
**File Operations**: All file I/O handled by Rust backend for security
**Native Menus**: Uses Tauri's native menu system
**Cross-platform**: Builds for Windows, macOS, and Linux

### External Dependencies

**Key Libraries**:
- `@reduxjs/toolkit` - State management
- `react-color` - Color picker component
- `d3-shape` & `d3-ease` - SVG path generation and animations
- `brotli-unicode` - File compression
- `dayjs` - Date formatting
- `uuid` - Unique ID generation

The codebase emphasizes local-first operation with no network dependencies and focuses on performance for real-time drawing operations.