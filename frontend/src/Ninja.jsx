import React from "react";
import ninja from "../ninja.png";

const Ninja = ({ ninjaY }) => {
    const ninjaStyle = {
        position: "absolute",
        top: `${ninjaY}px`,
        left: "100px",
        width: "100px",
        height: "100px",
    };

    return <img src={ninja} alt="ICP ninja" style={ninjaStyle} />;
};

export default Ninja;
