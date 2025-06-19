import React, { useState, useRef } from 'react';
import {
  Paper,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Fade,
  CircularProgress,
} from '@mui/material';
import { DataGrid, GridColDef, GridRowModel, GridRowSelectionModel } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  ViewColumn as ViewColumnIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { mockStudents, defaultColumns, Student } from '../data/mockStudents';
import { exportToCSV, parseCSV } from '../utils/csv';

const Spreadsheet: React.FC = () => {
  const [data, setData] = useState<Student[]>(mockStudents);
  const [columns, setColumns] = useState<GridColDef[]>(defaultColumns);
  const [openColumnDialog, setOpenColumnDialog] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isClassifying, setIsClassifying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Processing Dialog State
  const [openAIDialog, setOpenAIDialog] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiColumnName, setAiColumnName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCellEdit = (params: GridRowModel) => {
    const updatedData = data.map(row =>
      row.id === params.id ? { ...row, ...params } : row
    );
    setData(updatedData);
    console.log('Cell updated:', params);
    return params;
  };

  const handleAddRow = () => {
    const newId = Math.max(...data.map(row => row.id)) + 1;
    const newRow: Student = {
      id: newId,
      firstName: '',
      lastName: '',
      major: ''
    };

    columns.forEach(col => {
      if (col.field !== 'id' && !(col.field in newRow)) {
        (newRow as any)[col.field] = '';
      }
    });

    setData([...data, newRow]);
    setSnackbar({ open: true, message: 'New row added', severity: 'success' });
  };

  const handleAddColumn = () => {
    if (!newColumnName.trim()) {
      setSnackbar({ open: true, message: 'Column name cannot be empty', severity: 'error' });
      return;
    }

    if (columns.some(col => col.field === newColumnName)) {
      setSnackbar({ open: true, message: 'Column already exists', severity: 'error' });
      return;
    }

    const newColumn: GridColDef = {
      field: newColumnName,
      headerName: newColumnName.charAt(0).toUpperCase() + newColumnName.slice(1),
      width: 150,
      editable: true,
    };

    setColumns([...columns, newColumn]);

    const updatedData = data.map(row => ({
      ...row,
      [newColumnName]: ''
    }));
    setData(updatedData);

    setOpenColumnDialog(false);
    setNewColumnName('');
    setSnackbar({ open: true, message: `Column "${newColumnName}" added`, severity: 'success' });
  };

  const handleExportCSV = () => {
    exportToCSV(data, 'students-data.csv');
    setSnackbar({ open: true, message: 'Data exported successfully', severity: 'success' });
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const importedData = parseCSV(csvText);

        if (importedData.length > 0) {
          const newColumnFields = new Set<string>();
          importedData.forEach(row => {
            Object.keys(row).forEach(key => {
              if (key !== 'id') newColumnFields.add(key);
            });
          });

          const newColumns: GridColDef[] = Array.from(newColumnFields).map(field => ({
            field,
            headerName: field.charAt(0).toUpperCase() + field.slice(1),
            width: 150,
            editable: true,
          }));

          setColumns(newColumns);
          setData(importedData);
          setSnackbar({ open: true, message: `Successfully imported ${importedData.length} rows`, severity: 'success' });
        }
      } catch (error) {
        console.error('Import error:', error);
        setSnackbar({ open: true, message: 'Failed to import CSV file', severity: 'error' });
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteRow = (id: number) => {
    const updatedData = data.filter(row => row.id !== id);
    setData(updatedData);
    setSnackbar({ open: true, message: 'Row deleted', severity: 'success' });
  };

  // Function to process data with AI using the backend API
  const processWithAI = async (rows: any[], prompt: string, columnName: string): Promise<string[]> => {
    try {
      // Convert rows to the format expected by the backend (remove 'id' field)
      const rowsForBackend = rows.map(row => {
        const { id, ...rowWithoutId } = row;
        return rowWithoutId;
      });

      const requestBody = {
        rows: rowsForBackend,
        columnName: columnName,
        prompt: prompt
      };

      console.log('Sending request to backend:', JSON.stringify(requestBody, null, 2));

      const response = await fetch('http://localhost:8000/generate-column', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('Backend response:', result);
      return result.values;
    } catch (error) {
      console.error('AI processing error:', error);
      throw error;
    }
  };

  // Process all rows with AI
  const processAllRowsWithAI = async () => {
    if (!aiPrompt.trim() || !aiColumnName.trim()) {
      setSnackbar({ open: true, message: 'Please enter both prompt and column name', severity: 'error' });
      return;
    }

    // Create new column if it doesn't exist
    if (!columns.some(col => col.field === aiColumnName)) {
      const newColumn: GridColDef = {
        field: aiColumnName,
        headerName: aiColumnName.charAt(0).toUpperCase() + aiColumnName.slice(1),
        width: 150,
        editable: true,
      };
      setColumns([...columns, newColumn]);

      const updatedData = data.map(row => ({
        ...row,
        [aiColumnName]: ''
      }));
      setData(updatedData);
    }

    setIsProcessing(true);
    try {
      const results = await processWithAI(data, aiPrompt, aiColumnName);

      const updatedData = data.map((row, index) => ({
        ...row,
        [aiColumnName]: results[index] || ''
      }));

      setData(updatedData);
      setSnackbar({ open: true, message: 'AI processing completed for all rows', severity: 'success' });
      setOpenAIDialog(false);
      setAiPrompt('');
      setAiColumnName('');
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to process with AI', severity: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Process selected rows with AI
  const processSelectedRowsWithAI = async () => {
    console.log('Processing selected rows. Current selection:', selectedRows);
    if (selectedRows.length === 0) {
      setSnackbar({ open: true, message: 'Please select rows first', severity: 'error' });
      return;
    }

    if (!aiPrompt.trim() || !aiColumnName.trim()) {
      setSnackbar({ open: true, message: 'Please enter both prompt and column name', severity: 'error' });
      return;
    }

    // Create new column if it doesn't exist
    if (!columns.some(col => col.field === aiColumnName)) {
      const newColumn: GridColDef = {
        field: aiColumnName,
        headerName: aiColumnName.charAt(0).toUpperCase() + aiColumnName.slice(1),
        width: 150,
        editable: true,
      };
      setColumns([...columns, newColumn]);

      const updatedData = data.map(row => ({
        ...row,
        [aiColumnName]: ''
      }));
      setData(updatedData);
    }

    setIsProcessing(true);
    try {
      console.log('Filtering data for selected rows:', selectedRows);
      const selectedData = data.filter(row => selectedRows.includes(row.id));
      console.log('Selected data:', selectedData);
      const results = await processWithAI(selectedData, aiPrompt, aiColumnName);

      const updatedData = data.map(row => {
        if (selectedRows.includes(row.id)) {
          const selectedIndex = selectedData.findIndex(selectedRow => selectedRow.id === row.id);
          return {
            ...row,
            [aiColumnName]: results[selectedIndex] || ''
          };
        }
        return row;
      });

      setData(updatedData);
      setSnackbar({ open: true, message: `AI processing completed for ${selectedRows.length} selected rows`, severity: 'success' });
      setOpenAIDialog(false);
      setAiPrompt('');
      setAiColumnName('');
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to process with AI', severity: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRowSelectionChange = (newSelection: GridRowSelectionModel) => {
    console.log('Selection changed:', newSelection);

    // Handle different formats of GridRowSelectionModel
    let selectionArray: number[] = [];

    if (Array.isArray(newSelection)) {
      // If it's already an array
      selectionArray = newSelection as number[];
    } else if (newSelection && typeof newSelection === 'object' && 'ids' in newSelection) {
      // If it's an object with ids property (Set)
      const idsSet = newSelection.ids as Set<number>;
      selectionArray = Array.from(idsSet);
    }

    console.log('Converted selection:', selectionArray);
    setSelectedRows(selectionArray);
  };

  const columnsWithActions: GridColDef[] = [
    ...columns,
    {
      field: 'actions',
      headerName: '',
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Delete row">
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteRow(params.row.id);
            }}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 87, 34, 0.08)',
              }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Fade in timeout={600}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          background: 'linear-gradient(145deg, #1a1a1a 0%, #1e1e1e 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 8px 24px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Action Bar */}
        <Box sx={{ mb: 3 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{
              alignItems: { xs: 'stretch', sm: 'center' },
              justifyContent: 'space-between'
            }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Chip
                label={`${data.length} records`}
                color="primary"
                variant="outlined"
                size="small"
                sx={{
                  fontWeight: 500,
                  backgroundColor: 'rgba(0, 188, 212, 0.1)',
                  borderColor: 'rgba(0, 188, 212, 0.3)'
                }}
              />
            </Stack>

            <Stack direction="row" spacing={1.5}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddRow}
                size="small"
                sx={{
                  background: 'linear-gradient(45deg, #00bcd4, #0097a7)',
                  minWidth: 'auto',
                  px: 2
                }}
              >
                Row
              </Button>

              <Button
                variant="outlined"
                startIcon={<ViewColumnIcon />}
                onClick={() => setOpenColumnDialog(true)}
                color="secondary"
                size="small"
                sx={{ minWidth: 'auto', px: 2 }}
              >
                Column
              </Button>

              <Button
                variant="contained"
                startIcon={isProcessing ? <CircularProgress size={16} /> : <AutoAwesomeIcon />}
                onClick={() => setOpenAIDialog(true)}
                disabled={isProcessing}
                color="primary"
                size="small"
                sx={{
                  background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                  minWidth: 'auto',
                  px: 2
                }}
              >
                {isProcessing ? 'Processing...' : 'AI Process'}
              </Button>

              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportCSV}
                color="primary"
                size="small"
                sx={{ minWidth: 'auto', px: 2 }}
              >
                Export
              </Button>

              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                component="label"
                color="secondary"
                size="small"
                sx={{ minWidth: 'auto', px: 2 }}
              >
                Import
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  style={{ display: 'none' }}
                />
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Data Grid */}
        <Box sx={{
          height: 600,
          width: '100%',
          '& .MuiDataGrid-root': {
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }
        }}>
          <DataGrid
            rows={data}
            columns={columnsWithActions}
            processRowUpdate={handleCellEdit}
            onProcessRowUpdateError={(error) => {
              console.error('Row update error:', error);
              setSnackbar({ open: true, message: 'Failed to update row', severity: 'error' });
            }}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 25 },
              },
            }}
            checkboxSelection
            onRowSelectionModelChange={handleRowSelectionChange}
            disableRowSelectionOnClick
          />
        </Box>

        {/* Add Column Dialog */}
        <Dialog
          open={openColumnDialog}
          onClose={() => setOpenColumnDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)'
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>Add New Column</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Column Name"
              fullWidth
              variant="outlined"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddColumn();
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpenColumnDialog(false)} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleAddColumn} variant="contained">
              Add Column
            </Button>
          </DialogActions>
        </Dialog>

        {/* AI Processing Dialog */}
        <Dialog
          open={openAIDialog}
          onClose={() => setOpenAIDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)'
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>AI Data Processing</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Stack spacing={3}>
              <TextField
                autoFocus
                margin="dense"
                label="Column Name"
                fullWidth
                variant="outlined"
                value={aiColumnName}
                onChange={(e) => setAiColumnName(e.target.value)}
                placeholder="e.g., classification, sentiment, category"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
              <TextField
                margin="dense"
                label="AI Prompt"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Enter your custom prompt. For example: 'Classify this major as STEM, Humanities, or Business' or 'Count the number of letters in this name'"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />

              {/* Selection Status */}
              <Box sx={{ p: 2, bgcolor: 'rgba(25, 118, 210, 0.1)', borderRadius: 2, border: '1px solid rgba(25, 118, 210, 0.3)' }}>
                <Box sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>📊 Selection Status:</Box>
                <Box sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
                  • Total rows: {data.length}<br />
                  • Selected rows: {selectedRows.length}<br />
                  {selectedRows.length > 0 && (
                    <Box sx={{ mt: 1, fontSize: '0.8rem', color: 'success.main' }}>
                      ✓ You can process only selected rows
                    </Box>
                  )}
                </Box>
              </Box>

              <Box sx={{ p: 2, bgcolor: 'rgba(255, 193, 7, 0.1)', borderRadius: 2, border: '1px solid rgba(255, 193, 7, 0.3)' }}>
                <Box sx={{ fontWeight: 600, mb: 1, color: 'warning.main' }}>💡 Examples:</Box>
                <Box sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
                  • "Classify this major as STEM, Humanities, or Business"<br />
                  • "Count the number of letters in this name"<br />
                  • "Extract the first letter of each name"<br />
                  • "Rate this major's difficulty from 1-10"
                </Box>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpenAIDialog(false)} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={processSelectedRowsWithAI}
              variant="outlined"
              disabled={isProcessing || selectedRows.length === 0}
              sx={{
                minWidth: 120,
                ...(selectedRows.length === 0 && { opacity: 0.5 })
              }}
            >
              Selected Rows ({selectedRows.length})
            </Button>
            <Button
              onClick={processAllRowsWithAI}
              variant="contained"
              disabled={isProcessing}
            >
              All Rows ({data.length})
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{ borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Fade>
  );
};

export default Spreadsheet;
