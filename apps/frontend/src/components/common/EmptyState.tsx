import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Button, Stack, Paper, useTheme as useMuiTheme } from '@mui/material';
import { DeviceHub, Refresh, Search, FilterList, Add, Lightbulb } from '@mui/icons-material';

interface EmptyStateProps {
  searchTerm?: string;
  filterType?: string;
  onRefresh?: () => void;
  onClearFilters?: () => void;
  onDiscoverDevices?: () => void;
}

function EmptyState({
  searchTerm,
  filterType,
  onRefresh,
  onClearFilters,
  onDiscoverDevices,
}: EmptyStateProps) {
  const { t } = useTranslation();
  const theme = useMuiTheme();
  const hasFilters = searchTerm || (filterType && filterType !== 'all');

  const getEmptyStateContent = () => {
    if (hasFilters) {
      return {
        icon: Search,
        title: t('emptyState.noResults'),
        description: t('emptyState.noResultsDescription'),
        suggestions: [
          t('emptyState.suggestions.tryDifferentTerms'),
          t('emptyState.suggestions.clearFilters'),
          t('emptyState.suggestions.checkSpelling'),
        ],
        actions: (
          <Stack direction="row" spacing={2}>
            {onClearFilters && (
              <Button variant="outlined" startIcon={<FilterList />} onClick={onClearFilters}>
                {t('devices.clearFilters')}
              </Button>
            )}
            {onRefresh && (
              <Button variant="contained" startIcon={<Refresh />} onClick={onRefresh}>
                {t('common.refresh')}
              </Button>
            )}
          </Stack>
        ),
      };
    }

    return {
      icon: DeviceHub,
      title: t('emptyState.noDevices'),
      description: t('emptyState.noDevicesDescription'),
      suggestions: [
        t('emptyState.suggestions.ensureConnection'),
        t('emptyState.suggestions.checkPowered'),
        t('emptyState.suggestions.triggerManually'),
        t('emptyState.suggestions.verifyConfig'),
      ],
      actions: (
        <Stack direction="row" spacing={2}>
          {onDiscoverDevices && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onDiscoverDevices}
              size="large"
            >
              {t('devices.discoverDevices')}
            </Button>
          )}
          {onRefresh && (
            <Button variant="outlined" startIcon={<Refresh />} onClick={onRefresh} size="large">
              {t('common.refresh')}
            </Button>
          )}
        </Stack>
      ),
    };
  };

  const content = getEmptyStateContent();
  const IconComponent = content.icon;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        py: 6,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          maxWidth: 600,
          backgroundColor: 'transparent',
          border: `2px dashed ${theme.palette.divider}`,
          borderRadius: 3,
        }}
      >
        <IconComponent
          sx={{
            fontSize: 80,
            color: 'text.secondary',
            mb: 3,
            opacity: 0.7,
          }}
        />

        <Typography variant="h5" color="text.primary" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {content.title}
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
          {content.description}
        </Typography>

        {content.suggestions && (
          <Box sx={{ mb: 4 }}>
            <Stack spacing={1} alignItems="center">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Lightbulb sx={{ fontSize: 20, color: 'warning.main' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  {t('emptyState.suggestions.title')}
                </Typography>
              </Box>
              {content.suggestions.map((suggestion, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: '0.875rem' }}
                >
                  • {suggestion}
                </Typography>
              ))}
            </Stack>
          </Box>
        )}

        {content.actions}
      </Paper>
    </Box>
  );
}

export default EmptyState;
