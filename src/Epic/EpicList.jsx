import React, { useState, useEffect, useMemo } from 'react';
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
    InsertEmoticon as EmojiIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    KeyboardArrowRight as KeyboardArrowRightIcon
} from '@mui/icons-material';
import epicService from '../service/EpicService';
import issueService from '../service/IssueService';
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [epics, setEpics] = useState([]);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [editingEpic, setEditingEpic] = useState(null);
    const [expandedEpics, setExpandedEpics] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [comments, setComments] = useState({});
    const [newComments, setNewComments] = useState({});
    const [replyingTo, setReplyingTo] = useState({});
    const [expandedComments, setExpandedComments] = useState({});
    const [commentLoading, setCommentLoading] = useState({});
    const [likeLoading, setLikeLoading] = useState({});
    const [allIssues, setAllIssues] = useState([]); // Stocker toutes les issues

    // Get current user from localStorage
    const currentUser = {
        id: localStorage.getItem('userId'),
        role: localStorage.getItem('role')
    };

    // Fonction pour basculer l'expansion d'un epic
    const toggleEpicExpansion = (epicId) => {
        setExpandedEpics(prev => ({
            ...prev,
            [epicId]: !prev[epicId]
        }));
    };

    // Charger toutes les issues une seule fois
    const loadAllIssues = async () => {
        try {
            const response = await issueService.getAll();
            console.log('All issues loaded:', response.data);
            setAllIssues(response.data);
        } catch (err) {
            console.error('Failed to load issues:', err);
            setError('Failed to load issues');
        }
    };

    // Fetch epics
    useEffect(() => {
        const fetchEpics = async () => {
            try {
                setLoading(true);
                setError('');
                console.log('Fetching all epics...');
                const response = await epicService.getAll();
                console.log('All epics:', response.data);
                
                // Filter epics by project
                let filteredEpics = response.data.filter(epic => epic.project === projectId);
                console.log('Project epics:', filteredEpics);

                // Filter for developers based on their issues
                const userRole = localStorage.getItem('role');
                if (userRole !== 'manager') {
                    const storedIssues = localStorage.getItem('filteredIssues');
                    if (storedIssues) {
                        const { issues } = JSON.parse(storedIssues);
                        const userIssueEpicIds = new Set(issues.map(issue => issue.epic).filter(Boolean));
                        filteredEpics = filteredEpics.filter(epic => userIssueEpicIds.has(epic._id));
                    } else {
                        filteredEpics = [];
                    }
                }

                console.log('Final filtered epics:', filteredEpics);
                setEpics(filteredEpics);
            } catch (err) {
                console.error('Error fetching epics:', err);
                setError('Failed to load epics');
            } finally {
                setLoading(false);
            }
        };

        fetchEpics();
    }, [projectId, refreshTrigger]);

    // Handle epic dialog close
    const handleEpicDialogClose = (success) => {
        setOpenAddDialog(false);
        setEditingEpic(null);
        if (success) {
            setRefreshTrigger(prev => prev + 1);
        }
    };

    // Handle epic deletion
    const handleDelete = async (epicId) => {
        if (!window.confirm('Are you sure you want to delete this epic?')) {
            return;
        }

        try {
            setLoading(true);
            await epicService.remove(epicId);
            setRefreshTrigger(prev => prev + 1);
            setError('Epic deleted successfully');
        } catch (err) {
            console.error('Error deleting epic:', err);
            setError('Failed to delete epic');
        } finally {
            setLoading(false);
        }
    };

    // Obtenir les issues pour un epic à partir du localStorage
    const getIssuesForEpic = (epicId) => {
        const storedIssues = localStorage.getItem('filteredIssues');
        if (!storedIssues) {
            return [];
        }

        const { issues } = JSON.parse(storedIssues);
        return issues.filter(issue => issue.epic === epicId);
    };

    useEffect(() => {
        loadAllIssues();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // setCurrentUser(decoded);
            } catch (err) {
                console.error('Error decoding token:', err);
            }
        }

        // Charger les commentaires depuis les cookies
        const savedComments = cookieUtils.getCookie('epicComments');
        if (savedComments) {
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
            cookieUtils.setCookie('epicComments', migratedComments);
        }
    }, []);

    // Fonctions pour la gestion des commentaires
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
            username: currentUser.id
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
                const userId = currentUser?.id || 'anonymous';
                const likedIndex = (comment.likedBy || []).indexOf(userId);
                
                if (likedIndex === -1) {
                    comment.likedBy = [...(comment.likedBy || []), userId];
                    comment.likes = (comment.likes || 0) + 1;
                } else {
                    comment.likedBy.splice(likedIndex, 1);
                    comment.likes = Math.max(0, (comment.likes || 1) - 1);
                }
                
                setComments(updatedComments);
                cookieUtils.setCookie('epicComments', updatedComments);
                
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

    // Ajout du rendu des commentaires dans la section des commentaires de chaque epic
    const renderCommentSection = (epic) => (
        <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
                Comments
            </Typography>
            <Box>
                {(comments[epic._id] || []).map(comment => (
                    <Box key={comment.id} sx={{ mb: 2 }}>
                        <Paper sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2">{comment.username}</Typography>
                                <Typography variant="caption" sx={{ ml: 1 }}>
                                    {new Date(comment.timestamp).toLocaleString()}
                                </Typography>
                            </Box>
                            <Typography>{comment.text}</Typography>
                            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                <Button
                                    size="small"
                                    startIcon={comment.likedBy?.includes(currentUser?.id) ? 
                                        <FavoriteIcon color="error" /> : 
                                        <FavoriteBorderIcon />
                                    }
                                    onClick={() => handleLike(epic._id, comment.id)}
                                >
                                    {comment.likes || 0} Likes
                                </Button>
                                <Button
                                    size="small"
                                    startIcon={<ReplyIcon />}
                                    onClick={() => toggleReplies(comment.id)}
                                >
                                    Reply
                                </Button>
                            </Box>
                            
                            <Collapse in={expandedComments[comment.id]}>
                                <Box sx={{ ml: 3, mt: 2 }}>
                                    {comment.replies?.map(reply => (
                                        <Paper key={reply.id} sx={{ p: 2, mb: 1, bgcolor: 'grey.50' }}>
                                            <Typography variant="subtitle2">{reply.username}</Typography>
                                            <Typography>{reply.text}</Typography>
                                        </Paper>
                                    ))}
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Write a reply..."
                                        value={replyingTo[comment.id] || ''}
                                        onChange={(e) => handleCommentChange(epic._id, e.target.value, comment.id)}
                                        sx={{ mt: 1 }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleAddComment(epic._id, comment.id)}
                                                        disabled={!replyingTo[comment.id]?.trim()}
                                                    >
                                                        <SendIcon />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Box>
                            </Collapse>
                        </Paper>
                    </Box>
                ))}
                
                <TextField
                    fullWidth
                    placeholder="Write a comment..."
                    value={newComments[epic._id] || ''}
                    onChange={(e) => handleCommentChange(epic._id, e.target.value)}
                    sx={{ mt: 2 }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => handleAddComment(epic._id)}
                                    disabled={!newComments[epic._id]?.trim()}
                                >
                                    <SendIcon />
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />
            </Box>
        </Box>
    );

    // Filter epics based on search and filters
    const filteredEpics = useMemo(() => {
        return epics.filter(epic => {
            const matchesSearch = epic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                epic.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || epic.status === statusFilter;
            const matchesPriority = priorityFilter === 'all' || epic.priority === priorityFilter;
            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [epics, searchTerm, statusFilter, priorityFilter]);

    // Handle epic editing
    const handleEdit = (epic) => {
        setEditingEpic(epic);
        setOpenAddDialog(true);
    };

    return (
        <Box sx={{ p: 3 }}>
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {!loading && !error && (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5">Epics</Typography>
                        {currentUser.role === 'manager' && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setOpenAddDialog(true)}
                            >
                                Create New Epic
                            </Button>
                        )}
                    </Box>

                    {/* Barre de filtres */}
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Search Epics"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        label="Status"
                                    >
                                        <MenuItem value="all">All Statuses</MenuItem>
                                        <MenuItem value="todo">To Do</MenuItem>
                                        <MenuItem value="inProgress">In Progress</MenuItem>
                                        <MenuItem value="done">Done</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Priority</InputLabel>
                                    <Select
                                        value={priorityFilter}
                                        onChange={(e) => setPriorityFilter(e.target.value)}
                                        label="Priority"
                                    >
                                        <MenuItem value="all">All Priorities</MenuItem>
                                        <MenuItem value="high">High</MenuItem>
                                        <MenuItem value="medium">Medium</MenuItem>
                                        <MenuItem value="low">Low</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Liste des Epics */}
                    {filteredEpics.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'grey.50' }}>
                            <Typography variant="h6" color="textSecondary" gutterBottom>
                                No Epics Found
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {searchTerm ? 'Try adjusting your search or filters' : 'Start by creating a new epic'}
                            </Typography>
                        </Paper>
                    ) : (
                        <Grid container spacing={2}>
                            {filteredEpics.map((epic) => (
                                <Grid item xs={12} key={epic._id}>
                                    <Card 
                                        sx={{ 
                                            p: 2,
                                            transition: 'all 0.3s',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: 3
                                            }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Box>
                                                <Typography variant="h6" gutterBottom>
                                                    {epic.name}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" paragraph>
                                                    {epic.description}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Chip 
                                                    label={epic.status}
                                                    color={
                                                        epic.status === 'done' ? 'success' :
                                                        epic.status === 'inProgress' ? 'warning' : 'default'
                                                    }
                                                    size="small"
                                                />
                                                <Chip 
                                                    label={epic.priority}
                                                    color={
                                                        epic.priority === 'high' ? 'error' :
                                                        epic.priority === 'medium' ? 'warning' : 'info'
                                                    }
                                                    size="small"
                                                />
                                            </Box>
                                        </Box>

                                        {/* Issues associées */}
                                        {getIssuesForEpic(epic._id).length > 0 && (
                                            <Box>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    Associated Issues ({getIssuesForEpic(epic._id).length})
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                    {getIssuesForEpic(epic._id).map(issue => (
                                                        <Chip
                                                            key={issue._id}
                                                            label={issue.title}
                                                            size="small"
                                                            sx={{ mb: 1 }}
                                                        />
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}

                                        {/* Commentaires */}
                                        {renderCommentSection(epic)}

                                        {/* Actions */}
                                        {currentUser.role === 'manager' && (
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                                                <Button
                                                    size="small"
                                                    startIcon={<EditIcon />}
                                                    onClick={() => handleEdit(epic)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="small"
                                                    startIcon={<DeleteIcon />}
                                                    color="error"
                                                    onClick={() => handleDelete(epic._id)}
                                                >
                                                    Delete
                                                </Button>
                                            </Box>
                                        )}
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </>
            )}

            {/* Dialog pour ajouter/éditer un Epic */}
            {openAddDialog && (
                <AddEpic
                    open={openAddDialog}
                    onClose={handleEpicDialogClose}
                    projectId={projectId}
                    userId={currentUser?.id}
                />
            )}
        </Box>
    );
};

export default EpicList;