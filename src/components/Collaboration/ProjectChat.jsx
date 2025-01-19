import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Paper,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Typography,
    Divider,
    IconButton,
} from '@mui/material';
import { Send, AttachFile } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import io from 'socket.io-client';

const ProjectChat = ({ projectId, currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Initialize WebSocket connection
        const newSocket = io('http://localhost:3000', {
            query: { projectId }
        });

        setSocket(newSocket);

        // Load existing messages
        fetchMessages();

        // Listen for new messages
        newSocket.on('new-message', (message) => {
            setMessages(prev => [...prev, message]);
        });

        return () => newSocket.disconnect();
    }, [projectId]);

    const fetchMessages = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}/messages`);
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageData = {
            content: newMessage,
            projectId,
            userId: currentUser.id,
            timestamp: new Date().toISOString(),
        };

        try {
            // Send to backend
            await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messageData),
            });

            // Emit through WebSocket
            socket.emit('send-message', messageData);

            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <Paper sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
                <Typography variant="h6">Project Chat</Typography>
            </Box>
            
            <List sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                {messages.map((message, index) => (
                    <React.Fragment key={message.id}>
                        <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                                <Avatar alt={message.user.name} src={message.user.avatar} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Typography
                                        component="span"
                                        variant="body1"
                                        color="text.primary"
                                    >
                                        {message.user.name}
                                    </Typography>
                                }
                                secondary={
                                    <>
                                        <Typography
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            {message.content}
                                        </Typography>
                                        {' — '}
                                        {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                                    </>
                                }
                            />
                        </ListItem>
                        {index < messages.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                ))}
                <div ref={messagesEndRef} />
            </List>

            <Box
                component="form"
                onSubmit={handleSendMessage}
                sx={{
                    p: 2,
                    backgroundColor: 'background.paper',
                    borderTop: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    gap: 1,
                }}
            >
                <IconButton size="small">
                    <AttachFile />
                </IconButton>
                <TextField
                    fullWidth
                    size="small"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    variant="outlined"
                />
                <Button
                    variant="contained"
                    endIcon={<Send />}
                    type="submit"
                >
                    Send
                </Button>
            </Box>
        </Paper>
    );
};

export default ProjectChat;
