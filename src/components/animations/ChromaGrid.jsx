import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

const ChromaGrid = ({ items, className = '', radius = 300, damping = 0.45, fadeOut = 0.6, ease = 'power3.out' }) => {
    const rootRef = useRef(null);
    const fadeRef = useRef(null);
    const setX = useRef(null);
    const setY = useRef(null);
    const pos = useRef({ x: 0, y: 0 });

    const demo = [
        {
            image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
            title: 'Paris, France',
            subtitle: 'City of Light',
            handle: 'Europe',
            borderColor: '#4F46E5',
            gradient: 'linear-gradient(145deg,#4F46E5,#000)',
        },
        {
            image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
            title: 'Tokyo, Japan',
            subtitle: 'Modern & Traditional',
            handle: 'Asia',
            borderColor: '#10B981',
            gradient: 'linear-gradient(210deg,#10B981,#000)',
        },
        {
            image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
            title: 'Bali, Indonesia',
            subtitle: 'Tropical Paradise',
            handle: 'SE Asia',
            borderColor: '#F59E0B',
            gradient: 'linear-gradient(165deg,#F59E0B,#000)',
        }
    ];

    const data = items?.length ? items : demo;

    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;
        setX.current = gsap.quickSetter(el, '--x', 'px');
        setY.current = gsap.quickSetter(el, '--y', 'px');
        const { width, height } = el.getBoundingClientRect();
        pos.current = { x: width / 2, y: height / 2 };
        setX.current(pos.current.x);
        setY.current(pos.current.y);
    }, []);

    const moveTo = (x, y) => {
        gsap.to(pos.current, {
            x,
            y,
            duration: damping,
            ease,
            onUpdate: () => {
                setX.current?.(pos.current.x);
                setY.current?.(pos.current.y);
            },
            overwrite: true
        });
    };

    const handleMove = e => {
        const r = rootRef.current.getBoundingClientRect();
        moveTo(e.clientX - r.left, e.clientY - r.top);
        gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
    };

    const handleLeave = () => {
        gsap.to(fadeRef.current, {
            opacity: 1,
            duration: fadeOut,
            overwrite: true
        });
    };

    const handleCardClick = (e, item) => {
        e.preventDefault();
        if (item.action) {
            item.action();
        } else if (item.url && item.url !== '#') {
            window.open(item.url, '_blank', 'noopener,noreferrer');
        }
    };

    const handleCardMove = e => {
        const c = e.currentTarget;
        const rect = c.getBoundingClientRect();
        c.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        c.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    };

    return (
        <div
            ref={rootRef}
            onPointerMove={handleMove}
            onPointerLeave={handleLeave}
            className={`relative w-full h-full flex flex-wrap justify-center items-start gap-6 ${className}`}
            style={{
                '--r': `${radius}px`,
                '--x': '50%',
                '--y': '50%'
            }}
        >
            {data.map((c, i) => (
                <article
                    key={i}
                    onMouseMove={handleCardMove}
                    onClick={(e) => handleCardClick(e, c)}
                    className="group relative flex flex-col w-[350px] rounded-[30px] overflow-hidden border-2 border-transparent transition-all duration-300 cursor-pointer hover:-translate-y-2"
                    style={{
                        '--card-border': c.borderColor || 'transparent',
                        background: c.gradient || 'linear-gradient(145deg, #1e293b, #000)',
                        '--spotlight-color': 'rgba(255,255,255,0.2)'
                    }}
                >
                    <div
                        className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-20 opacity-0 group-hover:opacity-100"
                        style={{
                            background:
                                'radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 70%)'
                        }}
                    />
                    <div className="relative z-10 flex-1 p-3 box-border h-[250px]">
                        <img
                            src={c.image}
                            alt={c.title}
                            loading="lazy"
                            className="w-full h-full object-cover rounded-[20px] transition-all duration-500 filter brightness-[0.65] contrast-[1.1] group-hover:brightness-[0.8]"
                        />
                    </div>
                    <footer className="relative z-10 p-6 text-white font-sans grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
                        <h3 className="m-0 text-xl font-bold">{c.title}</h3>
                        {c.handle && <span className="text-sm opacity-60 text-right uppercase tracking-widest">{c.handle}</span>}
                        <p className="m-0 text-sm opacity-80">{c.subtitle}</p>
                        {c.location && <span className="text-sm opacity-80 text-right">{c.location}</span>}
                    </footer>
                </article>
            ))}
            <div
                className="absolute inset-0 pointer-events-none z-30"
                style={{
                    backdropFilter: 'none',
                    WebkitBackdropFilter: 'none',
                    background: 'transparent',
                    maskImage:
                        'radial-gradient(circle var(--r) at var(--x) var(--y),transparent 0%,transparent 15%,rgba(0,0,0,0.02) 30%,rgba(0,0,0,0.05)45%,rgba(0,0,0,0.08)60%,rgba(0,0,0,0.12)75%,rgba(0,0,0,0.18)88%,rgba(0,0,0,0.25) 100%)',
                    WebkitMaskImage:
                        'radial-gradient(circle var(--r) at var(--x) var(--y),transparent 0%,transparent 15%,rgba(0,0,0,0.02) 30%,rgba(0,0,0,0.05)45%,rgba(0,0,0,0.08)60%,rgba(0,0,0,0.12)75%,rgba(0,0,0,0.18)88%,rgba(0,0,0,0.25) 100%)'
                }}
            />
            <div
                ref={fadeRef}
                className="absolute inset-0 pointer-events-none transition-opacity duration-[250ms] z-40"
                style={{
                    backdropFilter: 'none',
                    WebkitBackdropFilter: 'none',
                    background: 'transparent',
                    maskImage:
                        'radial-gradient(circle var(--r) at var(--x) var(--y),rgba(255,255,255,0.1) 0%,rgba(255,255,255,0.08) 15%,rgba(255,255,255,0.05)30%,rgba(255,255,255,0.03)45%,rgba(255,255,255,0.02)60%,transparent 100%)',
                    WebkitMaskImage:
                        'radial-gradient(circle var(--r) at var(--x) var(--y),rgba(255,255,255,0.1) 0%,rgba(255,255,255,0.08) 15%,rgba(255,255,255,0.05)30%,rgba(255,255,255,0.03)45%,rgba(255,255,255,0.02)60%,transparent 100%)',
                    opacity: 1
                }}
            />
        </div>
    );
};

export default ChromaGrid;
