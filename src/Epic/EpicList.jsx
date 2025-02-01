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
    const [editingEpic, setEditingEpic] = useState(null);
    const [allIssues, setAllIssues] = useState([]); // Stocker toutes les issues
    const [expandedEpics, setExpandedEpics] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');

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

    // Fonction pour filtrer les epics selon le rôle et les issues stockées
    const filterEpicsByRole = (epicsData) => {
        const userRole = localStorage.getItem('role');
        
        if (userRole === 'manager') {
            return epicsData;
        }

        // Pour les développeurs, utiliser les issues stockées
        const storedIssues = localStorage.getItem('filteredIssues');
        if (!storedIssues) {
            return [];
        }

        const { issues } = JSON.parse(storedIssues);
        const userIssueEpicIds = new Set(issues.map(issue => issue.epic).filter(Boolean));

        return epicsData.filter(epic => userIssueEpicIds.has(epic._id));
    };

    useEffect(() => {
        const fetchEpics = async () => {
            try {
                setLoading(true);
                const response = await epicService.getAll();
                const filteredEpics = filterEpicsByRole(response.data);
                setEpics(filteredEpics);
            } catch (err) {
                console.error('Error fetching epics:', err);
                setError('Failed to load epics');
            } finally {
                setLoading(false);
            }
        };

        fetchEpics();
    }, []);

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
                setCurrentUser(decoded);
            } catch (err) {
                console.error('Error decoding token:', err);
            }
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

    const handleEdit = (epic) => {
        setEditingEpic(epic);
        setOpenAddDialog(true);
    };

    const handleDelete = async (epicId) => {
        if (window.confirm('Are you sure you want to delete this epic?')) {
            try {
                await epicService.remove(epicId);
                loadEpics(); // Recharger la liste après la suppression
            } catch (err) {
                setError('Failed to delete epic. Please try again later.');
                console.error(err);
            }
        }
    };

    const handleCloseDialog = (refresh = false) => {
        setOpenAddDialog(false);
        setEditingEpic(null);
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

    // Fonction de rendu des commentaires
    const renderComment = (comment, epicId) => (
        <Zoom in={true} key={comment.id}>
            <Box sx={{ mb: 2 }}>
                <Paper 
                    elevation={0}
                    sx={{ 
                        p: 2,
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        position: 'relative'
                    }}
                >
                    {/* Contenu du commentaire */}
                    <Typography variant="body2">
                        {comment.text}
                    </Typography>
                    
                    {/* Actions du commentaire */}
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <Button
                            size="small"
                            onClick={() => handleLikeComment(epicId, comment.id)}
                            disabled={likeLoading[`${epicId}-${comment.id}`]}
                            startIcon={
                                comment.likedBy?.includes(currentUser?.id) ? 
                                <FavoriteIcon color="error" /> : 
                                <FavoriteBorderIcon />
                            }
                        >
                            {comment.likes || 0} Likes
                        </Button>
                        
                        <Button
                            size="small"
                            onClick={() => handleReplyClick(epicId, comment.id)}
                            startIcon={<ReplyIcon />}
                        >
                            Reply
                        </Button>
                        
                        {comment.replies?.length > 0 && (
                            <Button
                                size="small"
                                onClick={() => toggleCommentExpansion(epicId, comment.id)}
                                endIcon={expandedComments[`${epicId}-${comment.id}`] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            >
                                Show {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                            </Button>
                        )}
                    </Box>
                </Paper>
            </Box>
        </Zoom>
    );

    // Filtrer les epics selon la recherche et les filtres
    const filteredEpics = epics.filter(epic => {
        const matchesSearch = epic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            epic.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || epic.status.toLowerCase() === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <Box sx={{ p: 3 }}>
            {/* En-tête avec titre et bouton d'ajout */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3,
                backgroundColor: 'background.paper',
                p: 2,
                borderRadius: 1,
                boxShadow: 1
            }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Epics
                </Typography>
                {localStorage.getItem('role') === 'manager' && (
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenAddDialog(true)}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 'bold'
                        }}
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
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
            ) : filteredEpics.length === 0 ? (
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

                                {/* Actions */}
                                {localStorage.getItem('role') === 'manager' && (
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

            {/* Dialog pour ajouter/éditer un Epic */}
            {openAddDialog && (
                <AddEpic
                    open={openAddDialog}
                    onClose={() => setOpenAddDialog(false)}
                    onAdd={(newEpic) => {
                        setEpics([...epics, newEpic]);
                        setOpenAddDialog(false);
                    }}
                />
            )}
        </Box>
    );
};

export default EpicList;