import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei'
import { Box, CircularProgress, Typography } from '@mui/material'
import * as THREE from 'three'

interface Model3DViewerProps {
  modelUrl?: string
  autoRotate?: boolean
}

// Simple 3D model component (placeholder for actual model loading)
const Model3D = ({ autoRotate = false }: { autoRotate?: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

const Model3DViewer = ({ modelUrl, autoRotate = true }: Model3DViewerProps) => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '500px',
        bgcolor: '#f0f0f0',
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Canvas>
        <PerspectiveCamera makeDefault position={[5, 5, 5]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense
          fallback={
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <CircularProgress />
            </Box>
          }
        >
          <Model3D autoRotate={autoRotate} />
          <Environment preset="studio" />
        </Suspense>
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={10}
        />
        <gridHelper args={[10, 10]} />
      </Canvas>

      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          p: 1,
          borderRadius: 1,
        }}
      >
        <Typography variant="caption" display="block">
          🖱️ Вращайте: левая кнопка мыши
        </Typography>
        <Typography variant="caption" display="block">
          🔍 Масштаб: колесо мыши
        </Typography>
        <Typography variant="caption" display="block">
          ↔️ Перемещение: правая кнопка мыши
        </Typography>
      </Box>
    </Box>
  )
}

export default Model3DViewer
