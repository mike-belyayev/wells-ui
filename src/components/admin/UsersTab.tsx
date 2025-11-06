import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, TextField } from '@mui/material';
import { Edit, Delete, Search, Check, Close } from '@mui/icons-material';

// Define interfaces locally
interface User {
  _id: string;
  userEmail: string;
  firstName: string;
  lastName: string;
  homeLocation: string;
  isAdmin: boolean;
  isVerified: boolean;
  lastLogin?: string;
}

interface UsersTabProps {
  users: User[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onOpenDialog: (user?: User | null) => void;
  onDelete: (id: string) => void;
  filterUsers: (user: User) => boolean;
}

const UsersTab = ({
  users,
  searchTerm,
  onSearchChange,
  onOpenDialog,
  onDelete,
  filterUsers
}: UsersTabProps) => {
  return (
    <>
      <Box display="flex" justifyContent="flex-start" mb={2}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search users..."
          InputProps={{
            startAdornment: <Search color="action" sx={{ mr: 1 }} />
          }}
          sx={{ width: 300 }}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </Box>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.filter(filterUsers).map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.userEmail}</TableCell>
                <TableCell>{user.firstName}</TableCell>
                <TableCell>{user.lastName}</TableCell>
                <TableCell>{user.homeLocation}</TableCell>
                <TableCell>
                  {user.isAdmin ? <Check color="success" /> : <Close color="error" />}
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => onOpenDialog(user)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => onDelete(user._id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default UsersTab;