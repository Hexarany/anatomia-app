// client/src/components/Callout.tsx
import React from 'react';
import { Box, Paper, Typography, Alert, AlertTitle } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
// NOTE: Здесь не нужно импортировать EnhancedMarkdown, так как он передается через children

interface CalloutProps {
  type: 'warning' | 'info' | 'danger' | 'success' | 'clinical' | string;
  title?: string;
  children: React.ReactNode; // Принимаем дочерний компонент (EnhancedMarkdown)
}

const Callout: React.FC<CalloutProps> = ({ type, title, children }) => {
  const normalizedType = (type || 'info').toLowerCase();

  const config = {
    warning: {
      icon: <WarningIcon />,
      bgcolor: '#fffbe6',
      borderColor: '#ffc107',
      color: '#856404',
      iconColor: '#ffc107',
      defaultTitle: 'Внимание',
    },
    info: {
      icon: <InfoIcon />,
      bgcolor: '#d1ecf1',
      borderColor: '#17a2b8',
      color: '#0c5460',
      iconColor: '#17a2b8',
      defaultTitle: 'Информация',
    },
    danger: {
      icon: <ErrorIcon />,
      bgcolor: '#f8d7da',
      borderColor: '#dc3545',
      color: '#721c24',
      iconColor: '#dc3545',
      defaultTitle: 'ОПАСНОСТЬ',
    },
    success: {
      icon: <CheckCircleIcon />,
      bgcolor: '#d4edda',
      borderColor: '#28a745',
      color: '#155724',
      iconColor: '#28a745',
      defaultTitle: 'Рекомендация',
    },
    clinical: {
      icon: <LocalHospitalIcon />,
      bgcolor: '#e7f3ff',
      borderColor: '#2196f3',
      color: '#0d47a1',
      iconColor: '#2196f3',
      defaultTitle: 'Клиническое значение',
    },
  };

  const currentConfig = (config as any)[normalizedType] || config.info;

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        gap: 2,
        p: 2,
        my: 2,
        bgcolor: currentConfig.bgcolor,
        borderLeft: `4px solid ${currentConfig.borderColor}`,
        color: currentConfig.color,
      }}
    >
      <Box sx={{ color: currentConfig.iconColor, flexShrink: 0, pt: 0.5 }}>{currentConfig.icon}</Box>
      <Box sx={{ flex: 1 }}>
        {title && (
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, color: currentConfig.color }}>
            {title || currentConfig.defaultTitle}
          </Typography>
        )}
        
        {/* Рендерим дочерний компонент (EnhancedMarkdown) */}
        <Box sx={{ '& p:last-child': { mb: 0 }, color: currentConfig.color }}>{children}</Box>
      </Box>
    </Paper>
  );
};

export default Callout;