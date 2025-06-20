import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Typography, Divider, Grid, Paper, Badge } from '@mui/material';
import { DeviceHub, Memory, SignalWifi4Bar, Router, Category } from '@mui/icons-material';

interface EntitySectionProps {
  title: string;
  icon: React.ReactNode;
  count: number;
  children: React.ReactNode;
}

function EntitySection({ title, icon, count, children }: EntitySectionProps) {
  if (count === 0) {
    return null;
  }

  return (
    <Card sx={{ mb: 3, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          {icon}
          {title}
          <Badge badgeContent={count} color="primary" sx={{ ml: 1 }} />
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          {children}
        </Grid>
      </CardContent>
    </Card>
  );
}

// Specific entity section components
export function SensorsSection({
  sensors,
  state,
  onRename,
}: {
  sensors: any;
  state: any;
  onRename: (sensor: any) => void;
}) {
  const { t } = useTranslation();
  const Sensor = React.lazy(() => import('./Sensor'));

  return (
    <EntitySection
      title={t('deviceInfo.sensors')}
      icon={<DeviceHub sx={{ mr: 1 }} />}
      count={Object.keys(sensors || {}).length}
    >
      {Object.keys(sensors || {}).map(key => (
        <Grid item xs={12} sm={6} key={key}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <React.Suspense fallback={<div>{t('common.loading')}</div>}>
              <Sensor sensor={sensors[key]} value={state} renameAction={onRename} />
            </React.Suspense>
          </Paper>
        </Grid>
      ))}
    </EntitySection>
  );
}

export function SwitchesSection({
  switches,
  state,
  onAction,
  onRename,
}: {
  switches: any;
  state: any;
  onAction: (entity: any, action: string) => void;
  onRename: (entity: any) => void;
}) {
  const { t } = useTranslation();
  const SwitchItem = React.lazy(() => import('./Switch'));

  return (
    <EntitySection
      title={t('deviceInfo.switches')}
      icon={<Memory sx={{ mr: 1 }} />}
      count={Object.keys(switches || {}).length}
    >
      {Object.keys(switches || {}).map(key => (
        <Grid item xs={12} sm={6} key={key}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <React.Suspense fallback={<div>{t('common.loading')}</div>}>
              <SwitchItem
                item={switches[key]}
                value={state}
                action={onAction}
                renameAction={onRename}
              />
            </React.Suspense>
          </Paper>
        </Grid>
      ))}
    </EntitySection>
  );
}

export function BinarySensorsSection({ binarySensors, state }: { binarySensors: any; state: any }) {
  const { t } = useTranslation();
  const BinarySensor = React.lazy(() => import('./BinarySensor'));

  return (
    <EntitySection
      title={t('deviceInfo.binarySensors')}
      icon={<SignalWifi4Bar sx={{ mr: 1 }} />}
      count={Object.keys(binarySensors || {}).length}
    >
      {Object.keys(binarySensors || {}).map(key => (
        <Grid item xs={12} sm={6} key={key}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <React.Suspense fallback={<div>{t('common.loading')}</div>}>
              <BinarySensor item={binarySensors[key]} value={state} renameAction={undefined} />
            </React.Suspense>
          </Paper>
        </Grid>
      ))}
    </EntitySection>
  );
}

export function CoversSection({ covers, state }: { covers: any; state: any }) {
  const { t } = useTranslation();
  const Cover = React.lazy(() => import('./Cover'));

  return (
    <EntitySection
      title={t('deviceInfo.covers')}
      icon={<Router sx={{ mr: 1 }} />}
      count={Object.keys(covers || {}).length}
    >
      {Object.keys(covers || {}).map(key => (
        <Grid item xs={12} sm={6} key={key}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <React.Suspense fallback={<div>{t('common.loading')}</div>}>
              <Cover item={covers[key]} value={state} renameAction={undefined} />
            </React.Suspense>
          </Paper>
        </Grid>
      ))}
    </EntitySection>
  );
}

export function SelectsSection({ selects, state }: { selects: any; state: any }) {
  const { t } = useTranslation();
  const Select = React.lazy(() => import('./Select'));

  return (
    <EntitySection
      title={t('deviceInfo.selects')}
      icon={<Category sx={{ mr: 1 }} />}
      count={Object.keys(selects || {}).length}
    >
      {Object.keys(selects || {}).map(key => (
        <Grid item xs={12} sm={6} key={key}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <React.Suspense fallback={<div>{t('common.loading')}</div>}>
              <Select item={selects[key]} value={state} renameAction={undefined} />
            </React.Suspense>
          </Paper>
        </Grid>
      ))}
    </EntitySection>
  );
}

export default EntitySection;
