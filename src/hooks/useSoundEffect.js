import { useCallback, useRef } from 'react';

/**
 * A custom hook to play subtle UI sound effects.
 * @param {string} url - The URL of the sound file.
 * @param {number} volume - The volume level (0 to 1).
 * @returns {Function} - A function to trigger the sound.
 */
export const useSoundEffect = (url, volume = 0.2) => {
    const audioRef = useRef(null);

    const playSound = useCallback(() => {
        // Lazy initialize to avoid unnecessary objects
        if (!audioRef.current) {
            audioRef.current = new Audio(url);
        }

        // Reset and play for snappy feedback
        audioRef.current.currentTime = 0;
        audioRef.current.volume = volume;

        audioRef.current.play().catch(err => {
            // Browsers often block autoplay/unsolicited audio
            console.warn('Sound effect playback blocked:', err.message);
        });
    }, [url, volume]);

    return playSound;
};

export default useSoundEffect;
