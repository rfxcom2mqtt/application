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
import SensorsIcon from '@mui/icons-material/Sensors';

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
    const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);

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

    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
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
                </Toolbar>
            </Container>
        </AppBar>
    );
});

Header.displayName = 'Header';

export default Header;
