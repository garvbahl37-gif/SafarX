import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, Html, Stars, Preload, Points, PointMaterial, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

/**
 * FullSphereStars - Renders stars everywhere in a complete sphere
 */
const FullSphereStars = () => {
    const pointsRef = useRef();
    const starCount = 10000;

    const [starPositions, starSizes, starColors] = useMemo(() => {
        const positions = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        const colors = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            // Random positions in a complete sphere (not just a band)
            const theta = Math.random() * Math.PI * 2; // Full 360° rotation
            const phi = Math.random() * Math.PI; // Full sphere from top to bottom
            const radius = 300 + Math.random() * 100; // Far background

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Variable star sizes for depth perception
            sizes[i] = Math.random() * 0.8 + 0.2;

            // Color variation (white, blue, yellowish)
            const colorChoice = Math.random();
            if (colorChoice < 0.7) {
                // White stars (70%)
                colors[i * 3] = 1;
                colors[i * 3 + 1] = 1;
                colors[i * 3 + 2] = 1;
            } else if (colorChoice < 0.85) {
                // Blue stars (15%)
                colors[i * 3] = 0.7;
                colors[i * 3 + 1] = 0.85;
                colors[i * 3 + 2] = 1;
            } else {
                // Yellowish stars (15%)
                colors[i * 3] = 1;
                colors[i * 3 + 1] = 0.9;
                colors[i * 3 + 2] = 0.6;
            }
        }
        return [positions, sizes, colors];
    }, []);

    // Gentle rotation
    useFrame(() => {
        if (pointsRef.current) {
            pointsRef.current.rotation.z += 0.00001;
        }
    });

    return (
        <Points ref={pointsRef} positions={starPositions}>
            <PointMaterial
                transparent
                size={0.5}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                color={new THREE.Color(0xffffff)}
            />
        </Points>
    );
};

/**
 * MarkerPulse - Animated glowing marker component
 */
const MarkerPulse = ({ position, label, color = '#ff6b6b', onClick }) => {
    const groupRef = useRef();
    const pulseRef = useRef();

    useFrame(({ clock }) => {
        if (pulseRef.current) {
            pulseRef.current.scale.multiplyScalar(0.95);
            pulseRef.current.scale.addScalar(0.05 + Math.sin(clock.elapsedTime * 3) * 0.02);
        }
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Glowing Core */}
            <mesh>
                <sphereGeometry args={[0.025, 16, 16]} />
                <meshBasicMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={1.5}
                />
            </mesh>

            {/* Pulsing Ring */}
            <mesh ref={pulseRef}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshBasicMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.5}
                    transparent
                    opacity={0.6}
                />
            </mesh>

            {/* Point Light for glow effect */}
            <pointLight color={color} intensity={0.8} distance={0.3} />

            {/* Interactive Label */}
            <Html
                position={[0, 0.08, 0]}
                center
                distanceFactor={2.5}
                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
            >
                <div
                    onClick={() => onClick?.()}
                    className="group relative"
                >
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg hover:shadow-2xl transition-all duration-200 hover:scale-125 whitespace-nowrap border border-blue-400/50">
                        {label}
                        <div className="absolute inset-0 bg-white/10 rounded-full blur-sm -z-10 group-hover:blur opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                </div>
            </Html>
        </group>
    );
};

/**
 * ShootingStar - Renders a bright meteor streaking across the sky
 */
const ShootingStar = () => {
    const ref = useRef();
    const trailRef = useRef();

    // Initial state and trajectory
    const config = useMemo(() => ({
        start: new THREE.Vector3(-40, 25, -40),
        end: new THREE.Vector3(10, -10, -10),
        speed: 0.8,
        interval: 4000 + Math.random() * 6000,
        active: false,
        startTime: 0
    }), []);

    useFrame(({ clock }) => {
        const time = clock.getElapsedTime() * 1000;

        if (!config.active && time > config.startTime + config.interval) {
            config.active = true;
            config.startTime = time;
            if (ref.current) ref.current.visible = true;
        }

        if (config.active) {
            const progress = (time - config.startTime) / 1500; // Duration of 1.5s

            if (progress >= 1) {
                config.active = false;
                config.startTime = time;
                config.interval = 5000 + Math.random() * 8000;
                if (ref.current) ref.current.visible = false;
            } else {
                if (ref.current) {
                    ref.current.position.lerpVectors(config.start, config.end, progress);
                    // Add some wobble
                    ref.current.position.y += Math.sin(progress * 10) * 0.1;
                }
            }
        }
    });

    return (
        <group ref={ref} visible={false}>
            {/* Bright Head */}
            <mesh>
                <sphereGeometry args={[0.15, 12, 12]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>
            <pointLight intensity={2} distance={10} color="#88ccff" />

            {/* Glowing Trail */}
            <mesh rotation={[0, 0, Math.PI / 4]}>
                <cylinderGeometry args={[0.02, 0.15, 5, 8]} />
                <meshBasicMaterial
                    color="#4fc3dc"
                    transparent
                    opacity={0.4}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 4]} position={[0, 0, 0]}>
                <cylinderGeometry args={[0.01, 0.08, 8, 8]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.6}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    );
};

/**
 * MilkyWay - Renders a dense band of stars and colorful nabulae
 */
const MilkyWay = ({ position = [40, 20, -50], rotation = [0.5, -0.4, 0.2] }) => {
    const starCount = 4000;
    const nebulaCount = 40;

    const [starPos, starSizes] = useMemo(() => {
        const pos = new Float32Array(starCount * 3);
        const sz = new Float32Array(starCount);
        for (let i = 0; i < starCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 25 + Math.random() * 45;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * (radius * 0.4);
            const y = (Math.random() - 0.5) * 8;

            pos[i * 3] = x;
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = z;
            sz[i] = Math.random() * 0.4 + 0.1;
        }
        return [pos, sz];
    }, []);

    const nebulae = useMemo(() => {
        const colors = ['#4b2e83', '#00d4ff', '#ff00ff', '#2a2a4e'];
        return Array.from({ length: nebulaCount }).map(() => {
            const angle = Math.random() * Math.PI * 2;
            const radius = 20 + Math.random() * 30;
            return {
                position: [
                    Math.cos(angle) * radius,
                    (Math.random() - 0.5) * 10,
                    Math.sin(angle) * (radius * 0.5)
                ],
                scale: [5 + Math.random() * 15, 2 + Math.random() * 5, 5 + Math.random() * 10],
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: 0.03 + Math.random() * 0.05
            };
        });
    }, []);

    return (
        <group position={position} rotation={rotation}>
            {/* Stars */}
            <Points positions={starPos} sizes={starSizes}>
                <PointMaterial
                    transparent
                    color="#fff0ff"
                    size={0.15}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </Points>

            {/* Nebula Clouds */}
            {nebulae.map((neb, i) => (
                <mesh key={i} position={neb.position} scale={neb.scale}>
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshBasicMaterial
                        color={neb.color}
                        transparent
                        opacity={neb.opacity}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                    />
                </mesh>
            ))}

            {/* Core Glow */}
            <mesh scale={[35, 12, 25]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial
                    color="#3a1c71"
                    transparent
                    opacity={0.08}
                    blending={THREE.AdditiveBlending}
                    side={THREE.BackSide}
                    depthWrite={false}
                />
            </mesh>
        </group>
    );
};

/**
 * GlobeCore - The actual 3D Earth component with enhanced visuals
 */
const GlobeCore = ({
    markers = [],
    autoRotate = true,
    rotationSpeed = 0.001,
    onClick
}) => {
    const meshRef = useRef();
    const cloudsRef = useRef();
    const atmosphereRef = useRef();

    // Load textures
    const textures = useTexture({
        earth: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/planets/earth_atmos_2048.jpg',
        bump: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/planets/earth_specular_2048.jpg',
        clouds: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/planets/earth_clouds_1024.png',
    });

    useFrame(({ clock }) => {
        if (autoRotate && meshRef.current) {
            meshRef.current.rotation.y += rotationSpeed;
        }
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y += rotationSpeed * 1.3;
        }
        // Subtle atmosphere pulse
        if (atmosphereRef.current) {
            atmosphereRef.current.material.uniforms.intensity.value = 0.6 + Math.sin(clock.elapsedTime) * 0.1;
        }
    });

    const latLngToVector3 = (lat, lng, radius = 1.025) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);

        return new THREE.Vector3(
            -radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
    };

    // Enhanced atmosphere shader with pulsing effect
    const atmosphereShader = useMemo(() => ({
        uniforms: {
            glowColor: { value: new THREE.Color('#00d4ff') },
            intensity: { value: 0.6 }
        },
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            uniform vec3 glowColor;
            uniform float intensity;
            void main() {
                float glow = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                gl_FragColor = vec4(glowColor, intensity) * glow * 1.2;
            }
        `,
    }), []);

    return (
        <group>
            {/* Earth with Enhanced Materials */}
            <mesh ref={meshRef} onClick={onClick}>
                <sphereGeometry args={[1, 128, 128]} />
                <meshStandardMaterial
                    map={textures.earth}
                    bumpMap={textures.bump}
                    bumpScale={0.08}
                    metalness={0.05}
                    roughness={0.85}
                    emissive="#2a2a4e"
                    emissiveIntensity={0.4}
                />
            </mesh>

            {/* Enhanced Cloud Layer */}
            <mesh ref={cloudsRef}>
                <sphereGeometry args={[1.008, 128, 128]} />
                <meshStandardMaterial
                    map={textures.clouds}
                    transparent
                    opacity={0.5}
                    depthWrite={false}
                    emissive="#88ccff"
                    emissiveIntensity={0.1}
                />
            </mesh>

            {/* Outer Glow Atmosphere */}
            <mesh ref={atmosphereRef} scale={[1.2, 1.2, 1.2]}>
                <sphereGeometry args={[1, 64, 64]} />
                <shaderMaterial
                    {...atmosphereShader}
                    transparent
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Enhanced Destination Markers with Animation */}
            {markers.map((marker, index) => {
                const position = latLngToVector3(marker.lat, marker.lng);
                return (
                    <MarkerPulse
                        key={index}
                        position={position}
                        label={marker.label}
                        color={marker.color || '#ff6b6b'}
                        onClick={() => marker.onClick?.(marker)}
                    />
                );
            })}
        </group>
    );
};

/**
 * FallbackGlobe - Enhanced loading state
 */
const FallbackGlobe = () => {
    const meshRef = useRef();

    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.002;
            meshRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.5) * 0.2;
        }
    });

    return (
        <group>
            <mesh ref={meshRef}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial color="#0a47a4" wireframe strokeWidth={2} />
            </mesh>
            <mesh scale={[1.15, 1.15, 1.15]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial
                    color="#00d4ff"
                    wireframe
                    opacity={0.3}
                    transparent
                />
            </mesh>
        </group>
    );
};

/**
 * Globe - Self-contained 3D Globe with enhanced visuals
 */
const Globe = ({
    markers = [],
    autoRotate = false,
    rotationSpeed = 0.001,
    onClick,
    cameraPosition = [0, 0, 2.8],
    showStars = false, // Default to false as requested
    showBackgroundVideo = true,
    backgroundVideoUrl = "/frontbg-2.mp4",
    className = ''
}) => {
    return (
        <div className={`w-full h-full relative overflow-hidden ${className}`}>
            {/* Background Video */}
            {showBackgroundVideo && (
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
                        opacity: 0.8,
                        pointerEvents: 'none',
                    }}
                >
                    <source src={backgroundVideoUrl} type="video/mp4" />
                </video>
            )}
            <Canvas
                camera={{ position: cameraPosition, fov: 50 }}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance',
                    failIfMajorPerformanceCaveat: false
                }}
                dpr={[1, 1.5]}
                style={{
                    background: 'transparent',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                {/* Advanced Lighting Setup */}
                <ambientLight intensity={2.3} color="#ffffff" />
                <directionalLight position={[15, 10, 8]} intensity={2.5} color="#ffffff" />
                <directionalLight position={[-15, -10, -8]} intensity={0.8} color="#4fc3dc" />
                <pointLight position={[10, 10, 10]} intensity={0.8} color="#00d4ff" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff6b6b" />

                {/* Full Sphere Star Field - Stars Everywhere! */}
                {showStars && (
                    <group>
                        {/* New: Full Sphere Stars Background */}
                        <FullSphereStars />

                        {/* Original stars still there for extra depth */}
                        <Stars
                            radius={300}
                            depth={100}
                            count={50000}
                            factor={9}
                            saturation={0.8}
                            fade
                            speed={0.5}
                        />
                        <ShootingStar />
                        <MilkyWay />

                        {/* Subtle Blue Atmospheric Glow - Reduced opacity */}
                        <mesh scale={[100, 100, 100]}>
                            <sphereGeometry args={[1, 32, 32]} />
                            <meshBasicMaterial
                                color="#001a33"
                                side={THREE.BackSide}
                                transparent
                                opacity={0.05}
                                blending={THREE.AdditiveBlending}
                            />
                        </mesh>
                    </group>
                )}

                {/* Globe with Suspense */}
                <Suspense fallback={<FallbackGlobe />}>
                    <GlobeCore
                        markers={markers}
                        autoRotate={autoRotate}
                        rotationSpeed={rotationSpeed}
                        onClick={onClick}
                    />
                    <Preload all />
                </Suspense>

                {/* Controls - Mouse Interaction */}
                <OrbitControls
                    enableZoom={true}
                    enablePan={true}
                    rotateSpeed={0.5}
                    minPolarAngle={Math.PI / 3.5}
                    maxPolarAngle={Math.PI / 1.5}
                />
            </Canvas>
        </div>
    );
};

export default Globe;
