import React, { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm' // Для поддержки таблиц, зачеркивания и т.д.
import { Box, Typography } from '@mui/material'
import Callout from './Callout' // Предполагаем, что этот компонент существует

// Регулярное выражение для поиска и замены пользовательских блоков Callout
// Оно ищет :::TYPE [Optional Title] Content :::
const CALLOUT_REGEX = /:::(\w+)(?:\s*\[(.*?)\])?\n([\s\S]*?)\n:::/g

// Map для рендеринга стандартных элементов в стиле MUI
const customRenderers = {
  // Преобразование стандартного тега <table> в кастомный компонент MUI (с контейнером для скролла)
  table: ({ children }: { children: React.ReactNode }) => (
    <Box sx={{ overflowX: 'auto', my: 2 }}>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>{children}</table>
    </Box>
  ),
  // Преобразование <img> для стилизации MUI
  img: ({ src, alt }: { src?: string; alt?: string }) => (
    <Box sx={{ maxWidth: '100%', height: 'auto', my: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src={src} alt={alt} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
        {alt && <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>{alt}</Typography>}
    </Box>
  ),
  // Добавляем стили для основных тегов (для единообразия)
  p: ({ children }: { children: React.ReactNode }) => <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>{children}</Typography>,
  li: ({ children }: { children: React.ReactNode }) => <Typography component="li" variant="body1" sx={{ mb: 0.5 }}>{children}</Typography>,
  ul: ({ children }: { children: React.ReactNode }) => <Box component="ul" sx={{ mb: 2, pl: 3 }}>{children}</Box>,
  ol: ({ children }: { children: React.ReactNode }) => <Box component="ol" sx={{ mb: 2, pl: 3 }}>{children}</Box>,
  a: ({ href, children }: { href?: string; children: React.ReactNode }) => <a href={href} style={{ color: '#2196f3', textDecoration: 'none' }}>{children}</a>,
  strong: ({ children }: { children: React.ReactNode }) => <strong style={{ fontWeight: 600, color: '#1976d2' }}>{children}</strong>,
  em: ({ children }: { children: React.ReactNode }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
}

interface EnhancedMarkdownProps {
  content: string
}

const EnhancedMarkdown: React.FC<EnhancedMarkdownProps> = ({ content }) => {
  const processedContent = useMemo(() => {
    if (!content) return ''

    // 1. Пре-обработка: Замена кастомных блоков на HTML-компоненты Callout
    // Этот метод безопаснее, чем разделение массива, и не ломается от сложных символов.
    let tempHtml = content.replace(CALLOUT_REGEX, (match, type, title, blockContent) => {
      // Кодируем содержимое, чтобы избежать проблем с Markdown-парсингом внутри Callout
      const encodedContent = encodeURIComponent(blockContent.trim())
      const encodedTitle = title ? encodeURIComponent(title.trim()) : ''
      
      // Используем специальный HTML-тег с атрибутами data-*
      return `<div 
        data-callout-type="${type.toLowerCase()}" 
        data-callout-title="${encodedTitle}" 
        data-callout-content="${encodedContent}"
      ></div>`
    })

    return tempHtml
  }, [content])

  // 2. Рендеринг: Обработка Markdown и кастомных элементов
  const renderers = useMemo(() => {
    return {
      // Наследуем стандартные рендереры
      ...customRenderers,

      // Обработка кастомного DIV-элемента, созданного на шаге 1
      div: ({ node, ...props }: any) => {
        const { 'data-callout-type': type, 'data-callout-title': title, 'data-callout-content': content } = props
        
        if (type) {
          // Если это наш кастомный блок Callout
          const decodedContent = decodeURIComponent(content || '')
          const decodedTitle = decodeURIComponent(title || '')
          
          return (
            <Box key={node?.position?.start.offset || 0} sx={{ my: 2 }}>
                <Callout type={type} title={decodedTitle}>
                    {/* Рендерим Markdown рекурсивно внутри Callout */}
                    <EnhancedMarkdown content={decodedContent} />
                </Callout>
            </Box>
          )
        }
        
        // Если это обычный div, возвращаем его как есть
        return <div {...props} />
      },
      // Обработка <h1>, <h2> и т.д. для добавления стиля
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
      // ... (остальные заголовки можно добавить по аналогии)
    }
  }, [])

  return (
    <ReactMarkdown
      // Используем плагин GFM для таблиц и других расширений
      remarkPlugins={[remarkGfm]}
      // Разрешаем рендерить HTML, чтобы перехватывать наш div
      rehypePlugins={[]} 
      components={renderers}
      // Это позволяет нам вставлять HTML-теги для перехвата
      skipHtml={false} 
      className="markdown-body" 
    >
      {processedContent}
    </ReactMarkdown>
  )
}

export default EnhancedMarkdown