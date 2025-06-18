import React from 'react';
import { Container, Box, Typography, useTheme as useMuiTheme } from '@mui/material';
import Breadcrumbs from './Breadcrumbs';

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  showBreadcrumbs?: boolean;
  breadcrumbItems?: Array<{
    label: string;
    path?: string;
    icon?: React.ReactNode;
  }>;
  actions?: React.ReactNode;
  loading?: boolean;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  subtitle,
  maxWidth = 'xl',
  showBreadcrumbs = true,
  breadcrumbItems,
  actions,
  loading = false,
}) => {
  const theme = useMuiTheme();

  return (
    <Container maxWidth={maxWidth} sx={{ py: 3 }}>
      {showBreadcrumbs && (
        <Breadcrumbs items={breadcrumbItems} />
      )}
      
      {(title || subtitle || actions) && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 2,
          }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {title && (
                <Typography 
                  variant="h4" 
                  component="h1" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    wordBreak: 'break-word',
                  }}
                >
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ 
                    lineHeight: 1.6,
                    maxWidth: '600px',
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
            
            {actions && (
              <Box sx={{ 
                display: 'flex', 
                gap: 1,
                flexShrink: 0,
                alignItems: 'flex-start',
              }}>
                {actions}
              </Box>
            )}
          </Box>
        </Box>
      )}
      
      <Box sx={{ 
        opacity: loading ? 0.6 : 1,
        transition: 'opacity 0.2s ease-in-out',
      }}>
        {children}
      </Box>
    </Container>
  );
};

export default PageContainer;
