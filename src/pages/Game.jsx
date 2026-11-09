
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ArrowLeft,
  Volume2,
  Settings,
  Trophy,
  RefreshCw,
  Play,
} from "lucide-react";

import { dealCards } from "../engine/deck";
import { calculateComputerBid } from "../engine/bidding";
import {
  getLegalCards,
  getComputerMove,
  determineTrickWinner,
  TRUMP_SUIT,
} from "../engine/gameplay";

import "../styles/game.css";

function Game({ onBack, playerName = "Player" }) {
  // ----------------------------------
  // PLAYER INFORMATION
  // ----------------------------------

  const currentPlayerName =
    playerName?.trim() ||
    localStorage.getItem("callbreakPlayerName")?.trim() ||
    "Player";

  const players = useMemo(
    () => [
      { id: 0, name: "Computer 1", position: "top", avatar: "🤖" },
      { id: 1, name: "Computer 2", position: "left", avatar: "🎮" },
      { id: 2, name: "Computer 3", position: "right", avatar: "🧠" },
      { id: 3, name: currentPlayerName, position: "bottom", avatar: "👤" },
    ],
    [currentPlayerName]
  );

  const playerNames = useMemo(
    () => players.map((player) => player.name),
    [players]
  );

  // ----------------------------------
  // CARD STATE
  // ----------------------------------

  const [hands, setHands] = useState(() => dealCards());

  const [playedCards, setPlayedCards] = useState([]);
  const [tricksWon, setTricksWon] = useState([0, 0, 0, 0]);

  // ----------------------------------
  // BIDDING STATE
  // ----------------------------------

  const [selectedBid, setSelectedBid] = useState(2);
  const [computerBids, setComputerBids] = useState([
    null,
    null,
    null,
  ]);

  const [bidConfirmed, setBidConfirmed] = useState(false);

  // ----------------------------------
  // GAMEPLAY STATE
  // ----------------------------------

  const [gameStarted, setGameStarted] = useState(false);
  const [turn, setTurn] = useState(3);

  const [trickWinner, setTrickWinner] = useState(null);
  const [trickComplete, setTrickComplete] = useState(false);

  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState(
    "Place your bid to begin."
  );

  // ----------------------------------
  // TOURNAMENT STATE
  // ----------------------------------

  const [roundNumber, setRoundNumber] = useState(1);

  const [totalScores, setTotalScores] = useState([
    0, 0, 0, 0,
  ]);

  const [roundScores, setRoundScores] = useState(null);
  const [roundHistory, setRoundHistory] = useState([]);

  const [tournamentComplete, setTournamentComplete] =
    useState(false);

  // ----------------------------------
  // DERIVED BIDS
  // ----------------------------------

  const bids = [
    computerBids[0],
    computerBids[1],
    computerBids[2],
    bidConfirmed ? selectedBid : null,
  ];

  // ----------------------------------
  // CONFIRM BIDS
  // ----------------------------------

  const confirmBid = () => {
    if (bidConfirmed || gameStarted || gameOver) return;

    const generatedBids = [
      calculateComputerBid(hands[0]),
      calculateComputerBid(hands[1]),
      calculateComputerBid(hands[2]),
    ];

    setComputerBids(generatedBids);
    setBidConfirmed(true);

    setMessage("All players have placed their bids.");
  };

  // ----------------------------------
  // START PLAYING
  // ----------------------------------

  const startPlaying = () => {
    if (!bidConfirmed || gameStarted || gameOver) return;

    setGameStarted(true);
    setTurn(3);

    setMessage("Your turn! Choose a card to play.");
  };

  // ----------------------------------
  // OFFICIAL CALLBREAK SCORING
  // ----------------------------------

  const calculateRoundScores = (finalTricks, finalBids) => {
    return finalTricks.map((won, index) => {
      const bid = finalBids[index];

      if (won < bid) {
        return -bid;
      }

      const overTricks = won - bid;

      return Number((bid + overTricks / 10).toFixed(1));
    });
  };

  // ----------------------------------
  // PLAY CARD
  // ----------------------------------

  const handlePlayCard = useCallback(
    (playerId, card) => {
      if (
        !gameStarted ||
        gameOver ||
        trickComplete ||
        turn !== playerId
      ) {
        return;
      }

      const playerHand = hands[playerId];

      if (!playerHand) return;

      const cardExists = playerHand.some(
        (item) => item.id === card.id
      );

      if (!cardExists) return;

      // FOLLOW SUIT VALIDATION

      const leadSuit =
        playedCards.length > 0
          ? playedCards[0].card.suit
          : null;

      const legalCards = getLegalCards(
        playerHand,
        leadSuit
      );

      const isLegal = legalCards.some(
        (item) => item.id === card.id
      );

      if (!isLegal) {
        if (playerId === 3) {
          setMessage(`You must follow ${leadSuit}.`);
        }

        return;
      }

      // REMOVE PLAYED CARD

      const updatedHands = hands.map((hand, index) =>
        index === playerId
          ? hand.filter((item) => item.id !== card.id)
          : hand
      );

      // ADD CARD TO TABLE

      const nextPlayedCards = [
        ...playedCards,
        { playerId, card },
      ];

      setHands(updatedHands);
      setPlayedCards(nextPlayedCards);

      // --------------------------------
      // FOUR CARDS = ONE TRICK
      // --------------------------------

      if (nextPlayedCards.length === 4) {
        const winnerId = determineTrickWinner(
          nextPlayedCards
        );

        if (winnerId === null) return;

        const finalTricksWon = tricksWon.map(
          (count, index) =>
            index === winnerId ? count + 1 : count
        );

        setTricksWon(finalTricksWon);
        setTrickWinner(winnerId);
        setTurn(winnerId);
        setTrickComplete(true);

        setMessage(
          `${playerNames[winnerId]} won this trick!`
        );

        // CHECK WHETHER ALL 13 TRICKS ARE COMPLETED

        const allCardsPlayed = updatedHands.every(
          (hand) => hand.length === 0
        );

        if (allCardsPlayed) {
          const finalBids = [
            computerBids[0],
            computerBids[1],
            computerBids[2],
            selectedBid,
          ];

          // CALCULATE ROUND SCORE

          const calculatedScores = calculateRoundScores(
            finalTricksWon,
            finalBids
          );

          setRoundScores(calculatedScores);

          // SAVE ROUND HISTORY

          setRoundHistory((previousHistory) => [
            ...previousHistory,
            {
              round: roundNumber,
              bids: [...finalBids],
              tricks: [...finalTricksWon],
              scores: [...calculatedScores],
            },
          ]);

          // UPDATE TOTAL TOURNAMENT SCORE

          setTotalScores((previousScores) =>
            previousScores.map(
              (score, index) =>
                Number(
                  (score + calculatedScores[index]).toFixed(1)
                )
            )
          );

          setGameOver(true);

          if (roundNumber === 5) {
            setTournamentComplete(true);
            setMessage(
              "Tournament completed! Final results are ready."
            );
          } else {
            setMessage(
              `Round ${roundNumber} completed!`
            );
          }
        }
      } else {
        // NEXT PLAYER'S TURN

        const nextPlayer = (playerId + 1) % 4;

        setTurn(nextPlayer);

        setMessage(
          nextPlayer === 3
            ? "Your turn! Choose a card."
            : `${playerNames[nextPlayer]} is thinking...`
        );
      }
    },
    [
      gameStarted,
      gameOver,
      trickComplete,
      turn,
      hands,
      playedCards,
      tricksWon,
      computerBids,
      selectedBid,
      roundNumber,
      playerNames,
    ]
  );

  // ----------------------------------
  // CLEAR COMPLETED TRICK
  // ----------------------------------

  useEffect(() => {
    if (!trickComplete || gameOver) return;

    const timer = setTimeout(() => {
      setPlayedCards([]);
      setTrickComplete(false);
      setTrickWinner(null);

      setMessage(
        turn === 3
          ? "Your turn! Choose a card."
          : `${playerNames[turn]} is playing...`
      );
    }, 1400);

    return () => clearTimeout(timer);
  }, [
    trickComplete,
    gameOver,
    turn,
    playerNames,
  ]);

  // ----------------------------------
  // COMPUTER AUTOMATIC PLAY
  // ----------------------------------

  useEffect(() => {
    if (
      !gameStarted ||
      gameOver ||
      trickComplete ||
      turn === 3
    ) {
      return;
    }

    const timer = setTimeout(() => {
      const computerHand = hands[turn];

      if (!computerHand || computerHand.length === 0) {
        return;
      }

      const computerCard = getComputerMove(
        computerHand,
        playedCards
      );

      if (computerCard) {
        handlePlayCard(turn, computerCard);
      }
    }, 900);

    return () => clearTimeout(timer);
  }, [
    gameStarted,
    gameOver,
    trickComplete,
    turn,
    hands,
    playedCards,
    handlePlayCard,
  ]);

  // ----------------------------------
  // RESET CURRENT ROUND
  // ----------------------------------

  const resetCurrentRound = () => {
    setHands(dealCards());

    setSelectedBid(2);
    setComputerBids([null, null, null]);
    setBidConfirmed(false);

    setGameStarted(false);
    setTurn(3);

    setPlayedCards([]);
    setTricksWon([0, 0, 0, 0]);

    setTrickWinner(null);
    setTrickComplete(false);

    setGameOver(false);
    setRoundScores(null);

    setMessage("New deal ready. Place your bid!");
  };

  // ----------------------------------
  // NEW DEAL - SAME ROUND
  // ----------------------------------

  const restartDeal = () => {
    if (tournamentComplete) return;

    resetCurrentRound();
  };

  // ----------------------------------
  // NEXT ROUND
  // ----------------------------------

  const startNextRound = () => {
    if (!gameOver || roundNumber >= 5) return;

    setRoundNumber((previous) => previous + 1);

    resetCurrentRound();
  };

  // ----------------------------------
  // RESTART FULL TOURNAMENT
  // ----------------------------------

  const restartTournament = () => {
    setRoundNumber(1);

    setTotalScores([0, 0, 0, 0]);
    setRoundHistory([]);

    setRoundScores(null);
    setTournamentComplete(false);

    resetCurrentRound();
  };

  // ----------------------------------
  // LEGAL HUMAN CARDS
  // ----------------------------------

  const legalPlayerCards =
    gameStarted &&
    turn === 3 &&
    !gameOver &&
    !trickComplete
      ? getLegalCards(
          hands[3],
          playedCards.length > 0
            ? playedCards[0].card.suit
            : null
        )
      : [];

  const isCardLegal = (card) =>
    legalPlayerCards.some(
      (legalCard) => legalCard.id === card.id
    );

  // ----------------------------------
  // TOURNAMENT WINNER
  // ----------------------------------

  const highestScore = Math.max(...totalScores);

  const tournamentWinners = players.filter(
    (player) => totalScores[player.id] === highestScore
  );

  // ----------------------------------
  // TRICKS COMPLETED
  // ----------------------------------

  const completedTricks = tricksWon.reduce(
    (total, count) => total + count,
    0
  );

  // ----------------------------------
  // CURRENT TURN STATUS
  // ----------------------------------

  const statusTitle = tournamentComplete
    ? "Tournament Completed"
    : gameOver
    ? `Round ${roundNumber} Completed`
    : trickComplete
    ? `${playerNames[trickWinner]} won the trick!`
    : gameStarted
    ? turn === 3
      ? "Your Turn"
      : `${playerNames[turn]}'s Turn`
    : bidConfirmed
    ? "Ready to Play"
    : "Waiting for Bids";

  const statusDescription = gameStarted && !gameOver
    ? turn === 3
      ? "Choose a card from your hand."
      : "Computer is thinking and choosing a card."
    : gameOver
    ? "Check the round results."
    : bidConfirmed
    ? "All bids are confirmed. Start playing!"
    : "Place your bid to start the game.";

  // ----------------------------------
  // UI
  // ----------------------------------

  return (
    <main className="game-page">

      {/* HEADER */}

      <header className="game-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={18} />
          Home
        </button>

        <div className="game-logo">
          <span>♠</span> CALLBREAK
        </div>

        <div className="game-actions">
          <button aria-label="Sound">
            <Volume2 />
          </button>

          <button aria-label="Settings">
            <Settings />
          </button>
        </div>
      </header>

      <section className="game-content">

        {/* ROUND INFORMATION */}

        <div className="round-info">
          <span>
            ROUND {String(roundNumber).padStart(2, "0")} / 05
          </span>

          <div className="round-actions">
            <button
              className="round-new-deal-btn"
              onClick={restartDeal}
              disabled={tournamentComplete}
              title="Start a new deal in this round"
            >
              <RefreshCw size={14} />
              NEW DEAL
            </button>

            <span className="trump-label">
              ♠ {TRUMP_SUIT.toUpperCase()} · TRUMP
            </span>
          </div>
        </div>

        {/* GAME TABLE */}

        <div className="game-table">

          {/* PLAYER SEATS */}

          {players.map((player) => {
            const bid = bids[player.id];

            return (
              <div
                key={player.id}
                className={`player-seat ${player.position} ${
                  gameStarted &&
                  turn === player.id &&
                  !gameOver
                    ? "active-player"
                    : ""
                }`}
              >
                <div className="player-avatar">
                  {player.avatar}
                </div>

                <div className="player-details">
                  <strong title={player.name}>
                    {player.name}
                  </strong>

                  <small>
                    {gameOver
                      ? "ROUND COMPLETE"
                      : gameStarted &&
                        turn === player.id
                      ? "PLAYING"
                      : bidConfirmed
                      ? "BID CONFIRMED"
                      : "WAITING"}
                  </small>
                </div>

                <div className="player-score">
                  <span>Bid: {bid ?? "--"}</span>

                  <span>
                    Won: {tricksWon[player.id]}
                  </span>

                  <span>
                    Score: {totalScores[player.id].toFixed(1)}
                  </span>

                  <span>
                    Cards: {hands[player.id].length}
                  </span>
                </div>
              </div>
            );
          })}

          {/* TABLE CENTER */}

          <div className="table-center">
            <div className="table-emblem">♠</div>

            <h2>CALLBREAK</h2>

            <p>{message}</p>

            <div className="table-cards played-card-area">
              {playedCards.length > 0 ? (
                playedCards.map((play) => (
                  <div
                    className="table-played-card"
                    key={`${play.playerId}-${play.card.id}`}
                  >
                    <small>
                      {playerNames[play.playerId]}
                    </small>

                    <div
                      className={`mini-playing-card ${play.card.color}`}
                    >
                      <strong>{play.card.rank}</strong>
                      <span>{play.card.symbol}</span>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <span>♠</span>
                  <span>♥</span>
                  <span>♦</span>
                  <span>♣</span>
                </>
              )}
            </div>

            {trickWinner !== null && (
              <div className="trick-winner-message">
                Trick winner: {playerNames[trickWinner]}
              </div>
            )}
          </div>
        </div>

        {/* BIDDING + LIVE STATUS */}

        <div className="game-controls-layout">

          {/* LEFT: MAKE YOUR CALL */}

          <div className="bidding-section">

            <div className="bidding-heading">
              <div>
                <h3>
                  {gameOver
                    ? tournamentComplete
                      ? "TOURNAMENT COMPLETED"
                      : "ROUND COMPLETED"
                    : gameStarted
                    ? "CARD PLAYING"
                    : bidConfirmed
                    ? "BIDDING COMPLETE"
                    : "MAKE YOUR CALL"}
                </h3>

                <p>
                  {gameOver
                    ? "All 13 tricks have been played."
                    : gameStarted
                    ? message
                    : bidConfirmed
                    ? "All players have confirmed their bids."
                    : "How many tricks do you think you can win?"}
                </p>
              </div>

              <Trophy size={26} />
            </div>

            {/* BID OPTIONS */}

            {!bidConfirmed && (
              <>
                <div className="bid-options">
                  {Array.from(
                    { length: 13 },
                    (_, index) => index + 1
                  ).map((bid) => (
                    <button
                      key={bid}
                      className={
                        selectedBid === bid
                          ? "active-bid"
                          : ""
                      }
                      onClick={() => setSelectedBid(bid)}
                    >
                      {bid}
                    </button>
                  ))}
                </div>

                <button
                  className="confirm-bid"
                  onClick={confirmBid}
                >
                  CONFIRM YOUR BID →
                </button>
              </>
            )}

            {/* START PLAYING */}

            {bidConfirmed &&
              !gameStarted &&
              !gameOver && (
                <button
                  className="confirm-bid"
                  onClick={startPlaying}
                >
                  <Play size={16} />
                  START PLAYING
                </button>
              )}

            {/* ROUND RESULTS */}

            {gameOver && roundScores && (
              <div className="round-results">
                <h4>
                  {tournamentComplete
                    ? "FINAL TOURNAMENT RESULTS"
                    : `ROUND ${roundNumber} RESULTS`}
                </h4>

                {players.map((player) => (
                  <div
                    className="result-row"
                    key={player.id}
                  >
                    <span>{player.name}</span>

                    <span>
                      Bid: {bids[player.id]}
                    </span>

                    <span>
                      Won: {tricksWon[player.id]}
                    </span>

                    <strong
                      className={
                        roundScores[player.id] < 0
                          ? "negative-score"
                          : ""
                      }
                    >
                      {roundScores[player.id] > 0
                        ? "+"
                        : ""}
                      {roundScores[player.id].toFixed(1)}
                    </strong>

                    <span>
                      Total: {totalScores[player.id].toFixed(1)}
                    </span>
                  </div>
                ))}

                {tournamentComplete && (
                  <p className="tournament-winner">
                    🏆 Winner:{" "}
                    {tournamentWinners
                      .map((player) => player.name)
                      .join(" & ")}
                  </p>
                )}

                {!tournamentComplete && (
                  <button
                    className="confirm-bid"
                    onClick={startNextRound}
                  >
                    <Play size={16} />
                    START ROUND {roundNumber + 1}
                  </button>
                )}

                {tournamentComplete && (
                  <button
                    className="confirm-bid"
                    onClick={restartTournament}
                  >
                    <RefreshCw size={16} />
                    NEW TOURNAMENT
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: LIVE GAME STATUS */}

          <div className="turn-status-panel">
            <div className="turn-status-header">
              <span className="status-dot"></span>
              LIVE GAME STATUS
            </div>

            <h3>{statusTitle}</h3>

            <p>{statusDescription}</p>

            <div className="status-divider"></div>

            <div className="status-detail">
              <span>Current Round</span>
              <strong>{roundNumber} / 5</strong>
            </div>

            <div className="status-detail">
              <span>Tricks Completed</span>
              <strong>{completedTricks} / 13</strong>
            </div>

            <div className="status-detail">
              <span>Trump Suit</span>
              <strong>♠ Spades</strong>
            </div>
          </div>
        </div>

        {/* PLAYER HAND */}

        <div className="player-hand">

          <div className="hand-label">
            <span>
              {currentPlayerName.toUpperCase()}'S CARDS
            </span>

            <span>{hands[3].length} CARDS</span>
          </div>

          <div className="real-card-row">
            {hands[3].map((card) => {
              const canPlay =
                gameStarted &&
                turn === 3 &&
                !gameOver &&
                !trickComplete &&
                isCardLegal(card);

              return (
                <button
                  type="button"
                  className={`real-card ${card.color} ${
                    canPlay
                      ? "playable-card"
                      : "disabled-card"
                  }`}
                  key={card.id}
                  disabled={!canPlay}
                  onClick={() => handlePlayCard(3, card)}
                  title={
                    canPlay
                      ? `Play ${card.rank} of ${card.suit}`
                      : "Wait for your turn or follow suit"
                  }
                >
                  <div className="card-corner">
                    <strong>{card.rank}</strong>
                    <span>{card.symbol}</span>
                  </div>

                  <div className="card-center-symbol">
                    {card.symbol}
                  </div>

                  <div className="card-corner bottom-corner">
                    <strong>{card.rank}</strong>
                    <span>{card.symbol}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {!gameStarted && !gameOver && (
            <p className="hand-hint">
              Confirm your bid and start the game to play your cards.
            </p>
          )}

          {gameStarted && !gameOver && (
            <p className="hand-hint">
              {turn === 3
                ? playedCards.length > 0
                  ? `Follow suit: ${playedCards[0].card.suit}`
                  : "Your turn — select a card."
                : `${playerNames[turn]} is playing...`}
            </p>
          )}
        </div>

      </section>
    </main>
  );
}

export default Game;
