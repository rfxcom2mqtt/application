import React from 'react';
import {
  Box,
  Grid,
  Alert,
  Card,
  CardContent,
  Typography,
  Divider,
  Paper,
  Skeleton,
  Button,
  Stack,
} from '@mui/material';
import { Code, Refresh, Edit } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Components
import DeviceInfo from '../../components/device/DeviceInfo';
import {
  SensorsSection,
  SwitchesSection,
  BinarySensorsSection,
  CoversSection,
  SelectsSection,
} from '../../components/device/EntitySection';
import ConfirmationDialogTextfield, {
  DialogTextfieldState,
  closedDialogTextfieldState,
} from '../../components/ConfirmationDialogTextfield';
import PageContainer from '../../components/common/PageContainer';

// Hooks
import { useDevice } from '../../hooks/useDevice';

function DevicePage() {
  const { t } = useTranslation();
  const {
    device,
    state,
    loading,
    refresh,
    handleSwitchAction,
    handleSensorRename,
    handleSwitchRename,
    handleDeviceRename,
    getEntityCount,
    getEntityCounts,
  } = useDevice();

  const [dialogProps, setDialogProps] = React.useState<DialogTextfieldState>(
    closedDialogTextfieldState
  );

  const handleRenameDevice = () => {
    const action = (deviceName: string) => {
      handleDeviceRename(deviceName);
    };
    setDialogProps({
      open: true,
      action,
      message: t('device.actions.renameDevice'),
    });
  };

  const handleSensorRenameAction = (entity: any) => {
    const action = (name: string) => {
      handleSensorRename(entity, name);
    };
    setDialogProps({
      open: true,
      action,
      message: t('device.actions.renameSensor'),
    });
  };

  const handleSwitchRenameAction = (entity: any) => {
    const action = (name: string) => {
      handleSwitchRename(entity, name);
    };
    setDialogProps({
      open: true,
      action,
      message: t('device.actions.renameSwitch'),
    });
  };

  const dialogOnContinue = (value: string) => {
    if (dialogProps.action) {
      dialogProps.action(value);
    }
    setDialogProps({ ...dialogProps, open: false });
  };

  const dialogOnCancel = () => {
    setDialogProps({ ...dialogProps, open: false });
  };

  const pageActions = device ? (
    <Stack direction="row" spacing={1}>
      <Button variant="outlined" startIcon={<Edit />} onClick={handleRenameDevice}>
        {t('device.actions.rename')}
      </Button>
      <Button variant="outlined" startIcon={<Refresh />} onClick={refresh} disabled={loading}>
        {t('common.refresh')}
      </Button>
    </Stack>
  ) : null;

  const deviceTitle = device?.name || device?.id || t('device.title');
  const deviceSubtitle = device
    ? t('device.subtitle', {
        count: getEntityCount(),
        type: device.type || t('common.unknown'),
      })
    : t('device.loading');

  if (loading) {
    return (
      <PageContainer
        title={t('device.loading')}
        subtitle={t('device.loadingSubtitle')}
        actions={pageActions}
        loading={true}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={200} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="70%" height={20} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </PageContainer>
    );
  }

  if (!device) {
    return (
      <PageContainer title={t('device.notFound')} subtitle={t('device.notFoundSubtitle')}>
        <Alert severity="error">{t('device.notFoundMessage')}</Alert>
      </PageContainer>
    );
  }

  const entityCounts = getEntityCounts();

  return (
    <PageContainer title={deviceTitle} subtitle={deviceSubtitle} actions={pageActions}>
      <Grid container spacing={3}>
        {/* Device Information */}
        <Grid item xs={12} lg={4}>
          <DeviceInfo device={device} entityCounts={entityCounts} />
        </Grid>

        {/* Device Entities */}
        <Grid item xs={12} lg={8}>
          {/* Sensors */}
          {device.sensors && state && (
            <SensorsSection
              sensors={device.sensors}
              state={state}
              onRename={handleSensorRenameAction}
            />
          )}

          {/* Switches */}
          {device.switchs && state && (
            <SwitchesSection
              switches={device.switchs}
              state={state}
              onAction={handleSwitchAction}
              onRename={handleSwitchRenameAction}
            />
          )}

          {/* Binary Sensors */}
          {device.binarysensors && state && (
            <BinarySensorsSection binarySensors={device.binarysensors} state={state} />
          )}

          {/* Covers */}
          {device.covers && state && <CoversSection covers={device.covers} state={state} />}

          {/* Selects */}
          {device.selects && state && <SelectsSection selects={device.selects} state={state} />}

          {/* Raw State (Debug) */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Code sx={{ mr: 1 }} />
                {t('device.debug.title')}
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Paper
                sx={{
                  p: 2,
                  bgcolor: 'grey.100',
                  maxHeight: 400,
                  overflow: 'auto',
                  borderRadius: 2,
                }}
              >
                <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                  {JSON.stringify(state, null, 2)}
                </pre>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ConfirmationDialogTextfield
        open={dialogProps.open}
        onContinue={dialogOnContinue}
        onCancel={dialogOnCancel}
        customMessage={dialogProps.message}
      />
    </PageContainer>
  );
}

export default DevicePage;
