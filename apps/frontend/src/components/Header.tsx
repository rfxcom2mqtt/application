import React, { useState, useCallback, memo } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SensorsIcon from '@mui/icons-material/Sensors';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';

/**
 * Navigation items configuration
 */
const navigationItems = [
    { name: 'Informations', path: '/' },
    { name: 'Devices', path: '/devices' },
    { name: 'Settings', path: '/settings' },
    { name: 'Journals', path: '/logs' },
];

/**
 * Logo component for the header
 */
const Logo = memo(() => (
    <>
        <SensorsIcon sx={{ mr: 1 }} />
        <Typography
            variant="h6"
            noWrap
            component={NavLink}
            to="/"
            sx={{
                mr: 2,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.2rem',
                color: 'inherit',
                textDecoration: 'none',
            }}
        >
            Rfxcom2Mqtt
        </Typography>
    </>
));

Logo.displayName = 'Logo';

/**
 * Props for the MobileNavMenu component
 */
interface MobileNavMenuProps {
    anchorEl: HTMLElement | null;
    open: boolean;
    onClose: () => void;
    onNavigate: (path: string) => void;
}

/**
 * Mobile navigation menu component
 */
const MobileNavMenu = memo<MobileNavMenuProps>(({ anchorEl, open, onClose, onNavigate }) => (
    <Menu
        id="mobile-nav-menu"
        anchorEl={anchorEl}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
        }}
        keepMounted
        transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
        }}
        open={open}
        onClose={onClose}
        sx={{
            display: { xs: 'block', md: 'none' },
        }}
    >
        {navigationItems.map((item) => (
            <MenuItem 
                key={item.name} 
                onClick={() => onNavigate(item.path)}
                component={NavLink}
                to={item.path}
                sx={{
                    '&.active': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    },
                }}
            >
                <Typography textAlign="center">{item.name}</Typography>
            </MenuItem>
        ))}
    </Menu>
));

MobileNavMenu.displayName = 'MobileNavMenu';

/**
 * Props for the DesktopNavMenu component
 */
interface DesktopNavMenuProps {
    onNavigate: (path: string) => void;
    currentPath: string;
}

/**
 * Desktop navigation menu component
 */
const DesktopNavMenu = memo<DesktopNavMenuProps>(({ onNavigate, currentPath }) => (
    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
        {navigationItems.map((item) => (
            <Button
                key={item.name}
                component={NavLink}
                to={item.path}
                sx={{
                    my: 2, 
                    color: 'white', 
                    display: 'block',
                    '&.active': {
                        backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    },
                }}
            >
                {item.name}
            </Button>
        ))}
    </Box>
));

DesktopNavMenu.displayName = 'DesktopNavMenu';

/**
 * Header component for the application
 * Provides navigation between different pages
 */
const Header = memo(() => {
    const navigate = useNavigate();
    const location = useLocation();
    const { mode, toggleTheme } = useAppTheme();
    const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
    const [searchValue, setSearchValue] = useState('');

    // Event handlers with useCallback to prevent unnecessary re-renders
    const handleOpenMobileMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setMobileMenuAnchor(event.currentTarget);
    }, []);

    const handleCloseMobileMenu = useCallback(() => {
        setMobileMenuAnchor(null);
    }, []);

    const handleNavigate = useCallback((path: string) => {
        navigate(path);
        handleCloseMobileMenu();
    }, [navigate, handleCloseMobileMenu]);

    const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
    }, []);

    const handleSearchSubmit = useCallback((event: React.FormEvent) => {
        event.preventDefault();
        if (searchValue.trim()) {
            navigate(`/devices?search=${encodeURIComponent(searchValue.trim())}`);
        }
    }, [navigate, searchValue]);

    return (
        <AppBar position="static" elevation={1}>
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ minHeight: 64 }}>
                    {/* Desktop Logo */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                        <Logo />
                    </Box>

                    {/* Mobile Menu */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
                        <IconButton
                            size="large"
                            aria-label="navigation menu"
                            aria-controls="mobile-nav-menu"
                            aria-haspopup="true"
                            onClick={handleOpenMobileMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <MobileNavMenu 
                            anchorEl={mobileMenuAnchor}
                            open={Boolean(mobileMenuAnchor)}
                            onClose={handleCloseMobileMenu}
                            onNavigate={handleNavigate}
                        />
                    </Box>

                    {/* Mobile Logo */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', flexGrow: 1 }}>
                        <Logo />
                    </Box>

                    {/* Desktop Menu */}
                    <DesktopNavMenu 
                        onNavigate={handleNavigate} 
                        currentPath={location.pathname}
                    />

                    {/* Search Bar - Desktop only */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, mx: 2 }}>
                        <form onSubmit={handleSearchSubmit}>
                            <TextField
                                size="small"
                                placeholder="Search devices..."
                                value={searchValue}
                                onChange={handleSearchChange}
                                sx={{
                                    width: 250,
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        '& fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.3)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.5)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.8)',
                                        },
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'white',
                                        '&::placeholder': {
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            opacity: 1,
                                        },
                                    },
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </form>
                    </Box>

                    {/* Action Icons */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {/* Theme Toggle */}
                        <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
                            <IconButton
                                onClick={toggleTheme}
                                color="inherit"
                                aria-label="toggle theme"
                            >
                                {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
                            </IconButton>
                        </Tooltip>

                        {/* Notifications */}
                        <Tooltip title="Notifications">
                            <IconButton color="inherit" aria-label="notifications">
                                <Badge badgeContent={0} color="error">
                                    <NotificationsIcon />
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        {/* Quick Settings */}
                        <Tooltip title="Settings">
                            <IconButton
                                color="inherit"
                                aria-label="settings"
                                onClick={() => navigate('/settings')}
                            >
                                <SettingsIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
});

Header.displayName = 'Header';

export default Header;
