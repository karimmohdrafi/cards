
export const TRUMP_SUIT = "Spades";

// Cards must follow the leading suit whenever possible.
export function getLegalCards(hand, leadSuit) {
  if (!leadSuit) return hand;

  const matchingCards = hand.filter(
    (card) => card.suit === leadSuit
  );

  return matchingCards.length > 0 ? matchingCards : hand;
}

// Find the highest card in the winning suit.
// Spades are trump.
export function determineTrickWinner(playedCards) {
  if (!playedCards || playedCards.length !== 4) {
    return null;
  }

  const leadSuit = playedCards[0].card.suit;

  const trumpCards = playedCards.filter(
    (play) => play.card.suit === TRUMP_SUIT
  );

  const winningSuit =
    trumpCards.length > 0 ? TRUMP_SUIT : leadSuit;

  const winningCards = playedCards.filter(
    (play) => play.card.suit === winningSuit
  );

  const winner = winningCards.reduce((best, current) =>
    current.card.value > best.card.value ? current : best
  );

  return winner.playerId;
}

// Determine the current winning card before all four players finish.
function getCurrentWinningPlay(playedCards) {
  if (!playedCards.length) return null;

  const leadSuit = playedCards[0].card.suit;

  const trumpCards = playedCards.filter(
    (play) => play.card.suit === TRUMP_SUIT
  );

  const winningSuit =
    trumpCards.length > 0 ? TRUMP_SUIT : leadSuit;

  const candidates = playedCards.filter(
    (play) => play.card.suit === winningSuit
  );

  return candidates.reduce((best, current) =>
    current.card.value > best.card.value ? current : best
  );
}

// Computer AI selects a legal card.
export function getComputerMove(hand, playedCards) {
  if (!hand || hand.length === 0) return null;

  const leadSuit =
    playedCards.length > 0
      ? playedCards[0].card.suit
      : null;

  const legalCards = getLegalCards(hand, leadSuit);

  if (legalCards.length === 0) return null;

  const sortedCards = [...legalCards].sort(
    (a, b) => a.value - b.value
  );

  // When leading, prefer a non-trump card.
  if (playedCards.length === 0) {
    return (
      sortedCards.find((card) => card.suit !== TRUMP_SUIT) ||
      sortedCards[0]
    );
  }

  const currentWinner = getCurrentWinningPlay(playedCards);

  if (!currentWinner) return sortedCards[0];

  const winningSuit = currentWinner.card.suit;

  // Try to beat the current winning card with the lowest possible card.
  const winningOptions = sortedCards.filter((card) => {
    if (card.suit === TRUMP_SUIT) {
      return (
        winningSuit !== TRUMP_SUIT ||
        card.value > currentWinner.card.value
      );
    }

    return (
      card.suit === winningSuit &&
      card.value > currentWinner.card.value
    );
  });

  if (winningOptions.length > 0) {
    return winningOptions[0];
  }

  // Otherwise, play the lowest legal card.
  return sortedCards[0];
}
