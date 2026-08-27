import React from "react";

/**
 * Distance readout — Space Grotesk, gold, matching the SafarX meta rows.
 */
const OsrmDistance = ({ fallbackKm }) => {
    if (fallbackKm === undefined || fallbackKm === null) {
        return (
            <span className="font-data text-[11px] uppercase tracking-[0.14em] text-ivory-faint">
                Measuring
            </span>
        );
    }

    return (
        <span className="font-data text-[11px] font-medium uppercase tracking-[0.14em] text-saffron">
            {Math.round(fallbackKm)} km away
        </span>
    );
};

export default OsrmDistance;
