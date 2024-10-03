const Bird = ({ birdY }) => {
    const birdStyle = {
        position: "absolute",
        top: `${birdY}px`,
        left: "100px",
        width: "30px",
        height: "30px",
    };

    return <img src="/motoko.png" alt="Motoko Bird" style={birdStyle} />;
};

export default Bird;
