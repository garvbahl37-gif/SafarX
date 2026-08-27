// webxr-polyfill.js
// Adds WebXR support to browsers that use the older WebVR API

export const initWebXRPolyfill = async () => {
    // Check if we need the polyfill
    if (!navigator.xr) {
        try {
            const { default: WebXRPolyfill } = await import(
                'https://cdn.jsdelivr.net/npm/webxr-polyfill@latest/build/webxr-polyfill.module.js'
            );
            new WebXRPolyfill();
            console.log('WebXR Polyfill loaded');
        } catch (e) {
            console.warn('WebXR not available and polyfill failed to load');
        }
    }
};