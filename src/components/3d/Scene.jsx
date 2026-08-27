import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Preload } from '@react-three/drei';

/**
 * Scene - Reusable 3D Canvas wrapper
 * @param {Object} props
 * @param {React.ReactNode} props.children - 3D elements to render
 * @param {boolean} props.controls - Enable orbit controls (default: false)
 * @param {boolean} props.stars - Show star background (default: true)
 * @param {string} props.className - Additional CSS classes
 */
// Background video for the globe scene
const BACKGROUND_VIDEO_URL = "/frontbg-2.mp4";

const Scene = ({
    children,
    controls = false,
    className = '',
    cameraPosition = [0, 0, 5],
    ...props
}) => {
    return (
        <div className={`w-full h-full ${className}`} style={{ position: 'relative', overflow: 'hidden' }} {...props}>
            {/* Background Video */}
            <video
                autoPlay
                loop
                muted
                playsInline
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 0,
                    opacity: 0.8, // Increased opacity for better visibility
                    pointerEvents: 'none',
                }}
            >
                <source src={BACKGROUND_VIDEO_URL} type="video/mp4" />
            </video>
            <Canvas
                camera={{ position: cameraPosition, fov: 45 }}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: 'default',
                    failIfMajorPerformanceCaveat: false
                }}
                dpr={[1, 1.5]}
                style={{
                    background: 'transparent',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                {/* Lighting */}
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1.2} />
                <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4fc3dc" />



                {/* Content */}
                <Suspense fallback={null}>
                    {children}
                    <Preload all />
                </Suspense>

                {/* Camera Controls */}
                {controls && (
                    <OrbitControls
                        enableZoom={true}
                        enablePan={false}
                        minDistance={2}
                        maxDistance={10}
                        autoRotate
                        autoRotateSpeed={0.5}
                    />
                )}
            </Canvas>
        </div>
    );
};

export default Scene;
