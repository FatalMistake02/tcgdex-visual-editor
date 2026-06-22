# TCG Card Database Visual Editor

A web-based visual editor for the TCG card database. This tool allows you to browse and edit card series, sets, and individual cards through a modern GUI interface.

## Features

- **Directory Selection**: Select your `cards-database/data` directory to load all card data
- **Browse Series**: View all card series with search functionality
- **Browse Sets**: Navigate through sets within each series
- **Browse Cards**: View all cards within a set with search
- **Edit Cards**: Full card editor supporting:
  - Basic information (name, category, rarity, illustrator)
  - Multi-language support for names and descriptions
  - Pokemon-specific fields (HP, types, stage, attacks, weaknesses)
  - New variant format with third-party IDs (TCGPlayer, Cardmarket, Cardtrader)
- **Edit Sets**: Edit set information including names, release dates, abbreviations, and third-party IDs
- **Edit Series**: Edit series information including names and energy types
- **Save Changes**: Save edits directly back to the TypeScript files

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool and dev server
- **File System Access API** - Browser-based file system access

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A modern browser that supports the File System Access API (Chrome, Edge, or Opera)

### Installation

```bash
npm install
```

### Running the Application

```bash
npm run dev
```

The application will start on `http://localhost:3000`

### Usage

1. Open the application in your browser
2. Click "Select Data Directory" and choose your `cards-database/data` folder
3. Browse through series → sets → cards
4. Click on any card to edit it
5. Make your changes and click "Save" to write back to the file
6. Use the "Edit Set" button to modify set information
7. Navigate back to edit series information

## Important Notes

- **New Variant Format Only**: This editor only supports the new variant format (`Array<variant_detailed>`) with `thirdParty` IDs inside each variant. Cards using the old format will need to be migrated separately.
- **Browser Requirements**: The File System Access API requires a secure context (HTTPS or localhost) and is currently supported in Chrome, Edge, and Opera.
- **File Permissions**: When you first select a directory, the browser will ask for permission to read and write files. Grant this permission to enable saving changes.
- **Backup**: It's recommended to backup your card database before making edits, as changes are written directly to the source files.

## File Structure

```
visualeditor/
├── src/
│   ├── components/
│   │   ├── CardEditor.tsx      # Card editing form
│   │   ├── CardList.tsx        # Card browser with search
│   │   ├── SerieEditor.tsx     # Series editing form
│   │   ├── SeriesList.tsx      # Series browser
│   │   ├── SetEditor.tsx       # Set editing form
│   │   └── SetList.tsx         # Set browser
│   ├── utils/
│   │   ├── fileLoader.ts       # File system operations
│   │   └── parser.ts           # TypeScript file parsing/generation
│   ├── App.tsx                 # Main application component
│   ├── main.tsx                # Application entry point
│   ├── types.ts                # TypeScript type definitions
│   └── index.css              # Global styles
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Development

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Troubleshooting

**"showDirectoryPicker is not defined"**: Your browser doesn't support the File System Access API. Use Chrome, Edge, or Opera.

**Permission denied**: The browser denied file system access. Try selecting the directory again and grant permission when prompted.

**Save failed**: Check the browser console for error messages. Ensure you have write permissions to the card database directory.
