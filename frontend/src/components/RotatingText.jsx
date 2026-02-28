'use client';

import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

const RotatingText = forwardRef((props, ref) => {
    const {
        texts,
        transition = { type: 'spring', damping: 22, stiffness: 280 },
        initial = { y: '110%', opacity: 0, scale: 0.94 },
        animate = { y: 0, opacity: 1, scale: 1 },
        exit = { y: '-110%', opacity: 0, scale: 0.94 },
        animatePresenceMode = 'wait',
        animatePresenceInitial = false,
        rotationInterval = 2200,
        staggerDuration = 0.025,
        staggerFrom = 'first',
        loop = true,
        auto = true,
        splitBy = 'characters',
        onNext,
        mainClassName,
        splitLevelClassName,
        elementLevelClassName,
        ...rest
    } = props;

    const [currentTextIndex, setCurrentTextIndex] = useState(0);

    /* ── Split helpers ── */
    const splitIntoCharacters = (text) => {
        if (typeof Intl !== 'undefined' && Intl.Segmenter) {
            const seg = new Intl.Segmenter('en', { granularity: 'grapheme' });
            return Array.from(seg.segment(text), (s) => s.segment);
        }
        return Array.from(text);
    };

    const elements = useMemo(() => {
        const current = texts[currentTextIndex];

        if (splitBy === 'characters') {
            return current.split(' ').map((word, i, arr) => ({
                characters: splitIntoCharacters(word),
                needsSpace: i !== arr.length - 1,
            }));
        }
        if (splitBy === 'words') {
            return current.split(' ').map((word, i, arr) => ({
                characters: [word],
                needsSpace: i !== arr.length - 1,
            }));
        }
        if (splitBy === 'lines') {
            return current.split('\n').map((line, i, arr) => ({
                characters: [line],
                needsSpace: i !== arr.length - 1,
            }));
        }
        return current.split(splitBy).map((part, i, arr) => ({
            characters: [part],
            needsSpace: i !== arr.length - 1,
        }));
    }, [texts, currentTextIndex, splitBy]);

    /* ── Stagger delay ── */
    const getStaggerDelay = useCallback(
        (index, total) => {
            if (staggerFrom === 'first') return index * staggerDuration;
            if (staggerFrom === 'last') return (total - 1 - index) * staggerDuration;
            if (staggerFrom === 'center') {
                const center = Math.floor(total / 2);
                return Math.abs(center - index) * staggerDuration;
            }
            if (staggerFrom === 'random') {
                return Math.abs(Math.floor(Math.random() * total) - index) * staggerDuration;
            }
            return Math.abs(staggerFrom - index) * staggerDuration;
        },
        [staggerFrom, staggerDuration]
    );

    /* ── Navigation ── */
    const handleIndexChange = useCallback(
        (newIndex) => {
            setCurrentTextIndex(newIndex);
            onNext?.(newIndex);
        },
        [onNext]
    );

    const next = useCallback(() => {
        const nextIdx =
            currentTextIndex === texts.length - 1
                ? loop ? 0 : currentTextIndex
                : currentTextIndex + 1;
        if (nextIdx !== currentTextIndex) handleIndexChange(nextIdx);
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    const previous = useCallback(() => {
        const prevIdx =
            currentTextIndex === 0
                ? loop ? texts.length - 1 : currentTextIndex
                : currentTextIndex - 1;
        if (prevIdx !== currentTextIndex) handleIndexChange(prevIdx);
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    const jumpTo = useCallback(
        (index) => {
            const valid = Math.max(0, Math.min(index, texts.length - 1));
            if (valid !== currentTextIndex) handleIndexChange(valid);
        },
        [texts.length, currentTextIndex, handleIndexChange]
    );

    const reset = useCallback(() => {
        if (currentTextIndex !== 0) handleIndexChange(0);
    }, [currentTextIndex, handleIndexChange]);

    useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }), [
        next, previous, jumpTo, reset,
    ]);

    useEffect(() => {
        if (!auto) return;
        const id = setInterval(next, rotationInterval);
        return () => clearInterval(id);
    }, [next, rotationInterval, auto]);

    /* ── Render ── */
    return (
        <motion.span
            className={cn('flex flex-wrap whitespace-pre-wrap relative', mainClassName)}
            {...rest}
            layout
            transition={transition}
        >
            <span className="sr-only">{texts[currentTextIndex]}</span>

            <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
                <motion.span
                    key={currentTextIndex}
                    className={cn(
                        splitBy === 'lines'
                            ? 'flex flex-col w-full'
                            : 'flex flex-wrap whitespace-pre-wrap relative'
                    )}
                    layout
                    aria-hidden
                >
                    {elements.map((wordObj, wordIndex, array) => {
                        const prevCount = array
                            .slice(0, wordIndex)
                            .reduce((sum, w) => sum + w.characters.length, 0);
                        const totalChars = array.reduce(
                            (sum, w) => sum + w.characters.length, 0
                        );

                        return (
                            <span
                                key={wordIndex}
                                className={cn('inline-flex', splitLevelClassName)}
                            >
                                {wordObj.characters.map((char, charIndex) => (
                                    <motion.span
                                        key={charIndex}
                                        initial={initial}
                                        animate={animate}
                                        exit={exit}
                                        transition={{
                                            ...transition,
                                            delay: getStaggerDelay(
                                                prevCount + charIndex,
                                                totalChars
                                            ),
                                        }}
                                        className={cn('inline-block', elementLevelClassName)}
                                    >
                                        {char}
                                    </motion.span>
                                ))}
                                {wordObj.needsSpace && (
                                    <span className="whitespace-pre"> </span>
                                )}
                            </span>
                        );
                    })}
                </motion.span>
            </AnimatePresence>
        </motion.span>
    );
});

RotatingText.displayName = 'RotatingText';
export default RotatingText;