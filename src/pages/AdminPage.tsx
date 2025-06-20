/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Settings,
  Edit,
  Delete,
  Add,
  Check,
  Close,
  Person,
  People
} from '@mui/icons-material';

interface Passenger {
  _id: string;
  firstName: string;
  lastName: string;
  jobRole: string;
}

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

interface PassengerForm {
  _id: string;
  firstName: string;
  lastName: string;
  jobRole: string;
}

interface UserForm {
  _id: string;
  userEmail: string;
  firstName: string;
  lastName: string;
  homeLocation: string;
  isAdmin: boolean;
  isVerified: boolean;
}

const AdminPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [unverifiedUsers, setUnverifiedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState({
    passengers: false,
    users: false,
    unverified: false
  });
  const [, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState<PassengerForm | UserForm | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeTab === 0) {
          setLoading(prev => ({ ...prev, passengers: true }));
          const response = await fetch('https://wells-api.vercel.app/api/passengers');
          const data = await response.json();
          setPassengers(data);
        } else if (activeTab === 1) {
          setLoading(prev => ({ ...prev, users: true }));
          const response = await fetch('https://wells-api.vercel.app/api/users');
          const data = await response.json();
          setUsers(data);
        } else if (activeTab === 2) {
          setLoading(prev => ({ ...prev, unverified: true }));
          const response = await fetch('https://wells-api.vercel.app/api/users/unverified');
          const data = await response.json();
          setUnverifiedUsers(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setSnackbar({
          open: true,
          message: 'Failed to fetch data',
          severity: 'error'
        });
      } finally {
        setLoading({
          passengers: false,
          users: false,
          unverified: false
        });
      }
    };

    fetchData();
  }, [activeTab]);

  const handleOpenDialog = (item: Passenger | User | null = null) => {
    setCurrentItem(item);
    setIsEditing(!!item);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentItem(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentItem(prev => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSave = async () => {
    try {
      let response;
      const url = activeTab === 0 ? 'https://wells-api.vercel.app/api/passengers' : 'https://wells-api.vercel.app/api/users';
      const id = currentItem?._id;

      if (isEditing && id) {
        response = await fetch(`${url}/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(currentItem),
        });
      } else {
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(currentItem),
        });
      }

      if (!response.ok) throw new Error('Operation failed');

      setSnackbar({
        open: true,
        message: `Successfully ${isEditing ? 'updated' : 'created'}`,
        severity: 'success'
      });

      // Refresh data
      if (activeTab === 0) {
        const passengersResponse = await fetch('https://wells-api.vercel.app/api/passengers');
        setPassengers(await passengersResponse.json());
      } else {
        const usersResponse = await fetch('https://wells-api.vercel.app/api/users');
        setUsers(await usersResponse.json());
        const unverifiedResponse = await fetch('https://wells-api.vercel.app/api/users/unverified');
        setUnverifiedUsers(await unverifiedResponse.json());
      }

      handleCloseDialog();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Operation failed',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const url = activeTab === 0 ? `https://wells-api.vercel.app/api/passengers/${id}` : `https://wells-api.vercel.app/api/users/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');

      setSnackbar({
        open: true,
        message: 'Successfully deleted',
        severity: 'success'
      });

      // Refresh data
      if (activeTab === 0) {
        setPassengers(passengers.filter(p => p._id !== id));
      } else {
        setUsers(users.filter(u => u._id !== id));
        setUnverifiedUsers(unverifiedUsers.filter(u => u._id !== id));
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Delete failed',
        severity: 'error'
      });
    }
  };

  const handleVerifyUser = async (userId: string) => {
    try {
      const response = await fetch(`https://wells-api.vercel.app/api/users/verify/${userId}`, {
        method: 'PUT',
      });

      if (!response.ok) throw new Error('Verification failed');

      setSnackbar({
        open: true,
        message: 'User verified successfully',
        severity: 'success'
      });

      // Refresh unverified users list
      const unverifiedResponse = await fetch('https://wells-api.vercel.app/api/users/unverified');
      setUnverifiedUsers(await unverifiedResponse.json());
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Verification failed',
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ backgroundColor: '#121212', minHeight: '100vh', color: 'white' }}>
      <AppBar position="static" sx={{ backgroundColor: '#1E1E1E', color: 'white' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="subtitle1">
            Welcome, {user?.firstName}!
          </Typography>
          <IconButton color="inherit" onClick={() => navigate('/')} sx={{ ml: 2 }}>
            <Settings />
          </IconButton>
          <Button color="inherit" onClick={logout} sx={{ ml: 2 }}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Paper sx={{ backgroundColor: '#1E1E1E', color: 'white', p: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            indicatorColor="secondary"
            textColor="inherit"
            variant="fullWidth"
          >
            <Tab label="Passengers" icon={<Person />} />
            <Tab label="Users" icon={<People />} />
            <Tab label="Unverified Users" icon={<People />} />
          </Tabs>

          <Box sx={{ mt: 3 }}>
            {loading.passengers || loading.users || loading.unverified ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {activeTab === 0 && (
                  <>
                    <Box display="flex" justifyContent="flex-end" mb={2}>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog({
                          _id: '',
                          firstName: '',
                          lastName: '',
                          jobRole: ''
                        })}
                      >
                        Add Passenger
                      </Button>
                    </Box>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>First Name</TableCell>
                            <TableCell>Last Name</TableCell>
                            <TableCell>Job Role</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {passengers.map((passenger) => (
                            <TableRow key={passenger._id}>
                              <TableCell>{passenger.firstName}</TableCell>
                              <TableCell>{passenger.lastName}</TableCell>
                              <TableCell>{passenger.jobRole}</TableCell>
                              <TableCell>
                                <IconButton
                                  color="primary"
                                  onClick={() => handleOpenDialog(passenger)}
                                >
                                  <Edit />
                                </IconButton>
                                <IconButton
                                  color="error"
                                  onClick={() => handleDelete(passenger._id)}
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
                )}

                {activeTab === 1 && (
                  <>
                    <Box display="flex" justifyContent="flex-end" mb={2}>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog({
                          _id: '',
                          userEmail: '',
                          firstName: '',
                          lastName: '',
                          homeLocation: '',
                          isAdmin: false,
                          isVerified: true
                        })}
                      >
                        Add User
                      </Button>
                    </Box>
                    <TableContainer>
                      <Table>
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
                          {users.map((user) => (
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
                                  onClick={() => handleOpenDialog(user)}
                                >
                                  <Edit />
                                </IconButton>
                                <IconButton
                                  color="error"
                                  onClick={() => handleDelete(user._id)}
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
                )}

                {activeTab === 2 && (
                  <TableContainer>
                    <Table>
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
                        {unverifiedUsers.map((user) => (
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
                                onClick={() => handleVerifyUser(user._id)}
                              >
                                Verify
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            )}
          </Box>
        </Paper>
      </Container>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {isEditing ? 'Edit' : 'Add New'} {activeTab === 0 ? 'Passenger' : 'User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {activeTab === 0 ? (
              <>
                <TextField
                  name="firstName"
                  label="First Name"
                  value={(currentItem as PassengerForm)?.firstName || ''}
                  onChange={handleInputChange}
                  fullWidth
                />
                <TextField
                  name="lastName"
                  label="Last Name"
                  value={(currentItem as PassengerForm)?.lastName || ''}
                  onChange={handleInputChange}
                  fullWidth
                />
                <TextField
                  name="jobRole"
                  label="Job Role"
                  value={(currentItem as PassengerForm)?.jobRole || ''}
                  onChange={handleInputChange}
                  fullWidth
                />
              </>
            ) : (
              <>
                <TextField
                  name="userEmail"
                  label="Email"
                  value={(currentItem as UserForm)?.userEmail || ''}
                  onChange={handleInputChange}
                  fullWidth
                  type="email"
                />
                <TextField
                  name="firstName"
                  label="First Name"
                  value={(currentItem as UserForm)?.firstName || ''}
                  onChange={handleInputChange}
                  fullWidth
                />
                <TextField
                  name="lastName"
                  label="Last Name"
                  value={(currentItem as UserForm)?.lastName || ''}
                  onChange={handleInputChange}
                  fullWidth
                />
                <TextField
                  name="homeLocation"
                  label="Home Location"
                  value={(currentItem as UserForm)?.homeLocation || ''}
                  onChange={handleInputChange}
                  fullWidth
                />
                <TextField
                  name="isAdmin"
                  label="Is Admin"
                  value={(currentItem as UserForm)?.isAdmin ? 'true' : 'false'}
                  onChange={(e) => {
                    if (currentItem) {
                      setCurrentItem({
                        ...currentItem,
                        isAdmin: e.target.value === 'true'
                      } as UserForm);
                    }
                  }}
                  select
                  fullWidth
                >
                  <MenuItem value="false">No</MenuItem>
                  <MenuItem value="true">Yes</MenuItem>
                </TextField>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPage;