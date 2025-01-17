import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { commonStyles } from '../theme';

const PageLayout = ({ title, actions, children }) => {
    const theme = useTheme();
    const styles = commonStyles(theme);

    return (
        <Box sx={{ p: 3 }}>
            <Box 
                sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 4
                }}
            >
                <Typography 
                    variant="h4" 
                    sx={{ 
                        fontWeight: 700,
                        ...styles.gradientText
                    }}
                >
                    {title}
                </Typography>
                {actions}
            </Box>

            <Paper 
                elevation={0} 
                sx={{ 
                    p: 3,
                    ...styles.card
                }}
            >
                {children}
            </Paper>
        </Box>
    );
};

export default PageLayout;
