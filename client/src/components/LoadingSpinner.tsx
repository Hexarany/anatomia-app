import { Box, CircularProgress } from '@mui/material'

export default function LoadingSpinner() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        width: '100%',
      }}
    >
      <CircularProgress />
    </Box>
  )
}
