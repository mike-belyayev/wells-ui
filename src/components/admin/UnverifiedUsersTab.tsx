import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField } from '@mui/material';
import { Search, Check } from '@mui/icons-material';

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

interface UnverifiedUsersTabProps {
  users: User[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onVerifyUser: (userId: string) => void;
  filterUsers: (user: User) => boolean;
}

const UnverifiedUsersTab = ({
  users,
  searchTerm,
  onSearchChange,
  onVerifyUser,
  filterUsers
}: UnverifiedUsersTabProps) => {
  return (
    <>
      <Box display="flex" justifyContent="flex-start" mb={2}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search unverified users..."
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
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<Check />}
                    onClick={() => onVerifyUser(user._id)}
                  >
                    Verify
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default UnverifiedUsersTab;