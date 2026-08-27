import React from 'react';

const OsrmDistance = ({ fallbackKm }) => {
    if (fallbackKm === undefined || fallbackKm === null) {
        return <span className="opacity-80">Calculating...</span>;
    }

    return (
        <span className="text-cyan-400 font-bold">
            {Math.round(fallbackKm)} km away
        </span>
    );
};

export default OsrmDistance;
