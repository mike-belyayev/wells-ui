import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Box, Typography, Button } from '@mui/material';

const columns: GridColDef[] = [ // Now properly typed
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'username', headerName: 'Username', width: 130 },
  { field: 'role', headerName: 'Role', width: 130 },
  { 
    field: 'actions', 
    headerName: 'Actions', 
    width: 200, 
    renderCell: () => (
      <>
        <Button size="small">Edit</Button>
        <Button size="small" color="error">Delete</Button>
      </>
    )
  },
];

const rows = [
  { id: 1, username: 'admin', role: 'admin' },
  { id: 2, username: 'pilot1', role: 'user' },
];

export default function AdminDashboard() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>User Management</Typography>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
        />
      </div>
      <Button variant="contained" sx={{ mt: 2 }}>Add User</Button>
    </Box>
  );
}