import React from "react";

const Pipes = ({ pipeX, gapHeight, gapPosition }) => {
    const pipeWidth = 75;

    const pipeStyle = {
        position: "absolute",
        width: `${pipeWidth}px`,
        backgroundColor: "orange",
    };

    return (
        <>
            {/* Top pipe */}
            <div
                style={{
                    ...pipeStyle,
                    height: `${gapPosition}px`,
                    left: `${pipeX}px`,
                    top: "0px",
                }}
            ></div>
            {/* Bottom pipe */}
            <div
                style={{
                    ...pipeStyle,
                    left: `${pipeX}px`,
                    top: `${gapPosition + gapHeight}px`,
                    height: `calc(100vh - ${gapPosition + gapHeight}px)`,
                }}
            ></div>
        </>
    );
};

export default Pipes;
