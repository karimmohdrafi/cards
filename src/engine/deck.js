
const suits = [
  { name: "Spades", symbol: "♠", color: "black" },
  { name: "Hearts", symbol: "♥", color: "red" },
  { name: "Diamonds", symbol: "♦", color: "red" },
  { name: "Clubs", symbol: "♣", color: "black" },
];

const ranks = [
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
  { label: "6", value: 6 },
  { label: "7", value: 7 },
  { label: "8", value: 8 },
  { label: "9", value: 9 },
  { label: "10", value: 10 },
  { label: "J", value: 11 },
  { label: "Q", value: 12 },
  { label: "K", value: 13 },
  { label: "A", value: 14 },
];

// Generate 52 unique cards
export function createDeck() {
  const deck = [];

  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      deck.push({
        id: `${suit.name}-${rank.label}`,
        suit: suit.name,
        symbol: suit.symbol,
        color: suit.color,
        rank: rank.label,
        value: rank.value,
      });
    });
  });

  return deck;
}

// Fisher-Yates shuffle
export function shuffleDeck(deck) {
  const shuffled = [...deck];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [
      shuffled[j],
      shuffled[i],
    ];
  }

  return shuffled;
}

// Deal 13 cards to each of 4 players
export function dealCards() {
  const shuffled = shuffleDeck(createDeck());

  const hands = [
    shuffled.slice(0, 13),
    shuffled.slice(13, 26),
    shuffled.slice(26, 39),
    shuffled.slice(39, 52),
  ];

  // Sort each player's cards by suit and rank
  const suitOrder = {
    Spades: 0,
    Hearts: 1,
    Diamonds: 2,
    Clubs: 3,
  };

  hands.forEach((hand) => {
    hand.sort((a, b) => {
      if (a.suit !== b.suit) {
        return suitOrder[a.suit] - suitOrder[b.suit];
      }

      return b.value - a.value;
    });
  });

  return hands;
}
