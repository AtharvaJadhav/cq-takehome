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

  // Function to classify majors using the backend API
  const classifyMajors = async (majors: string[]): Promise<string[]> => {
    try {
      const response = await fetch('http://localhost:8000/generate-column', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rows: majors.map(major => ({ major })),
          columnName: 'classify'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.values;
    } catch (error) {
      console.error('Classification error:', error);
      throw error;
    }
  };

  // Auto-populate classify column for all rows
  const autoPopulateClassifyColumn = async () => {
    // Create classify column if it doesn't exist
    if (!columns.some(col => col.field === 'classify')) {
      const newColumn: GridColDef = {
        field: 'classify',
        headerName: 'Classify',
        width: 150,
        editable: true,
      };
      setColumns([...columns, newColumn]);

      const updatedData = data.map(row => ({
        ...row,
        classify: ''
      }));
      setData(updatedData);
    }

    setIsClassifying(true);
    try {
      const majors = data.map(row => row.major || '');
      const classifications = await classifyMajors(majors);

      const updatedData = data.map((row, index) => ({
        ...row,
        classify: classifications[index] || ''
      }));

      setData(updatedData);
      setSnackbar({ open: true, message: 'Classification completed for all rows', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to classify majors', severity: 'error' });
    } finally {
      setIsClassifying(false);
    }
  };

  // Auto-populate classify column for selected rows only
  const autoPopulateSelectedRows = async () => {
    if (selectedRows.length === 0) {
      setSnackbar({ open: true, message: 'Please select rows first', severity: 'error' });
      return;
    }

    // Create classify column if it doesn't exist
    if (!columns.some(col => col.field === 'classify')) {
      const newColumn: GridColDef = {
        field: 'classify',
        headerName: 'Classify',
        width: 150,
        editable: true,
      };
      setColumns([...columns, newColumn]);

      const updatedData = data.map(row => ({
        ...row,
        classify: ''
      }));
      setData(updatedData);
    }

    setIsClassifying(true);
    try {
      const selectedData = data.filter(row => selectedRows.includes(row.id));
      const majors = selectedData.map(row => row.major || '');
      const classifications = await classifyMajors(majors);

      const updatedData = data.map(row => {
        if (selectedRows.includes(row.id)) {
          const selectedIndex = selectedData.findIndex(selectedRow => selectedRow.id === row.id);
          return {
            ...row,
            classify: classifications[selectedIndex] || ''
          };
        }
        return row;
      });

      setData(updatedData);
      setSnackbar({ open: true, message: `Classification completed for ${selectedRows.length} selected rows`, severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to classify majors', severity: 'error' });
    } finally {
      setIsClassifying(false);
    }
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
                variant="outlined"
                startIcon={isClassifying ? <CircularProgress size={16} /> : <AutoAwesomeIcon />}
                onClick={autoPopulateClassifyColumn}
                disabled={isClassifying}
                color="primary"
                size="small"
                sx={{ minWidth: 'auto', px: 2 }}
              >
                {isClassifying ? 'Classifying...' : 'Classify All'}
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
