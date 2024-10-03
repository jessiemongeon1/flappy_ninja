import { useEffect, useState } from "react";
import Motoko from "./Motoko";
import Pipes from "./Pipes";
import Score from "./Score";
import Leaderboard from "./Leaderboard";
import { backend } from "declarations/backend";

class SeededRNG {
    state0;
    state1;

    constructor(seed) {
        const view = new DataView(seed.buffer);
        this.state0 = view.getUint32(0, true);
        this.state1 = view.getUint32(4, true);
    }

    next() {
        let s1 = this.state0;
        const s0 = this.state1;
        this.state0 = s0;
        s1 ^= s1 << 23;
        s1 ^= s1 >> 17;
        s1 ^= s0;
        s1 ^= s0 >> 26;
        this.state1 = s1;
        return (s0 + s1) / 4294967296; // This already returns a number between 0 and 1
    }
}

const Game = () => {
    const gravity = 1;
    const jumpHeight = -10;
    const birdStartY = 200;
    const pipeStartX = 500;
    const gapHeight = 150;

    const [rng, setRng] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);

    // Add this function to fetch the leaderboard
    const fetchLeaderboard = async () => {
        try {
            const entries = await backend.getLeaderboard();
            setLeaderboard(entries);
        } catch (error) {
            console.error("Failed to fetch leaderboard:", error);
        }
    };

    // this is run once when the page is loaded
    useEffect(() => {
        const initialize = async () => {
            try {
                // fetch the leaderboard
                await fetchLeaderboard();
                // initialize the seed with randomness from the internet computer
                const randomness = await backend.getRandomness();
                const seed = new Uint8Array(randomness);

                // create a new SeededRNG with the first 8 bytes of the seed
                setRng(new SeededRNG(seed.slice(0, 8)));
            } catch (error) {
                console.error("Failed to initialize seed:", error);
            }
        };

        initialize();
    }, []);

    const [gameState, setGameState] = useState("initial");
    const [birdY, setBirdY] = useState(birdStartY);
    const [birdVelocity, setBirdVelocity] = useState(0);
    const [pipeX, setPipeX] = useState(pipeStartX);
    const [gapPosition, setGapPosition] = useState(100);
    const [score, setScore] = useState(0);
    const [showNameInput, setShowNameInput] = useState(false);
    const [playerName, setPlayerName] = useState("");

    const startGame = () => {
        setGameState("playing");
        resetGame();
    };

    const resetGame = () => {
        setBirdY(birdStartY);
        setBirdVelocity(0);
        setPipeX(pipeStartX);
        setGapPosition(100);
        setScore(0);
        setGameState("playing");
    };

    // Handle gravity and bird movement
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === " " && gameState === "playing") {
                setBirdVelocity(jumpHeight);
            }
        };
        window.addEventListener("keypress", handleKeyPress);

        return () => {
            window.removeEventListener("keypress", handleKeyPress);
        };
    }, [gameState]);

    useEffect(() => {
        let gameLoop;

        if (gameState === "playing" && rng) {
            gameLoop = setInterval(() => {
                setBirdY((prevY) =>
                    Math.min(prevY + birdVelocity, window.innerHeight - 30)
                );
                setBirdVelocity((prevVelocity) => prevVelocity + gravity);

                setPipeX((prevX) => {
                    if (prevX < -50) {
                        // rng.next() already returns a number between 0 and 1
                        setGapPosition(
                            rng.next() * (window.innerHeight - gapHeight)
                        );
                        setScore((prevScore) => prevScore + 1);
                        return window.innerWidth + 50;
                    }
                    return prevX - 5;
                });

                // Collision detection
                if (
                    birdY < 0 ||
                    birdY + 30 >= window.innerHeight ||
                    (pipeX < 130 &&
                        pipeX > 80 &&
                        (birdY < gapPosition ||
                            birdY > gapPosition + gapHeight))
                ) {
                    setGameState("gameOver");
                    checkHighScore();
                }
            }, 30);
        }

        return () => clearInterval(gameLoop);
    }, [birdY, birdVelocity, pipeX, gapPosition, gameState, rng]);

    const checkHighScore = async () => {
        const isHighScore = await backend.isHighScore(
            BigInt(score)
        );
        console.log("isHighScore", isHighScore);
        if (isHighScore) {
            setShowNameInput(true);
        }
    };

    const submitScore = async () => {
        if (playerName.trim() !== "") {
            await backend.addLeaderboardEntry(
                playerName,
                BigInt(score)
            );
            setShowNameInput(false);
            setGameState("gameOver");
            await fetchLeaderboard(); // update the leaderboard
        }
    };

    return (
        <div>
            {gameState === "initial" && (
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                    }}
                >
                    <h1>Flappy Bird</h1>
                    <p>Press the spacebar to make the bird jump.</p>
                    <p>Avoid the pipes and try to get the highest score!</p>
                    <button
                        onClick={startGame}
                        style={{
                            fontSize: "24px",
                            padding: "10px 20px",
                            cursor: "pointer",
                            marginBottom: "20px",
                        }}
                    >
                        Start Game
                    </button>
                    <Leaderboard entries={leaderboard} />
                </div>
            )}
            {gameState === "playing" && (
                <>
                    <Motoko birdY={birdY} />
                    <Pipes
                        pipeX={pipeX}
                        gapHeight={gapHeight}
                        gapPosition={gapPosition}
                    />
                </>
            )}
            <div style={{ position: "absolute", right: "150px" }}>
                <Score score={score} />
            </div>

            {gameState === "gameOver" && (
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                    }}
                >
                    <div style={{ fontSize: "50px", marginBottom: "20px" }}>
                        Game Over
                    </div>
                    <button
                        onClick={resetGame}
                        style={{
                            fontSize: "24px",
                            padding: "10px 20px",
                            cursor: "pointer",
                            marginBottom: "20px",
                        }}
                    >
                        Try Again
                    </button>
                    <Leaderboard entries={leaderboard} />
                    {showNameInput && (
                        <div
                            style={{
                                marginTop: "20px",
                                backgroundColor: "white",
                                padding: "20px",
                                borderRadius: "10px",
                            }}
                        >
                            <h2>New High Score!</h2>
                            <p>Enter your name:</p>
                            <input
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                style={{ marginBottom: "10px" }}
                            />
                            <button onClick={submitScore}>Submit</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Game;
