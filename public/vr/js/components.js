/* global AFRAME */

/**
 * Hotspot Component
 * Shows a floating precision panel when hovered/clicked
 */
AFRAME.registerComponent('info-hotspot', {
    schema: {
        title: { type: 'string' },
        text: { type: 'string' }
    },

    init: function () {
        const data = this.data;
        const el = this.el;

        this.panel = null;

        // Interaction State
        el.addEventListener('mouseenter', () => {
            el.setAttribute('scale', '1.5 1.5 1.5');
            el.setAttribute('material', 'color', '#00FFFF'); // Cyan glow
            this.createPanel();
        });

        el.addEventListener('mouseleave', () => {
            el.setAttribute('scale', '1 1 1');
            el.setAttribute('material', 'color', '#FFF');
            this.removePanel();
        });
    },

    createPanel: function () {
        if (this.panel) return;

        // Create Glassmorphism UI Panel
        const panel = document.createElement('a-entity');
        panel.setAttribute('position', '0 1.5 0'); // Float above marker
        panel.setAttribute('geometry', 'primitive: plane; width: 3; height: 1.5');
        panel.setAttribute('material', 'color: #000; shader: flat; transparent: true; opacity: 0.8; side: double');
        panel.setAttribute('look-at', '#main-camera'); // Always face user

        // Title
        const title = document.createElement('a-text');
        title.setAttribute('value', this.data.title);
        title.setAttribute('color', '#FFD700'); // Gold
        title.setAttribute('align', 'center');
        title.setAttribute('position', '0 0.4 0.1');
        title.setAttribute('width', '5');
        title.setAttribute('font', 'exo2bold');

        // Body Text
        const text = document.createElement('a-text');
        text.setAttribute('value', this.data.text);
        text.setAttribute('color', '#EEE');
        text.setAttribute('align', 'center');
        text.setAttribute('position', '0 -0.1 0.1');
        text.setAttribute('width', '3.8');
        text.setAttribute('wrap-count', '30');

        panel.appendChild(title);
        panel.appendChild(text);

        this.el.appendChild(panel);
        this.panel = panel;
    },

    removePanel: function () {
        if (this.panel) {
            this.el.removeChild(this.panel);
            this.panel = null;
        }
    }
});

AFRAME.registerComponent('portal-interaction', {
    schema: {
        id: { type: 'string' },
        title: { type: 'string' }
    },
    init: function () {
        // Just for complex handling if needed later
    }
});
