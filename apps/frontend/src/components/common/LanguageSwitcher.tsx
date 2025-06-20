import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium';
  fullWidth?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'outlined',
  size = 'medium',
  fullWidth = false,
}) => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (event: SelectChangeEvent) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <FormControl variant={variant} size={size} fullWidth={fullWidth}>
      <InputLabel id="language-select-label">{t('settings.language.title')}</InputLabel>
      <Select
        labelId="language-select-label"
        id="language-select"
        value={i18n.language}
        label={t('settings.language.title')}
        onChange={handleLanguageChange}
      >
        <MenuItem value="en">{t('settings.language.english')}</MenuItem>
        <MenuItem value="fr">{t('settings.language.french')}</MenuItem>
      </Select>
    </FormControl>
  );
};

export default LanguageSwitcher;
