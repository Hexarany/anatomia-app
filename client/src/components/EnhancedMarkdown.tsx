import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { Box, Typography, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, Alert, AlertTitle } from '@mui/material'
import WarningIcon from '@mui/icons-material/Warning'
import InfoIcon from '@mui/icons-material/Info'
import ErrorIcon from '@mui/icons-material/Error'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'

interface EnhancedMarkdownProps {
  children: string
}

// Компонент для отображения кастомных блоков
const Callout: React.FC<{ type: string; title?: string; children: React.ReactNode }> = ({ type, title, children }) => {
  const normalizedType = (type || 'info').toLowerCase()

  const config = {
    danger: {
      icon: <ErrorIcon />,
      severity: 'error' as const,
      bgcolor: '#ffebee',
      borderColor: '#d32f2f',
      color: '#c62828',
      defaultTitle: 'ОПАСНОСТЬ',
    },
    warning: {
      icon: <WarningIcon />,
      severity: 'warning' as const,
      bgcolor: '#fff3e0',
      borderColor: '#f57c00',
      color: '#e65100',
      defaultTitle: 'ВНИМАНИЕ',
    },
    info: {
      icon: <InfoIcon />,
      severity: 'info' as const,
      bgcolor: '#e3f2fd',
      borderColor: '#1976d2',
      color: '#0d47a1',
      defaultTitle: 'Информация',
    },
    success: {
      icon: <CheckCircleIcon />,
      severity: 'success' as const,
      bgcolor: '#e8f5e9',
      borderColor: '#388e3c',
      color: '#1b5e20',
      defaultTitle: 'Рекомендация',
    },
    clinical: {
      icon: <LocalHospitalIcon />,
      severity: 'info' as const,
      bgcolor: '#e1f5fe',
      borderColor: '#0288d1',
      color: '#01579b',
      defaultTitle: 'Клиническое значение',
    },
  }

  const currentConfig = (config as any)[normalizedType] || config.info

  return (
    <Paper
      elevation={3}
      sx={{
        my: 3,
        p: 3,
        bgcolor: currentConfig.bgcolor,
        borderLeft: '6px solid',
        borderLeftColor: currentConfig.borderColor,
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box sx={{ color: currentConfig.borderColor, fontSize: '2rem', mt: 0.5 }}>
          {currentConfig.icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          {title && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: currentConfig.color,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {title}
            </Typography>
          )}
          <Box sx={{ color: currentConfig.color, '& p:last-child': { mb: 0 } }}>{children}</Box>
        </Box>
      </Box>
    </Paper>
  )
}

const EnhancedMarkdown: React.FC<EnhancedMarkdownProps> = ({ children }) => {
  if (!children || typeof children !== 'string') {
    return <Typography color="error">Нет контента для отображения</Typography>
  }

  // Обработка кастомных callout блоков
  const processCallouts = (text: string) => {
    const calloutRegex = /:::(\w+)(?:\s+(.+?))?\n([\s\S]*?)\n:::/g
    return text.replace(calloutRegex, (match, type, title, blockContent) => {
      const encodedContent = encodeURIComponent(blockContent.trim())
      const encodedTitle = title ? encodeURIComponent(title.trim()) : ''
      return `<div data-callout-type="${type.toLowerCase()}" data-callout-title="${encodedTitle}" data-callout-content="${encodedContent}"></div>`
    })
  }

  const processedContent = processCallouts(children)

  return (
    <Box>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Кастомные callout блоки
          div: ({ node, ...props }: any) => {
            const type = props['data-callout-type']
            const encodedTitle = props['data-callout-title']
            const encodedContent = props['data-callout-content']

            if (type && encodedContent) {
              const decodedContent = decodeURIComponent(encodedContent)
              const decodedTitle = encodedTitle ? decodeURIComponent(encodedTitle) : ''

              return (
                <Callout type={type} title={decodedTitle}>
                  <EnhancedMarkdown>{decodedContent}</EnhancedMarkdown>
                </Callout>
              )
            }

            return <div {...props} />
          },

          // Заголовок H1 - главный заголовок темы
          h1: ({ children }) => (
            <Typography
              variant="h3"
              component="h1"
              sx={{
                mt: 4,
                mb: 3,
                fontWeight: 700,
                color: 'primary.main',
                borderBottom: '4px solid',
                borderColor: 'primary.main',
                pb: 1.5,
                background: 'linear-gradient(90deg, rgba(25,118,210,0.1) 0%, rgba(25,118,210,0.05) 50%, transparent 100%)',
                px: 2,
                py: 1,
                borderRadius: '8px 8px 0 0',
              }}
            >
              {children}
            </Typography>
          ),

          // Заголовок H2 - основные разделы
          h2: ({ children }) => (
            <Typography
              variant="h4"
              component="h2"
              sx={{
                mt: 4,
                mb: 2,
                fontWeight: 600,
                color: 'primary.dark',
                borderLeft: '5px solid',
                borderColor: 'primary.main',
                pl: 2,
                py: 1,
                background: 'linear-gradient(90deg, rgba(25,118,210,0.08) 0%, transparent 100%)',
                borderRadius: '0 8px 8px 0',
              }}
            >
              {children}
            </Typography>
          ),

          // Заголовок H3 - подразделы
          h3: ({ children }) => (
            <Typography
              variant="h5"
              component="h3"
              sx={{
                mt: 3,
                mb: 1.5,
                fontWeight: 600,
                color: 'primary.dark',
                borderLeft: '3px solid',
                borderColor: 'secondary.main',
                pl: 2,
                py: 0.5,
              }}
            >
              {children}
            </Typography>
          ),

          // Заголовок H4
          h4: ({ children }) => (
            <Typography
              variant="h6"
              component="h4"
              sx={{
                mt: 2.5,
                mb: 1,
                fontWeight: 600,
                color: 'text.primary',
                pl: 1,
                borderLeft: '2px solid',
                borderColor: 'grey.400',
              }}
            >
              {children}
            </Typography>
          ),

          // Параграфы
          p: ({ children }) => {
            // Проверяем, содержит ли параграф только изображение
            const hasOnlyImage = React.Children.toArray(children).every(
              child => typeof child === 'object' && child !== null && 'type' in child && child.type === 'img'
            )

            // Если параграф содержит только изображение, рендерим как div
            if (hasOnlyImage) {
              return <Box sx={{ mb: 2 }}>{children}</Box>
            }

            // Иначе рендерим как обычный параграф
            return (
              <Typography
                variant="body1"
                paragraph
                sx={{
                  lineHeight: 1.8,
                  mb: 2,
                  color: 'text.primary',
                }}
              >
                {children}
              </Typography>
            )
          },

          // Таблицы - с цветовым оформлением
          table: ({ children }) => (
            <TableContainer
              component={Paper}
              elevation={2}
              sx={{
                my: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Table>{children}</Table>
            </TableContainer>
          ),

          thead: ({ children }) => (
            <TableHead
              sx={{
                bgcolor: 'primary.main',
                '& th': {
                  color: 'white',
                  fontWeight: 700,
                },
              }}
            >
              {children}
            </TableHead>
          ),

          tbody: ({ children }) => (
            <TableBody
              sx={{
                '& tr:nth-of-type(odd)': {
                  bgcolor: 'grey.50',
                },
                '& tr:nth-of-type(even)': {
                  bgcolor: 'white',
                },
                '& tr:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              {children}
            </TableBody>
          ),

          tr: ({ children }) => <TableRow>{children}</TableRow>,

          th: ({ children }) => (
            <TableCell
              sx={{
                fontWeight: 700,
                borderBottom: '2px solid',
                borderColor: 'primary.dark',
                py: 2,
              }}
            >
              {children}
            </TableCell>
          ),

          td: ({ children }) => (
            <TableCell
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                py: 1.5,
              }}
            >
              {children}
            </TableCell>
          ),

          // Списки
          ul: ({ children }) => (
            <Box
              component="ul"
              sx={{
                pl: 4,
                my: 2,
                '& li::marker': {
                  color: 'primary.main',
                  fontSize: '1.2em',
                },
              }}
            >
              {children}
            </Box>
          ),

          ol: ({ children }) => (
            <Box
              component="ol"
              sx={{
                pl: 4,
                my: 2,
                '& li::marker': {
                  color: 'primary.main',
                  fontWeight: 600,
                },
              }}
            >
              {children}
            </Box>
          ),

          li: ({ children }) => (
            <Typography
              component="li"
              variant="body1"
              sx={{
                mb: 0.8,
                lineHeight: 1.7,
              }}
            >
              {children}
            </Typography>
          ),

          // Жирный текст
          strong: ({ children }) => (
            <Box
              component="strong"
              sx={{
                fontWeight: 700,
                color: 'primary.dark',
              }}
            >
              {children}
            </Box>
          ),

          // Курсив
          em: ({ children }) => (
            <Box
              component="em"
              sx={{
                fontStyle: 'italic',
                color: 'text.secondary',
              }}
            >
              {children}
            </Box>
          ),

          // Inline code
          code: ({ className, children }) => {
            const isInline = !className
            if (isInline) {
              return (
                <Box
                  component="code"
                  sx={{
                    bgcolor: 'warning.light',
                    color: 'warning.dark',
                    px: 1,
                    py: 0.3,
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.9em',
                    border: '1px solid',
                    borderColor: 'warning.main',
                  }}
                >
                  {children}
                </Box>
              )
            }
            return (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  my: 2,
                  bgcolor: 'grey.900',
                  color: 'grey.100',
                  borderRadius: 2,
                  overflow: 'auto',
                  border: '1px solid',
                  borderColor: 'grey.700',
                }}
              >
                <Box component="code" sx={{ fontFamily: 'monospace', fontSize: '0.9em' }}>
                  {children}
                </Box>
              </Paper>
            )
          },

          // Blockquote - цитаты
          blockquote: ({ children }) => (
            <Paper
              elevation={0}
              sx={{
                borderLeft: '5px solid',
                borderColor: 'info.main',
                bgcolor: 'info.light',
                color: 'info.dark',
                p: 2.5,
                my: 3,
                fontStyle: 'italic',
                borderRadius: '0 8px 8px 0',
              }}
            >
              {children}
            </Paper>
          ),

          // Горизонтальная линия
          hr: () => (
            <Box
              component="hr"
              sx={{
                my: 4,
                border: 'none',
                height: '3px',
                background: 'linear-gradient(90deg, transparent, rgba(25,118,210,0.5), transparent)',
                borderRadius: 2,
              }}
            />
          ),

          // Изображения
          img: ({ src, alt }) => (
            <Box
              component="img"
              src={src}
              alt={alt}
              sx={{
                width: '100%',
                height: 'auto',
                display: 'block',
                my: 2,
                borderRadius: 2,
                boxShadow: 2,
              }}
            />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </Box>
  )
}

export default EnhancedMarkdown
