import React from 'react';
import {
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
  Box,
  useTheme as useMuiTheme,
} from '@mui/material';
import { NavigateNext, Home } from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

const routeLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/devices': 'Devices',
  '/settings': 'Settings',
  '/logs': 'Journals',
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const theme = useMuiTheme();
  const location = useLocation();

  // Generate breadcrumbs from current path if items not provided
  const breadcrumbItems = items || generateBreadcrumbs(location.pathname);

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <MuiBreadcrumbs
        separator={<NavigateNext fontSize="small" />}
        aria-label="breadcrumb"
        sx={{
          '& .MuiBreadcrumbs-separator': {
            color: theme.palette.text.secondary,
          },
        }}
      >
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          if (isLast) {
            return (
              <Typography
                key={item.path || item.label}
                color="text.primary"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 500,
                }}
              >
                {item.icon && (
                  <Box sx={{ mr: 0.5, display: 'flex' }}>
                    {item.icon}
                  </Box>
                )}
                {item.label}
              </Typography>
            );
          }

          return (
            <Link
              key={item.path || item.label}
              component={RouterLink}
              to={item.path || '/'}
              color="inherit"
              underline="hover"
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: theme.palette.text.secondary,
                '&:hover': {
                  color: theme.palette.primary.main,
                },
              }}
            >
              {item.icon && (
                <Box sx={{ mr: 0.5, display: 'flex' }}>
                  {item.icon}
                </Box>
              )}
              {item.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: 'Home',
      path: '/',
      icon: <Home fontSize="small" />,
    },
  ];

  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Skip if it's a dynamic route parameter (like device ID)
    if (segment.match(/^[a-f0-9-]{36}$/i) || segment.match(/^\d+$/)) {
      breadcrumbs.push({
        label: `${breadcrumbs[breadcrumbs.length - 1]?.label || 'Item'} Details`,
        path: currentPath,
      });
      return;
    }

    const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({
      label,
      path: currentPath,
    });
  });

  return breadcrumbs;
}

export default Breadcrumbs;
