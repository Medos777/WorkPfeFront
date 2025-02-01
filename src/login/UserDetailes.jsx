import React, { useState, useEffect } from 'react';
import UserService from '../service/UserService';
import { toast } from 'react-toastify';
import {
    Box,
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Container,
    Typography,
    IconButton,
    Chip,
    Tooltip,
    alpha,
    useTheme,
    Stack,
    Divider,
    Grid,
    Avatar,
    MenuItem,
    InputAdornment,
    FormControl,
    InputLabel,
    Select
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
    Add as AddIcon,
    Person as PersonIcon
} from '@mui/icons-material';

const UserDetails = () => {
    const theme = useTheme();
    const [users, setUsers] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isCreateMode, setIsCreateMode] = useState(false);
    const [editFormData, setEditFormData] = useState({
        username: '',
        email: '',
        password: '',
        adresse: '',
        tel: '',
        role: 'developer',
        bio: '',
        profileImage: ''
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await UserService.getAll();
            setUsers(response.data);
        } catch (error) {
            toast.error('Error loading users');
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await UserService.deleteUsers(userId);
                toast.success('User deleted successfully');
                loadUsers();
            } catch (error) {
                toast.error('Error deleting user');
            }
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setIsCreateMode(false);
        setEditFormData({
            username: user.username || '',
            email: user.email || '',
            password: '',  // Don't show existing password
            adresse: user.adresse || '',
            tel: user.tel || '',
            role: user.role || '',
            bio: user.bio || '',
            profileImage: user.profileImage || ''
        });
        setOpenDialog(true);
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setIsCreateMode(true);
        setEditFormData({
            username: '',
            email: '',
            password: '',
            adresse: '',
            tel: '',
            role: 'developer',
            bio: '',
            profileImage: ''
        });
        setOpenDialog(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isCreateMode) {
                await UserService.create(editFormData);
                toast.success('User created successfully');
            } else {
                await UserService.update(selectedUser._id, editFormData);
                toast.success('User updated successfully');
            }
            setOpenDialog(false);
            loadUsers();
        } catch (error) {
            toast.error(isCreateMode ? 'Error creating user' : 'Error updating user');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filteredUsers = users.filter(user =>
        Object.values(user).some(value =>
            value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const getRoleColor = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return 'error';
            case 'developer':
                return 'primary';
            default:
                return 'default';
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Card 
                    elevation={0}
                    sx={{ 
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        p: 3,
                        borderRadius: 2
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <PersonIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                        <Box>
                            <Typography variant="h4" component="h1" gutterBottom={false} 
                                sx={{ 
                                    color: theme.palette.primary.main,
                                    fontWeight: 600
                                }}
                            >
                                User Management
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Manage your system users and their roles
                            </Typography>
                        </Box>
                    </Stack>
                </Card>

                <Card 
                    sx={{ 
                        mt: 3,
                        borderRadius: 2,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                >
                    <Box sx={{ 
                        p: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        borderBottom: 1,
                        borderColor: 'divider'
                    }}>
                        <TextField
                            size="small"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ 
                                width: 300,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    backgroundColor: theme.palette.background.paper,
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleCreate}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    px: 3
                                }}
                            >
                                Add User
                            </Button>
                            <Tooltip title="Refresh list">
                                <IconButton 
                                    onClick={loadUsers}
                                    sx={{ 
                                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                        }
                                    }}
                                >
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredUsers
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((user) => (
                                        <TableRow 
                                            key={user._id} 
                                            hover
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                                }
                                            }}
                                        >
                                            <TableCell>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    {user.profileImage ? (
                                                        <Avatar src={user.profileImage} />
                                                    ) : (
                                                        <Avatar>{user.username?.charAt(0)?.toUpperCase()}</Avatar>
                                                    )}
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {user.username}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {user.bio ? user.bio.substring(0, 50) + (user.bio.length > 50 ? '...' : '') : ''}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {user.email}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.role}
                                                    color={getRoleColor(user.role)}
                                                    size="small"
                                                    sx={{ 
                                                        borderRadius: 1,
                                                        textTransform: 'capitalize',
                                                        fontWeight: 500
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Edit user">
                                                    <IconButton
                                                        onClick={() => handleEdit(user)}
                                                        size="small"
                                                        sx={{ 
                                                            mr: 1,
                                                            color: theme.palette.primary.main,
                                                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                                            '&:hover': {
                                                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                            }
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete user">
                                                    <IconButton
                                                        onClick={() => handleDelete(user._id)}
                                                        size="small"
                                                        sx={{ 
                                                            color: theme.palette.error.main,
                                                            backgroundColor: alpha(theme.palette.error.main, 0.05),
                                                            '&:hover': {
                                                                backgroundColor: alpha(theme.palette.error.main, 0.1),
                                                            }
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Divider />
                    <TablePagination
                        component="div"
                        count={filteredUsers.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25]}
                    />
                </Card>
            </Box>

            <Dialog 
                open={openDialog} 
                onClose={() => setOpenDialog(false)}
                PaperProps={{
                    sx: {
                        width: '100%',
                        maxWidth: 600,
                        borderRadius: 2
                    }
                }}
            >
                <form onSubmit={handleSubmit}>
                    <DialogTitle>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            {isCreateMode ? <AddIcon color="primary" /> : <EditIcon color="primary" />}
                            <Typography variant="h6" component="div">
                                {isCreateMode ? 'Create New User' : 'Edit User'}
                            </Typography>
                        </Stack>
                    </DialogTitle>
                    <Divider />
                    <DialogContent sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    autoFocus
                                    required
                                    name="username"
                                    label="Username"
                                    type="text"
                                    fullWidth
                                    value={editFormData.username}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    name="email"
                                    label="Email"
                                    type="email"
                                    fullWidth
                                    value={editFormData.email}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            {isCreateMode && (
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        name="password"
                                        label="Password"
                                        type="password"
                                        fullWidth
                                        value={editFormData.password}
                                        onChange={handleInputChange}
                                    />
                                </Grid>
                            )}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    name="tel"
                                    label="Phone Number"
                                    type="tel"
                                    fullWidth
                                    value={editFormData.tel}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="role-label">Role</InputLabel>
                                    <Select
                                        labelId="role-label"
                                        id="role"
                                        name="role"
                                        label="Role"
                                        value={editFormData.role}
                                        onChange={handleInputChange}
                                    >
                                        <MenuItem value="admin">Admin</MenuItem>
                                        <MenuItem value="manager">Manager</MenuItem>
                                        <MenuItem value="developer">Developer</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    name="adresse"
                                    label="Address"
                                    type="text"
                                    fullWidth
                                    value={editFormData.adresse}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    name="bio"
                                    label="Bio"
                                    multiline
                                    rows={3}
                                    fullWidth
                                    value={editFormData.bio}
                                    onChange={handleInputChange}
                                    helperText="Maximum 500 characters"
                                    inputProps={{ maxLength: 500 }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    name="profileImage"
                                    label="Profile Image URL"
                                    type="url"
                                    fullWidth
                                    value={editFormData.profileImage}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <Divider />
                    <DialogActions sx={{ p: 2.5 }}>
                        <Button 
                            onClick={() => setOpenDialog(false)}
                            sx={{ 
                                color: theme.palette.text.secondary,
                                textTransform: 'none'
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            sx={{
                                px: 3,
                                borderRadius: 1,
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.dark,
                                }
                            }}
                        >
                            {isCreateMode ? 'Create User' : 'Save Changes'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
};

export default UserDetails;