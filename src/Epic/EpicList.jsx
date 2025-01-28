import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import {
    Box,
    Typography,
    Button,
    IconButton,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Tooltip,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
    Collapse,
    Fade,
    Zoom,
    useTheme,
    useMediaQuery,
    Grid,
    Card,
    CardContent,
    Stack
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Send as SendIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Reply as ReplyIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    InsertEmoticon as EmojiIcon
} from '@mui/icons-material';
import epicService from '../service/EpicService';
import AddEpic from './AddEpic';

// Cookie utility functions
const cookieUtils = {
    setCookie: (name, value, days = 7) => {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${JSON.stringify(value)};expires=${expires.toUTCString()};path=/`;
    },
    
    getCookie: (name) => {
        const nameEQ = `${name}=`;
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                try {
                    return JSON.parse(c.substring(nameEQ.length, c.length));
                } catch (e) {
                    return null;
                }
            }
        }
        return null;
    }
};

const EpicList = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const { projectId } = useParams();
    const [epics, setEpics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [comments, setComments] = useState({});
    const [newComments, setNewComments] = useState({});
    const [replyingTo, setReplyingTo] = useState({});
    const [expandedComments, setExpandedComments] = useState({});
    const [commentLoading, setCommentLoading] = useState({});
    const [likeLoading, setLikeLoading] = useState({});
    const [currentUser, setCurrentUser] = useState(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');

    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log('Raw token from localStorage:', token);

        if (token) {
            try {
                const decoded = jwtDecode(token);
                console.log('Full decoded token contents:', {
                    ...decoded,
                    exp: decoded.exp ? new Date(decoded.exp * 1000).toLocaleString() : 'No expiration',
                    iat: decoded.iat ? new Date(decoded.iat * 1000).toLocaleString() : 'No issue date'
                });

                // Log all available fields in the token
                console.log('Available fields in token:', Object.keys(decoded));

                // Check specific fields we might be interested in
                console.log('Potential username fields:', {
                    username: decoded.username,
                    name: decoded.name,
                    sub: decoded.sub,
                    email: decoded.email,
                    preferred_username: decoded.preferred_username,
                    given_name: decoded.given_name,
                    nom: decoded.nom
                });

                const username = decoded.UserEmail; // Using UserEmail instead of username
                console.log('Selected username:', username);

                setCurrentUser({
                    username: username,
                    id: decoded.id || decoded.sub,
                    fullToken: decoded
                });
            } catch (error) {
                console.error('Error decoding token:', error);
                console.error('Token that caused error:', token);
            }
        } else {
            console.log('No token found in localStorage');
        }
        loadEpics();
        // Load comments from cookies
        const savedComments = cookieUtils.getCookie('epicComments');
        if (savedComments) {
            // Migrate existing comments to new structure if needed
            const migratedComments = Object.keys(savedComments).reduce((acc, epicId) => {
                acc[epicId] = savedComments[epicId].map(comment => ({
                    id: comment.id || Date.now().toString(),
                    text: comment.text,
                    timestamp: comment.timestamp,
                    likes: comment.likes || 0,
                    likedBy: comment.likedBy || [],
                    replies: (comment.replies || []).map(reply => ({
                        id: reply.id || Date.now().toString(),
                        text: reply.text,
                        timestamp: reply.timestamp,
                        likes: reply.likes || 0,
                        likedBy: reply.likedBy || [],
                        replies: []
                    })),
                    username: comment.username || 'Anonymous'
                }));
                return acc;
            }, {});
            setComments(migratedComments);
            // Update cookies with migrated data
            cookieUtils.setCookie('epicComments', migratedComments);
        }
    }, []);

    const loadEpics = async () => {
        try {
            setLoading(true);
            const response = await epicService.getAll();
            const filteredEpics = projectId 
                ? response.data.filter(epic => epic.project === projectId)
                : response.data;
            setEpics(filteredEpics);
        } catch (err) {
            setError('Failed to load epics. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEpic = () => {
        setOpenAddDialog(true);
    };

    const handleCloseDialog = (refresh = false) => {
        setOpenAddDialog(false);
        if (refresh) {
            loadEpics();
        }
    };

    const getStatusColor = (status) => {
        const normalizedStatus = status?.toLowerCase();
        switch (normalizedStatus) {
            case 'to do':
                return { bg: '#E5E8EC', color: '#42526E' };
            case 'in progress':
                return { bg: '#DEEBFF', color: '#0747A6' };
            case 'done':
                return { bg: '#E3FCEF', color: '#006644' };
            default:
                return { bg: '#F4F5F7', color: '#42526E' };
        }
    };

    const getPriorityColor = (priority) => {
        const normalizedPriority = priority?.toLowerCase();
        switch (normalizedPriority) {
            case 'highest':
                return '#CD1317';
            case 'high':
                return '#DE350B';
            case 'medium':
                return '#FF991F';
            case 'low':
                return '#2D8738';
            case 'lowest':
                return '#00875A';
            default:
                return '#42526E';
        }
    };

    const handleCommentChange = (epicId, value, commentId = null) => {
        if (commentId) {
            setReplyingTo(prev => ({
                ...prev,
                [commentId]: value
            }));
        } else {
            setNewComments(prev => ({
                ...prev,
                [epicId]: value
            }));
        }
    };

    const handleAddComment = async (epicId, parentCommentId = null) => {
        const commentText = parentCommentId ? replyingTo[parentCommentId] : newComments[epicId];
        if (!commentText?.trim() || !currentUser) return;

        setCommentLoading(prev => ({
            ...prev,
            [parentCommentId || epicId]: true
        }));

        const newComment = {
            id: Date.now().toString(),
            text: commentText,
            timestamp: new Date().toISOString(),
            likes: 0,
            likedBy: [],
            replies: [],
            username: currentUser.username, // This will now be the UserEmail
        };

        try {
            const updatedComments = { ...comments };

            if (parentCommentId) {
                const parentComment = findCommentById(updatedComments[epicId], parentCommentId);
                if (parentComment) {
                    parentComment.replies = [...(parentComment.replies || []), newComment];
                }
                setReplyingTo(prev => ({
                    ...prev,
                    [parentCommentId]: ''
                }));
            } else {
                updatedComments[epicId] = [...(updatedComments[epicId] || []), newComment];
                setNewComments(prev => ({
                    ...prev,
                    [epicId]: ''
                }));
            }

            setComments(updatedComments);
            cookieUtils.setCookie('epicComments', updatedComments);
            
            // Simulate network delay for smooth animation
            await new Promise(resolve => setTimeout(resolve, 500));
        } finally {
            setCommentLoading(prev => ({
                ...prev,
                [parentCommentId || epicId]: false
            }));
        }
    };

    const handleLike = async (epicId, commentId) => {
        setLikeLoading(prev => ({
            ...prev,
            [commentId]: true
        }));

        try {
            const updatedComments = { ...comments };
            const comment = findCommentById(updatedComments[epicId], commentId);
            
            if (comment) {
                const userId = 'current-user';
                const likedIndex = (comment.likedBy || []).indexOf(userId);
                
                if (likedIndex === -1) {
                    comment.likedBy.push(userId);
                    comment.likes++;
                } else {
                    comment.likedBy.splice(likedIndex, 1);
                    comment.likes--;
                }
                
                setComments(updatedComments);
                cookieUtils.setCookie('epicComments', updatedComments);
                
                // Simulate network delay for smooth animation
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        } finally {
            setLikeLoading(prev => ({
                ...prev,
                [commentId]: false
            }));
        }
    };

    const findCommentById = (comments = [], commentId) => {
        for (const comment of comments) {
            if (comment.id === commentId) return comment;
            if (comment.replies) {
                const found = findCommentById(comment.replies, commentId);
                if (found) return found;
            }
        }
        return null;
    };

    const toggleReplies = (commentId) => {
        setExpandedComments(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
    };

    const renderComment = (comment, epicId, isReply = false) => (
        <Zoom in={true} style={{ transitionDelay: '100ms' }}>
            <Box 
                key={comment.id} 
                sx={{ 
                    ml: isReply ? 4 : 0, 
                    mb: 2,
                    position: 'relative',
                    '&::before': isReply ? {
                        content: '""',
                        position: 'absolute',
                        left: '-20px',
                        top: '0',
                        bottom: '0',
                        width: '2px',
                        backgroundColor: 'rgba(0, 0, 0, 0.08)',
                        borderRadius: '4px'
                    } : {}
                }}
            >
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: 2,
                        backgroundColor: isReply ? 'rgba(0, 0, 0, 0.02)' : 'white',
                        border: '1px solid',
                        borderColor: 'rgba(0, 0, 0, 0.08)',
                        borderRadius: '12px',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            borderColor: 'rgba(0, 0, 0, 0.15)',
                            backgroundColor: isReply ? 'rgba(0, 0, 0, 0.03)' : 'rgba(0, 0, 0, 0.01)'
                        }
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        {/* Avatar */}
                        <Box
                            sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                backgroundColor: 'primary.light',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '0.875rem',
                                fontWeight: 500
                            }}
                        >
                            {comment.username?.[0]?.toUpperCase() || 'U'}
                        </Box>

                        <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, gap: 1 }}>
                                <Typography 
                                    variant="subtitle2" 
                                    sx={{ 
                                        fontWeight: 600,
                                        color: 'text.primary'
                                    }}
                                >
                                    {comment.username || 'Anonymous'}
                                </Typography>
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        color: 'text.secondary',
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    {new Date(comment.timestamp).toLocaleString()}
                                </Typography>
                            </Box>

                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    color: 'text.primary',
                                    lineHeight: 1.5,
                                    mb: 1
                                }}
                            >
                                {comment.text}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Button
                                    size="small"
                                    startIcon={
                                        likeLoading[comment.id] ? (
                                            <CircularProgress size={16} />
                                        ) : comment.likedBy?.includes('current-user') ? (
                                            <FavoriteIcon fontSize="small" color="error" />
                                        ) : (
                                            <FavoriteBorderIcon fontSize="small" />
                                        )
                                    }
                                    onClick={() => !likeLoading[comment.id] && handleLike(epicId, comment.id)}
                                    disabled={likeLoading[comment.id]}
                                    sx={{ 
                                        color: comment.likedBy?.includes('current-user') ? 'error.main' : 'text.secondary',
                                        textTransform: 'none',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                        }
                                    }}
                                >
                                    {comment.likes || 0} {comment.likes === 1 ? 'Like' : 'Likes'}
                                </Button>

                                <Button
                                    size="small"
                                    startIcon={<ReplyIcon fontSize="small" />}
                                    onClick={() => toggleReplies(comment.id)}
                                    sx={{ 
                                        color: 'text.secondary',
                                        textTransform: 'none',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                        }
                                    }}
                                >
                                    Reply
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                    
                    <Collapse in={expandedComments[comment.id]}>
                        <Box sx={{ mt: 2, ml: 5 }}>
                            {(comment.replies || []).map(reply => renderComment(reply, epicId, true))}
                            <Paper
                                elevation={0}
                                sx={{ 
                                    mt: 2,
                                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                    borderRadius: '8px'
                                }}
                            >
                                <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
                                    <Box
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            backgroundColor: 'primary.light',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '0.875rem',
                                            fontWeight: 500
                                        }}
                                    >
                                        U
                                    </Box>
                                    <TextField
                                        size="small"
                                        placeholder="Write a reply..."
                                        value={replyingTo[comment.id] || ''}
                                        onChange={(e) => handleCommentChange(epicId, e.target.value, comment.id)}
                                        fullWidth
                                        multiline
                                        maxRows={4}
                                        disabled={commentLoading[comment.id]}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: 'white'
                                            }
                                        }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Tooltip title="Add emoji">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {/* TODO: Implement emoji picker */}}
                                                            disabled={commentLoading[comment.id]}
                                                        >
                                                            <EmojiIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleAddComment(epicId, comment.id)}
                                                        disabled={!replyingTo[comment.id]?.trim() || commentLoading[comment.id]}
                                                        color="primary"
                                                    >
                                                        {commentLoading[comment.id] ? (
                                                            <CircularProgress size={16} />
                                                        ) : (
                                                            <SendIcon fontSize="small" />
                                                        )}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Box>
                            </Paper>
                        </Box>
                    </Collapse>
                    
                    {!isReply && (comment.replies || []).length > 0 && !expandedComments[comment.id] && (
                        <Button
                            size="small"
                            startIcon={<ExpandMoreIcon />}
                            onClick={() => toggleReplies(comment.id)}
                            sx={{ 
                                ml: 7,
                                mt: 1,
                                color: 'text.secondary',
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                }
                            }}
                        >
                            Show {(comment.replies || []).length} {(comment.replies || []).length === 1 ? 'reply' : 'replies'}
                        </Button>
                    )}
                </Paper>
            </Box>
        </Zoom>
    );

    const filteredEpics = epics.filter(epic => {
        const matchesSearch = epic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            epic.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            epic.key.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || epic.status.toLowerCase() === statusFilter;
        const matchesPriority = priorityFilter === 'all' || epic.priority.toLowerCase() === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="h5" component="h1" sx={{ mb: 1 }}>
                            Epics
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenAddDialog(true)}
                            sx={{ width: { xs: '100%', sm: 'auto' } }}
                        >
                            Add Epic
                        </Button>
                    </Grid>
                </Grid>

                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search epics..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Filter by Status</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Filter by Status"
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="all">All Statuses</MenuItem>
                                <MenuItem value="todo">To Do</MenuItem>
                                <MenuItem value="inProgress">In Progress</MenuItem>
                                <MenuItem value="done">Done</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Filter by Priority</InputLabel>
                            <Select
                                value={priorityFilter}
                                label="Filter by Priority"
                                onChange={(e) => setPriorityFilter(e.target.value)}
                            >
                                <MenuItem value="all">All Priorities</MenuItem>
                                <MenuItem value="lowest">Lowest</MenuItem>
                                <MenuItem value="low">Low</MenuItem>
                                <MenuItem value="medium">Medium</MenuItem>
                                <MenuItem value="high">High</MenuItem>
                                <MenuItem value="highest">Highest</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
            ) : (
                <Grid container spacing={2}>
                    {filteredEpics.map((epic) => (
                        <Grid item xs={12} key={epic._id}>
                            <Card 
                                sx={{ 
                                    mb: 2,
                                    '&:hover': {
                                        boxShadow: (theme) => theme.shadows[4],
                                        transform: 'translateY(-2px)',
                                        transition: 'all 0.2s ease-in-out'
                                    }
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={8}>
                                            <Typography 
                                                variant="h6" 
                                                component="h2" 
                                                sx={{ 
                                                    mb: 1,
                                                    fontWeight: 600
                                                }}
                                            >
                                                {epic.name}
                                            </Typography>
                                            <Typography 
                                                color="text.secondary" 
                                                sx={{ 
                                                    mb: 2,
                                                    lineHeight: 1.6
                                                }}
                                            >
                                                {epic.description}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={4} sx={{ 
                                            display: 'flex', 
                                            flexDirection: { xs: 'row', sm: 'column' },
                                            justifyContent: { xs: 'flex-start', sm: 'flex-start' },
                                            gap: 1.5
                                        }}>
                                            <Chip
                                                label={epic.status}
                                                size={isMobile ? "small" : "medium"}
                                                sx={{ 
                                                    minWidth: 100,
                                                    height: 32,
                                                    bgcolor: getStatusColor(epic.status).bg,
                                                    color: getStatusColor(epic.status).color,
                                                    fontWeight: 500,
                                                    fontSize: '0.875rem'
                                                }}
                                            />
                                            <Chip
                                                label={epic.priority}
                                                size={isMobile ? "small" : "medium"}
                                                sx={{ 
                                                    minWidth: 100,
                                                    height: 32,
                                                    bgcolor: 'white',
                                                    color: getPriorityColor(epic.priority),
                                                    borderColor: getPriorityColor(epic.priority),
                                                    border: 1,
                                                    fontWeight: 500,
                                                    fontSize: '0.875rem'
                                                }}
                                            />
                                        </Grid>
                                    </Grid>

                                    <Box sx={{ mt: 2 }}>
                                        <Stack 
                                            direction={{ xs: 'column', sm: 'row' }}
                                            spacing={2}
                                            sx={{ mt: 2 }}
                                        >
                                            <Button
                                                variant="outlined"
                                                size={isMobile ? "small" : "medium"}
                                                startIcon={<EditIcon />}
                                                onClick={() => {/* TODO: Implement edit */}}
                                                sx={{ flex: { xs: '1', sm: '0 auto' } }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                size={isMobile ? "small" : "medium"}
                                                startIcon={<DeleteIcon />}
                                                color="error"
                                                onClick={() => {/* TODO: Implement delete */}}
                                                sx={{ flex: { xs: '1', sm: '0 auto' } }}
                                            >
                                                Delete
                                            </Button>
                                        </Stack>
                                    </Box>

                                    {/* Comments section */}
                                    <Box sx={{ mt: 3 }}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Comments
                                        </Typography>
                                        <Box sx={{ pl: { xs: 0, sm: 2 } }}>
                                            {(comments[epic._id] || []).map((comment) => renderComment(comment, epic._id))}
                                        </Box>
                                        <Box sx={{ mt: 2 }}>
                                            <TextField
                                                size={isMobile ? "small" : "medium"}
                                                placeholder="Write a comment..."
                                                value={newComments[epic._id] || ''}
                                                onChange={(e) => handleCommentChange(epic._id, e.target.value)}
                                                fullWidth
                                                multiline
                                                maxRows={4}
                                                disabled={commentLoading[epic._id]}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        backgroundColor: 'white'
                                                    }
                                                }}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <Stack direction="row" spacing={1}>
                                                                <Tooltip title="Add emoji">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => {/* TODO: Implement emoji picker */}}
                                                                        disabled={commentLoading[epic._id]}
                                                                    >
                                                                        <EmojiIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleAddComment(epic._id)}
                                                                    disabled={!newComments[epic._id]?.trim() || commentLoading[epic._id]}
                                                                    color="primary"
                                                                >
                                                                    {commentLoading[epic._id] ? (
                                                                        <CircularProgress size={16} />
                                                                    ) : (
                                                                        <SendIcon fontSize="small" />
                                                                    )}
                                                                </IconButton>
                                                            </Stack>
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <AddEpic
                open={openAddDialog}
                onClose={() => setOpenAddDialog(false)}
                projectId={projectId}
            />
        </Box>
    );
};

export default EpicList;