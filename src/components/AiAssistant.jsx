import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Paper,
    TextField,
    IconButton,
    Typography,
    CircularProgress,
    Fab,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Divider,
    Button,
    Menu,
    MenuItem,
} from '@mui/material';
import {
    Send,
    SmartToy,
    Close,
    ExpandLess,
    MoreVert,
    AutoAwesome,
    Timeline,
    Assignment,
    Psychology,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import aiService from '../service/AiService';

const StyledFab = styled(Fab)(({ theme }) => ({
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
    },
}));

const MessageBubble = styled(Paper)(({ theme, isai }) => ({
    padding: theme.spacing(1.5),
    maxWidth: '80%',
    marginBottom: theme.spacing(1),
    backgroundColor: isai ? theme.palette.primary.main : theme.palette.background.paper,
    color: isai ? theme.palette.primary.contrastText : theme.palette.text.primary,
    alignSelf: isai ? 'flex-start' : 'flex-end',
    borderRadius: 16,
    boxShadow: theme.shadows[1],
}));

const AiAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { text: userMessage, isAi: false }]);
        setIsLoading(true);

        try {
            const response = await aiService.generateAiResponse(userMessage);
            setMessages(prev => [...prev, { text: response, isAi: true }]);
        } catch (error) {
            setMessages(prev => [...prev, { 
                text: "I apologize, but I encountered an error. Please try again.", 
                isAi: true 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleQuickAction = async (action) => {
        handleMenuClose();
        setIsLoading(true);
        let response;

        try {
            switch (action) {
                case 'analyze':
                    response = await aiService.analyzeProject({
                        name: "Current Project",
                        description: "Project description...",
                        status: "In Progress",
                        startDate: "2024-01-01",
                        endDate: "2024-12-31"
                    });
                    break;
                case 'suggest':
                    response = await aiService.suggestImprovements({
                        name: "Current Project",
                        description: "Project description...",
                        status: "In Progress",
                        challenges: "Meeting deadlines, resource allocation"
                    });
                    break;
                case 'template':
                    response = await aiService.generateProjectTemplate({
                        industry: "Software Development",
                        type: "Web Application",
                        teamSize: "5-10",
                        duration: "6 months"
                    });
                    break;
                case 'timeline':
                    response = await aiService.estimateProjectTimeline({
                        description: "Project description...",
                        teamSize: "5",
                        requirements: "Key project requirements..."
                    });
                    break;
                default:
                    break;
            }

            if (response) {
                setMessages(prev => [...prev, { text: response, isAi: true }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { 
                text: "I apologize, but I encountered an error with this action. Please try again.", 
                isAi: true 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <StyledFab
                color="primary"
                onClick={() => setIsOpen(true)}
                aria-label="AI Assistant"
            >
                <SmartToy />
            </StyledFab>

            <Drawer
                anchor="right"
                open={isOpen}
                onClose={() => setIsOpen(false)}
                PaperProps={{
                    sx: { width: { xs: '100%', sm: 400 } },
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Header */}
                    <Box sx={{ 
                        p: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        borderBottom: 1,
                        borderColor: 'divider'
                    }}>
                        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                            <SmartToy sx={{ mr: 1 }} /> AI Assistant
                        </Typography>
                        <Box>
                            <IconButton onClick={handleMenuClick}>
                                <MoreVert />
                            </IconButton>
                            <IconButton onClick={() => setIsOpen(false)}>
                                <Close />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Messages */}
                    <Box sx={{ 
                        flexGrow: 1, 
                        p: 2, 
                        overflow: 'auto',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {messages.map((message, index) => (
                            <MessageBubble key={index} isai={message.isAi ? 1 : 0}>
                                <Typography variant="body1">{message.text}</Typography>
                            </MessageBubble>
                        ))}
                        {isLoading && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                <CircularProgress size={24} />
                            </Box>
                        )}
                        <div ref={messagesEndRef} />
                    </Box>

                    {/* Input */}
                    <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Ask me anything about your project..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            multiline
                            maxRows={4}
                            InputProps={{
                                endAdornment: (
                                    <IconButton 
                                        onClick={handleSend}
                                        disabled={isLoading || !input.trim()}
                                    >
                                        <Send />
                                    </IconButton>
                                ),
                            }}
                        />
                    </Box>
                </Box>
            </Drawer>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => handleQuickAction('analyze')}>
                    <Psychology sx={{ mr: 1 }} /> Analyze Project
                </MenuItem>
                <MenuItem onClick={() => handleQuickAction('suggest')}>
                    <AutoAwesome sx={{ mr: 1 }} /> Suggest Improvements
                </MenuItem>
                <MenuItem onClick={() => handleQuickAction('template')}>
                    <Assignment sx={{ mr: 1 }} /> Generate Template
                </MenuItem>
                <MenuItem onClick={() => handleQuickAction('timeline')}>
                    <Timeline sx={{ mr: 1 }} /> Estimate Timeline
                </MenuItem>
            </Menu>
        </>
    );
};

export default AiAssistant;
