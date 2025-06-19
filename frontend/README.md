
# Advanced Spreadsheet Application

A polished, full-featured spreadsheet component built with React, TypeScript, and Material-UI that provides comprehensive data management capabilities.

## Features

### 🗂️ Data Management
- **Pre-loaded Students Database**: Starts with 10 sample student records
- **Real-time Cell Editing**: Click any cell to edit in-place
- **Dynamic Row Management**: Add new rows with a single click
- **Dynamic Column Management**: Add custom columns with user-defined names
- **Row Deletion**: Remove individual rows with confirmation

### 📊 Import/Export
- **CSV Export**: Download current data as CSV file
- **CSV Import**: Upload CSV files to replace current data
- **Smart Column Detection**: Automatically detects and creates columns from imported data

### 🎨 Design & UX
- **Material-UI Integration**: Beautiful, consistent design system
- **Responsive Layout**: Works perfectly on desktop and mobile
- **Custom Theme**: Turquoise and purple color scheme inspired by modern design
- **Smooth Animations**: Subtle transitions and hover effects
- **Zebra Striping**: Alternating row colors for better readability
- **Sticky Headers**: Column headers remain visible while scrolling

### 🔧 Developer Features
- **TypeScript**: Full type safety and IntelliSense support
- **Clean Architecture**: Well-organized component structure
- **Mock Data System**: Easy to replace with real API calls
- **Utility Functions**: Reusable CSV parsing and export utilities
- **Error Handling**: User-friendly error messages and notifications

## Project Structure

```
src/
├── components/
│   └── Spreadsheet.tsx          # Main spreadsheet component
├── data/
│   └── mockStudents.ts          # Sample data and type definitions
├── theme/
│   └── theme.ts                 # Material-UI custom theme
├── utils/
│   └── csv.ts                   # CSV import/export utilities
└── pages/
    └── Index.tsx                # Main application page
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd advanced-spreadsheet
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

## Usage

### Basic Operations
- **Edit cells**: Click on any cell to start editing
- **Add rows**: Click the "Add Row" button to append a new empty row
- **Add columns**: Click "Add Column" and enter a column name
- **Delete rows**: Click the delete icon in the Actions column

### Import/Export
- **Export**: Click "Export CSV" to download your data
- **Import**: Click "Import CSV" and select a CSV file to replace current data

### API Integration Points

The application is designed for easy API integration. Look for these TODO comments:

```typescript
// TODO: replace mockData with API fetch
// TODO: API call to save changes  
// TODO: API call to create new record
// TODO: API call to delete record
// TODO: API call to update schema
```

## Customization

### Adding New Column Types
Modify the column configuration in `src/data/mockStudents.ts`:

```typescript
export const defaultColumns = [
  { field: 'firstName', headerName: 'First Name', width: 150, editable: true },
  // Add your custom columns here
];
```

### Styling
Update the theme in `src/theme/theme.ts` to customize colors, typography, and component styles.

### Data Structure
Modify the `Student` interface in `src/data/mockStudents.ts` to match your data structure.

## Technologies Used

- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Material-UI (MUI)**: Component library and design system
- **MUI X DataGrid**: Advanced data grid component
- **Vite**: Fast build tool and development server

## Browser Support

- Chrome (latest)
- Firefox (latest)  
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
