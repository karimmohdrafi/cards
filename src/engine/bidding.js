
const HIGH_CARD_VALUES = {
  A: 1,
  K: 0.7,
  Q: 0.4,
  J: 0.2,
};

export function calculateComputerBid(hand) {
  let estimatedTricks = 0;

  const spades = hand.filter(
    (card) => card.suit === "Spades"
  );

  const otherCards = hand.filter(
    (card) => card.suit !== "Spades"
  );

  // Spade strength
  spades.forEach((card) => {
    if (card.rank === "A") estimatedTricks += 1;
    else if (card.rank === "K") estimatedTricks += 0.85;
    else if (card.rank === "Q") estimatedTricks += 0.6;
    else if (card.rank === "J") estimatedTricks += 0.4;
    else if (card.value >= 10) estimatedTricks += 0.2;
  });

  // Other suit strength
  otherCards.forEach((card) => {
    if (card.rank === "A") {
      estimatedTricks += 0.9;
    } else if (card.rank === "K") {
      const suitCount = hand.filter(
        (item) => item.suit === card.suit
      ).length;

      if (suitCount >= 2) estimatedTricks += 0.45;
    } else if (card.rank === "Q") {
      const suitCount = hand.filter(
        (item) => item.suit === card.suit
      ).length;

      if (suitCount >= 3) estimatedTricks += 0.2;
    }
  });

  // Long spade suit advantage
  if (spades.length >= 5) {
    estimatedTricks += 0.5;
  }

  return Math.max(
    1,
    Math.min(13, Math.round(estimatedTricks))
  );
}
