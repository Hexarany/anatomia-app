import { Box, Paper, Typography } from '@mui/material'
import WarningIcon from '@mui/icons-material/Warning'
import InfoIcon from '@mui/icons-material/Info'
import ErrorIcon from '@mui/icons-material/Error'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'

interface CalloutProps {
  type: 'warning' | 'info' | 'danger' | 'success' | 'clinical'
  title?: string
  children: React.ReactNode
}

const Callout = ({ type, title, children }: CalloutProps) => {
  const config = {
    warning: {
      icon: <WarningIcon />,
      bgcolor: '#fff3cd',
      borderColor: '#ffc107',
      color: '#856404',
      iconColor: '#ffc107',
    },
    info: {
      icon: <InfoIcon />,
      bgcolor: '#d1ecf1',
      borderColor: '#17a2b8',
      color: '#0c5460',
      iconColor: '#17a2b8',
    },
    danger: {
      icon: <ErrorIcon />,
      bgcolor: '#f8d7da',
      borderColor: '#dc3545',
      color: '#721c24',
      iconColor: '#dc3545',
    },
    success: {
      icon: <CheckCircleIcon />,
      bgcolor: '#d4edda',
      borderColor: '#28a745',
      color: '#155724',
      iconColor: '#28a745',
    },
    clinical: {
      icon: <LocalHospitalIcon />,
      bgcolor: '#e7f3ff',
      borderColor: '#2196f3',
      color: '#0d47a1',
      iconColor: '#2196f3',
    },
  }

  const { icon, bgcolor, borderColor, color, iconColor } = config[type]

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        gap: 2,
        p: 2,
        my: 2,
        bgcolor,
        borderLeft: `4px solid ${borderColor}`,
        color,
      }}
    >
      <Box sx={{ color: iconColor, flexShrink: 0, pt: 0.5 }}>{icon}</Box>
      <Box sx={{ flex: 1 }}>
        {title && (
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {title}
          </Typography>
        )}
        <Box sx={{ '& p:last-child': { mb: 0 } }}>{children}</Box>
      </Box>
    </Paper>
  )
}

export default Callout
