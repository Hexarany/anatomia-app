import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'
import Callout from './Callout'

interface EnhancedMarkdownProps {
  children: string
}

const EnhancedMarkdown = ({ children }: EnhancedMarkdownProps) => {
  // Обработка callouts в markdown
  const processCallouts = (text: string) => {
    // Паттерн для callouts: :::warning, :::info, :::danger, :::success, :::clinical
    const calloutRegex = /:::(warning|info|danger|success|clinical)\s*(?:\[(.+?)\])?\n([\s\S]*?):::/g

    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match

    while ((match = calloutRegex.exec(text)) !== null) {
      // Добавляем текст перед callout
      if (match.index > lastIndex) {
        parts.push(
          <ReactMarkdown key={`md-${lastIndex}`} remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {text.slice(lastIndex, match.index)}
          </ReactMarkdown>
        )
      }

      // Добавляем callout
      const [, type, title, content] = match
      parts.push(
        <Callout key={`callout-${match.index}`} type={type as any} title={title}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{content.trim()}</ReactMarkdown>
        </Callout>
      )

      lastIndex = match.index + match[0].length
    }

    // Добавляем оставшийся текст
    if (lastIndex < text.length) {
      parts.push(
        <ReactMarkdown key={`md-${lastIndex}`} remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {text.slice(lastIndex)}
        </ReactMarkdown>
      )
    }

    return parts.length > 0 ? parts : <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{text}</ReactMarkdown>
  }

  const markdownComponents = {
    table: ({ children }: any) => (
      <TableContainer component={Paper} elevation={0} sx={{ my: 3, border: '1px solid #e0e0e0' }}>
        <Table size="small">
          {children}
        </Table>
      </TableContainer>
    ),
    thead: ({ children }: any) => (
      <TableHead sx={{ bgcolor: '#f5f5f5' }}>
        {children}
      </TableHead>
    ),
    tbody: ({ children }: any) => (
      <TableBody>
        {children}
      </TableBody>
    ),
    tr: ({ children }: any) => (
      <TableRow>
        {children}
      </TableRow>
    ),
    th: ({ children }: any) => (
      <TableCell sx={{ fontWeight: 600, borderBottom: '2px solid #e0e0e0' }}>
        {children}
      </TableCell>
    ),
    td: ({ children }: any) => (
      <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
        {children}
      </TableCell>
    ),
    h1: ({ children }: any) => (
      <Box component="h1" sx={{
        fontSize: '2rem',
        fontWeight: 600,
        mt: 4,
        mb: 2,
        color: 'primary.main',
        borderBottom: '3px solid',
        borderColor: 'primary.main',
        pb: 1,
      }}>
        {children}
      </Box>
    ),
    h2: ({ children }: any) => (
      <Box component="h2" sx={{
        fontSize: '1.5rem',
        fontWeight: 600,
        mt: 3.5,
        mb: 1.5,
        color: 'primary.dark',
        borderBottom: '2px solid',
        borderColor: 'primary.light',
        pb: 0.5,
      }}>
        {children}
      </Box>
    ),
    h3: ({ children }: any) => (
      <Box component="h3" sx={{
        fontSize: '1.25rem',
        fontWeight: 600,
        mt: 3,
        mb: 1,
        color: 'text.primary',
      }}>
        {children}
      </Box>
    ),
    h4: ({ children }: any) => (
      <Box component="h4" sx={{
        fontSize: '1.1rem',
        fontWeight: 600,
        mt: 2.5,
        mb: 1,
        color: 'text.primary',
      }}>
        {children}
      </Box>
    ),
    p: ({ children }: any) => (
      <Box component="p" sx={{ mb: 2, lineHeight: 1.8 }}>
        {children}
      </Box>
    ),
    ul: ({ children }: any) => (
      <Box component="ul" sx={{ mb: 2, pl: 3, '& li': { mb: 0.5 } }}>
        {children}
      </Box>
    ),
    ol: ({ children }: any) => (
      <Box component="ol" sx={{ mb: 2, pl: 3, '& li': { mb: 0.5 } }}>
        {children}
      </Box>
    ),
    blockquote: ({ children }: any) => (
      <Box
        component="blockquote"
        sx={{
          borderLeft: '4px solid',
          borderColor: 'grey.400',
          bgcolor: 'grey.50',
          p: 2,
          my: 2,
          fontStyle: 'italic',
        }}
      >
        {children}
      </Box>
    ),
    code: ({ inline, children }: any) => (
      inline ? (
        <Box
          component="code"
          sx={{
            bgcolor: 'grey.100',
            color: 'error.dark',
            px: 0.5,
            py: 0.25,
            borderRadius: 0.5,
            fontSize: '0.9em',
            fontFamily: 'monospace',
          }}
        >
          {children}
        </Box>
      ) : (
        <Box
          component="pre"
          sx={{
            bgcolor: 'grey.900',
            color: 'grey.50',
            p: 2,
            borderRadius: 1,
            overflow: 'auto',
            my: 2,
          }}
        >
          <code>{children}</code>
        </Box>
      )
    ),
  }

  return (
    <Box
      sx={{
        '& strong': { fontWeight: 600, color: 'text.primary' },
        '& em': { fontStyle: 'italic' },
        '& a': { color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
      }}
    >
      {processCallouts(children)}
    </Box>
  )
}

export default EnhancedMarkdown
