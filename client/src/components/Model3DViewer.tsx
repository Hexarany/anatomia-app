import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, Html, useProgress, Center } from '@react-three/drei'
import { Box, CircularProgress, IconButton, Paper, Typography, LinearProgress } from '@mui/material'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import RefreshIcon from '@mui/icons-material/Refresh'
import * as THREE from 'three'

interface Model3DViewerProps {
  modelUrl: string
  caption?: string
  autoRotate?: boolean
}

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <Box sx={{ textAlign: 'center', color: 'white' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="body2">
          Загрузка модели... {progress.toFixed(0)}%
        </Typography>
      </Box>
    </Html>
  )
}

function CameraAdjuster({ modelRef }: { modelRef: React.RefObject<THREE.Group> }) {
  const { camera } = useThree()

  useEffect(() => {
    if (modelRef.current) {
      const box = new THREE.Box3().setFromObject(modelRef.current)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())

      const maxDim = Math.max(size.x, size.y, size.z)
      const fov = camera.fov * (Math.PI / 180)
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2))
      cameraZ *= 1.5

      camera.position.set(center.x, center.y, center.z + cameraZ)
      camera.lookAt(center)
      camera.updateProjectionMatrix()
    }
  }, [modelRef, camera])

  return null
}

function Model({ url, onLoad, onError }: { url: string; onLoad?: () => void; onError?: (error: Error) => void }) {
  const groupRef = useRef<THREE.Group>(null)

  const { scene } = useGLTF(url, true, true, (loader) => {
    loader.manager.onLoad = () => {
      if (onLoad) {
        onLoad()
      }
    }
    loader.manager.onError = (url) => {
      console.error('Error loading 3D model:', url)
      if (onError) {
        onError(new Error(`Failed to load: ${url}`))
      }
    }
  })

  return (
    <group ref={groupRef}>
      <CameraAdjuster modelRef={groupRef} />
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  )
}

const Model3DViewer = ({ modelUrl, caption, autoRotate = true }: Model3DViewerProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  const handleReset = () => {
    // Триггер для сброса камеры - обновим ключ Canvas
    window.location.reload()
  }

  return (
    <Paper
      ref={containerRef}
      sx={{
        position: 'relative',
        width: '100%',
        height: isFullscreen ? '100vh' : { xs: 300, sm: 400, md: 500 },
        bgcolor: '#1a1a1a',
        overflow: 'hidden',
      }}
    >
      {/* Заголовок */}
      {caption && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            p: 1,
            zIndex: 10,
          }}
        >
          <Typography variant="body2">{caption}</Typography>
        </Box>
      )}

      {/* Элементы управления */}
      <Box
        sx={{
          position: 'absolute',
          top: caption ? 50 : 10,
          right: 10,
          zIndex: 10,
          display: 'flex',
          gap: 1,
        }}
      >
        <IconButton
          onClick={handleReset}
          sx={{
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
          }}
          size="small"
        >
          <RefreshIcon />
        </IconButton>
        <IconButton
          onClick={toggleFullscreen}
          sx={{
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
          }}
          size="small"
        >
          {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
        </IconButton>
      </Box>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={<Loader />}>
          {/* Освещение */}
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />

          {/* Модель */}
          <Model
            url={modelUrl}
            onLoad={() => setIsLoading(false)}
            onError={(err) => {
              setIsLoading(false)
              setError(err.message)
            }}
          />

          {/* Окружающая среда для лучшего освещения */}
          <Environment preset="studio" />

          {/* Управление камерой */}
          <OrbitControls
            autoRotate={autoRotate}
            autoRotateSpeed={2}
            enableDamping
            dampingFactor={0.05}
            minDistance={0.1}
            maxDistance={1000}
            enablePan={true}
            enableZoom={true}
          />
        </Suspense>
      </Canvas>

      {/* Индикатор загрузки */}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
          }}
        >
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="body1" color="white">
            Загрузка 3D модели...
          </Typography>
          <Typography variant="caption" color="white" sx={{ mt: 1, opacity: 0.7 }}>
            Большие модели могут загружаться до 30 секунд
          </Typography>
        </Box>
      )}

      {/* Сообщение об ошибке */}
      {error && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
            p: 2,
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            Ошибка загрузки модели
          </Typography>
          <Typography variant="body2" color="white" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <IconButton
            onClick={() => window.location.reload()}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      )}

      {/* Инструкции */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          p: { xs: 0.5, sm: 1 },
          borderRadius: 1,
          fontSize: { xs: '0.625rem', sm: '0.75rem' },
          zIndex: 10,
          display: { xs: 'none', sm: 'block' },
        }}
      >
        <Typography variant="caption" display="block">
          Левая кнопка мыши: вращение
        </Typography>
        <Typography variant="caption" display="block">
          Колесо мыши: масштаб
        </Typography>
        <Typography variant="caption" display="block">
          Правая кнопка мыши: перемещение
        </Typography>
      </Box>

      {/* Мобильные инструкции */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          p: 0.5,
          borderRadius: 1,
          fontSize: '0.625rem',
          zIndex: 10,
          display: { xs: 'block', sm: 'none' },
        }}
      >
        <Typography variant="caption" display="block">
          Касание: вращение
        </Typography>
        <Typography variant="caption" display="block">
          Щипок: масштаб
        </Typography>
      </Box>
    </Paper>
  )
}

export default Model3DViewer
