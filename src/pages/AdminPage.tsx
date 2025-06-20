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
  Dashboard as DashboardIcon,
  Edit,
  Delete,
  Add,
  Check,
  Close,
  Person,
  People,
  Search
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
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  homeLocation: string;
  isAdmin: boolean;
  isVerified: boolean;
}

const AdminPage = () => {
  const { user, logout } = useAuth();
  const token = user?.token;
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
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        if (activeTab === 0) {
          setLoading(prev => ({ ...prev, passengers: true }));
          const response = await fetch('https://wells-api.vercel.app/api/passengers', { headers });
          const data = await response.json();
          setPassengers(data);
        } else if (activeTab === 1) {
          setLoading(prev => ({ ...prev, users: true }));
          const response = await fetch('https://wells-api.vercel.app/api/users', { headers });
          const data = await response.json();
          setUsers(data);
        } else if (activeTab === 2) {
          setLoading(prev => ({ ...prev, unverified: true }));
          const response = await fetch('https://wells-api.vercel.app/api/users/unverified', { headers });
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
  }, [activeTab, token]);

  const handleOpenDialog = (item: Passenger | User | null = null) => {
    if (item && activeTab === 1) {
      setCurrentItem({
        ...item,
        password: '',
        confirmPassword: ''
      } as UserForm);
    } else if (!item && activeTab === 1) {
      setCurrentItem({
        _id: '',
        userEmail: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        homeLocation: '',
        isAdmin: false,
        isVerified: true
      });
    } else if (item && activeTab === 0) {
      setCurrentItem(item as PassengerForm);
    } else {
      setCurrentItem({
        _id: '',
        firstName: '',
        lastName: '',
        jobRole: ''
      });
    }
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
      if (activeTab === 1 && !isEditing) {
        const userForm = currentItem as UserForm;
        if (!userForm.password || userForm.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        if (userForm.password !== userForm.confirmPassword) {
          throw new Error("Passwords don't match");
        }
      }

      let response;
      const url = activeTab === 0 ? 'https://wells-api.vercel.app/api/passengers' : 'https://wells-api.vercel.app/api/users';
      const id = currentItem?._id;
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      let dataToSend;
      if (activeTab === 0) {
        dataToSend = currentItem;
      } else {
        const userForm = currentItem as UserForm;
        dataToSend = {
          userEmail: userForm.userEmail,
          ...(isEditing ? {} : { password: userForm.password }),
          firstName: userForm.firstName,
          lastName: userForm.lastName,
          homeLocation: userForm.homeLocation,
          isAdmin: userForm.isAdmin,
          isVerified: userForm.isVerified
        };
      }

      if (isEditing && id) {
        response = await fetch(`${url}/${id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(dataToSend),
        });
      } else {
        response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(dataToSend),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Operation failed');
      }

      setSnackbar({
        open: true,
        message: `Successfully ${isEditing ? 'updated' : 'created'}`,
        severity: 'success'
      });

      const headersForRefresh = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      if (activeTab === 0) {
        const passengersResponse = await fetch('https://wells-api.vercel.app/api/passengers', { headers: headersForRefresh });
        setPassengers(await passengersResponse.json());
      } else {
        const usersResponse = await fetch('https://wells-api.vercel.app/api/users', { headers: headersForRefresh });
        setUsers(await usersResponse.json());
        const unverifiedResponse = await fetch('https://wells-api.vercel.app/api/users/unverified', { headers: headersForRefresh });
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
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Delete failed');

      setSnackbar({
        open: true,
        message: 'Successfully deleted',
        severity: 'success'
      });

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
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Verification failed');

      setSnackbar({
        open: true,
        message: 'User verified successfully',
        severity: 'success'
      });

      const unverifiedResponse = await fetch('https://wells-api.vercel.app/api/users/unverified', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setUnverifiedUsers(await unverifiedResponse.json());
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Verification failed',
        severity: 'error'
      });
    }
  };

  const filterPassengers = (passenger: Passenger) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const firstName = passenger.firstName?.toLowerCase() || '';
    const lastName = passenger.lastName?.toLowerCase() || '';
    const jobRole = passenger.jobRole?.toLowerCase() || '';
    return (
      firstName.includes(term) ||
      lastName.includes(term) ||
      jobRole.includes(term)
    );
  };

  const filterUsers = (user: User) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const email = user.userEmail?.toLowerCase() || '';
    const firstName = user.firstName?.toLowerCase() || '';
    const lastName = user.lastName?.toLowerCase() || '';
    const homeLocation = user.homeLocation?.toLowerCase() || '';
    const adminStatus = user.isAdmin ? 'admin' : '';
    return (
      email.includes(term) ||
      firstName.includes(term) ||
      lastName.includes(term) ||
      homeLocation.includes(term) ||
      adminStatus.includes(term)
    );
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="static" sx={{ backgroundColor: '#1E1E1E', color: 'white' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <IconButton 
            color="inherit" 
            onClick={() => navigate('/heli')} 
            sx={{ ml: 2 }}
          >
            <DashboardIcon />
          </IconButton>
          <Typography variant="subtitle1">
            {user?.userEmail}
          </Typography>
          <Button variant="text" onClick={logout} color="inherit" size="small"
            sx={{ 
              textTransform: 'none',
              ml: 1,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)'
              }
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Paper sx={{ p: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            indicatorColor="secondary"
            textColor="primary"
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
                    <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
                      <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search passengers..."
                        InputProps={{
                          startAdornment: <Search color="action" sx={{ mr: 1 }} />
                        }}
                        sx={{ width: 300 }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog()}
                      >
                        Add Passenger
                      </Button>
                    </Box>
                    <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>First Name</TableCell>
                            <TableCell>Last Name</TableCell>
                            <TableCell>Job Role</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {passengers.filter(filterPassengers).map((passenger) => (
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
                    <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
                      <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search users..."
                        InputProps={{
                          startAdornment: <Search color="action" sx={{ mr: 1 }} />
                        }}
                        sx={{ width: 300 }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog()}
                      >
                        Add User
                      </Button>
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
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                          {unverifiedUsers.filter(filterUsers).map((user) => (
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
                  </>
                )}
              </>
            )}
          </Box>
        </Paper>
      </Container>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
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
                  required
                />
                <TextField
                  name="lastName"
                  label="Last Name"
                  value={(currentItem as PassengerForm)?.lastName || ''}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
                <TextField
                  name="jobRole"
                  label="Job Role"
                  value={(currentItem as PassengerForm)?.jobRole || ''}
                  onChange={handleInputChange}
                  fullWidth
                  required
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
                  required
                />
                {!isEditing && (
                  <>
                    <TextField
                      name="password"
                      label="Password"
                      type="password"
                      value={(currentItem as UserForm)?.password || ''}
                      onChange={handleInputChange}
                      fullWidth
                      required
                    />
                    <TextField
                      name="confirmPassword"
                      label="Confirm Password"
                      type="password"
                      value={(currentItem as UserForm)?.confirmPassword || ''}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      error={
                        (currentItem as UserForm)?.password !== 
                        (currentItem as UserForm)?.confirmPassword
                      }
                      helperText={
                        (currentItem as UserForm)?.password !== 
                        (currentItem as UserForm)?.confirmPassword ? 
                        "Passwords don't match" : ""
                      }
                    />
                  </>
                )}
                <TextField
                  name="firstName"
                  label="First Name"
                  value={(currentItem as UserForm)?.firstName || ''}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
                <TextField
                  name="lastName"
                  label="Last Name"
                  value={(currentItem as UserForm)?.lastName || ''}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
                <TextField
                  name="homeLocation"
                  label="Home Location"
                  value={(currentItem as UserForm)?.homeLocation || ''}
                  onChange={handleInputChange}
                  fullWidth
                  required
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