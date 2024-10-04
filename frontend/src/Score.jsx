import React from "react";

const Score = ({ score }) => {
    const scoreStyle = {
        position: "absolute",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: "30px",
        color: "black",
    };

    return <div style={scoreStyle}>Score: {score}</div>;
};

export default Score;
