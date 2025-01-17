import { createTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// Color palette
const colors = {
    primary: {
        main: '#6366F1',
        light: '#818CF8',
        dark: '#4F46E5',
        contrastText: '#fff'
    },
    secondary: {
        main: '#3B82F6',
        light: '#60A5FA',
        dark: '#2563EB',
        contrastText: '#fff'
    },
    success: {
        main: '#10B981',
        light: '#34D399',
        dark: '#059669',
        contrastText: '#fff'
    },
    warning: {
        main: '#F59E0B',
        light: '#FBBF24',
        dark: '#D97706',
        contrastText: '#fff'
    },
    error: {
        main: '#EF4444',
        light: '#F87171',
        dark: '#DC2626',
        contrastText: '#fff'
    },
    background: {
        default: '#F9FAFB',
        paper: '#FFFFFF',
        dark: '#111827'
    },
    text: {
        primary: '#111827',
        secondary: '#4B5563',
        disabled: '#9CA3AF'
    }
};

// Common styles
export const commonStyles = (theme) => ({
    gradientText: {
        background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    card: {
        background: theme.palette.mode === 'dark' 
            ? alpha(theme.palette.background.paper, 0.8)
            : alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(12px)',
        borderRadius: theme.shape.borderRadius * 2,
        boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.4)'
            : '0 8px 32px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
            boxShadow: theme.palette.mode === 'dark'
                ? '0 12px 48px rgba(0, 0, 0, 0.6)'
                : '0 12px 48px rgba(0, 0, 0, 0.12)'
        }
    },
    button: {
        primary: {
            background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
            color: colors.primary.contrastText,
            textTransform: 'none',
            borderRadius: theme.shape.borderRadius * 1.5,
            padding: '8px 24px',
            fontWeight: 500,
            boxShadow: theme.palette.mode === 'dark'
                ? '0 4px 12px rgba(0, 0, 0, 0.4)'
                : '0 4px 12px rgba(0, 0, 0, 0.1)',
            '&:hover': {
                background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
                transform: 'translateY(-1px)',
                boxShadow: theme.palette.mode === 'dark'
                    ? '0 6px 16px rgba(0, 0, 0, 0.6)'
                    : '0 6px 16px rgba(0, 0, 0, 0.15)'
            }
        },
        secondary: {
            background: `linear-gradient(135deg, ${colors.secondary.main} 0%, ${colors.secondary.dark} 100%)`,
            color: colors.secondary.contrastText,
            textTransform: 'none',
            borderRadius: theme.shape.borderRadius * 1.5,
            padding: '8px 24px',
            fontWeight: 500,
            boxShadow: theme.palette.mode === 'dark'
                ? '0 4px 12px rgba(0, 0, 0, 0.4)'
                : '0 4px 12px rgba(0, 0, 0, 0.1)',
            '&:hover': {
                background: `linear-gradient(135deg, ${colors.secondary.main} 0%, ${colors.secondary.dark} 100%)`,
                transform: 'translateY(-1px)',
                boxShadow: theme.palette.mode === 'dark'
                    ? '0 6px 16px rgba(0, 0, 0, 0.6)'
                    : '0 6px 16px rgba(0, 0, 0, 0.15)'
            }
        }
    },
    dialog: {
        paper: {
            background: theme.palette.mode === 'dark' 
                ? alpha(theme.palette.background.paper, 0.9)
                : alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(12px)',
            borderRadius: theme.shape.borderRadius * 2,
        }
    },
    iconButton: {
        color: theme.palette.primary.main,
        '&:hover': {
            background: alpha(theme.palette.primary.main, 0.1)
        }
    }
});

// Create theme
const theme = createTheme({
    palette: {
        mode: 'light',
        ...colors,
    },
    shape: {
        borderRadius: 8,
    },
    typography: {
        fontFamily: "'Inter', sans-serif",
        h1: {
            fontWeight: 700,
        },
        h2: {
            fontWeight: 700,
        },
        h3: {
            fontWeight: 700,
        },
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
        subtitle1: {
            fontWeight: 500,
        },
        subtitle2: {
            fontWeight: 500,
        },
        button: {
            fontWeight: 500,
            textTransform: 'none',
        }
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                    fontWeight: 500,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 16,
                },
            },
        },
    },
});

export default theme;
