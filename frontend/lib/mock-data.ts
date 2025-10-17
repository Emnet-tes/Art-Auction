export interface Artwork {
  id: string;
  title: string;
  artist: string;
  description: string;
  category: "Painting" | "Sculpture" | "Digital" | "Photography";
  image_url: string; // Changed from image_url
  starting_bid: number; // Changed from startingBid
  current_bid: number; // Changed from current_bid
  min_increment: number; // Changed from min_increment
  end_time: Date; // Changed from end_time
  highest_bidder?: string;
  highest_bidder_name?: string; // Added
  bid_history: Bid[]; // Changed from bidHistory
  created_at?: string; // Added
  is_active?: boolean; // Added
}

export interface Bid {
  id: string;
  artwork: string; // Changed from artworkId
  bidder: string;
  bidder_name: string; // Changed from bidderName
  amount: number;
  timestamp: Date; // Changed from timestamp
}

export interface UserBid {
  artworkId: string;
  artwork: Artwork;
  myHighestBid: number;
  status: "active" | "outbid" | "won" | "lost";
  wonDate?: Date;
  paymentStatus?: "pending" | "paid";
  shippingStatus?: "preparing" | "shipped" | "delivered";
}

// Mock data for development
export const mockArtworks: Artwork[] = [
  {
    id: "1",
    title: "Ethereal Landscapes",
    artist: "Marina Volkov",
    description:
      "A stunning oil painting capturing the essence of dawn breaking over misty mountains. This piece showcases Volkov's masterful use of light and atmospheric perspective.",
    category: "Painting",
    image_url: "/abstractoilpaintingmistymountainsdawn.jpg", // Changed
    starting_bid: 2500, // Changed
    current_bid: 3200, // Changed
    min_increment: 100, // Changed
    end_time: new Date(Date.now() + 2 * 60 * 60 * 1000), // Changed
    highest_bidder: "ArtCollector_92",
    bid_history: [
      {
        id: "1",
        artwork: "1", // Changed
        bidder: "ArtCollector_92", // Changed
        bidder_name: "ArtCollector_92", // Changed
        amount: 3200,
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // Changed
      },
      {
        id: "2",
        artwork: "1", // Changed
        bidder: "GalleryOwner",
        amount: 3000,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        bidder_name: ""
      },
      {
        id: "3",
        artwork: "1", // Changed
        bidder: "ModernArt_Fan",
        amount: 2800,
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        bidder_name: ""
      },
    ],
  },
  {
    id: "2",
    title: "Urban Symphony",
    artist: "Carlos Rodriguez",
    description:
      "A dynamic bronze sculpture representing the rhythm and energy of city life. Rodriguez's signature style brings movement to metal.",
    category: "Sculpture",
    image_url: "/modern-bronze-sculpture-urban-abstract.jpg",
    starting_bid: 4500,
    current_bid: 5800,
    min_increment: 200,
    end_time: new Date(Date.now() + 8 * 60 * 1000), // 8 minutes from now (warning state)
    highest_bidder: "SculptureLover",
    bid_history: [
      {
        id: "4",
        artwork: "2",
        bidder: "SculptureLover",
        amount: 5800,
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        bidder_name: ""
      },
      {
        id: "5",
        artwork: "2",
        bidder: "MetalWorks_Co",
        amount: 5400,
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
        bidder_name: ""
      },
    ],
  },
  {
    id: "3",
    title: "Digital Dreams",
    artist: "Alex Chen",
    description:
      "An innovative digital artwork exploring the intersection of technology and human emotion. Limited edition NFT with physical print.",
    category: "Digital",
    image_url: "/digital-art-neon-cyberpunk-abstract.jpg",
    starting_bid: 1200,
    current_bid: 1800,
    min_increment: 50,
    end_time: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    highest_bidder: "CryptoArt_Enthusiast",
    bid_history: [
      {
        id: "6",
        artwork: "3",
        bidder: "CryptoArt_Enthusiast",
        amount: 1800,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        bidder_name: ""
      },
    ],
  },
  {
    id: "4",
    title: "Solitude in Blue",
    artist: "Emma Thompson",
    description:
      "A contemplative oil painting exploring themes of isolation and introspection through masterful use of blue tones.",
    category: "Painting",
    image_url: "/blue-oil-painting-solitude-contemplative.jpg",
    starting_bid: 3000,
    current_bid: 4200,
    min_increment: 150,
    end_time: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
    highest_bidder: "BlueArt_Collector",
    bid_history: [
      {
        id: "7",
        artwork: "4",
        bidder: "BlueArt_Collector",
        amount: 4200,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        bidder_name: ""
      },
    ],
  },
  {
    id: "5",
    title: "Captured Moments",
    artist: "David Kim",
    description:
      "A striking black and white photograph capturing the raw emotion of street life. Part of Kim's acclaimed urban series.",
    category: "Photography",
    image_url: "/black-white-street-photography-urban-emotion.jpg",
    starting_bid: 800,
    current_bid: 1200,
    min_increment: 25,
    end_time: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
    highest_bidder: "PhotoArt_Fan",
    bid_history: [
      {
        id: "8",
        artwork: "5",
        bidder: "PhotoArt_Fan",
        amount: 1200,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        bidder_name: ""
      },
    ],
  },
  {
    id: "6",
    title: "Renaissance Revival",
    artist: "Isabella Rossi",
    description:
      "A classical oil painting inspired by Renaissance masters, showcasing traditional techniques with contemporary subjects.",
    category: "Painting",
    image_url: "/renaissance-style-oil-painting-classical-portrait.jpg",
    starting_bid: 5500,
    current_bid: 7200,
    min_increment: 250,
    end_time: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18 hours from now
    highest_bidder: "ClassicalArt_Patron",
    bid_history: [
      {
        id: "9",
        artwork: "6",
        bidder: "ClassicalArt_Patron",
        amount: 7200,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        bidder_name: ""
      },
    ],
  },
];

export const mockUserBids: UserBid[] = [
  {
    artworkId: "1",
    artwork: mockArtworks[0],
    myHighestBid: 3000,
    status: "outbid",
  },
  {
    artworkId: "3",
    artwork: mockArtworks[2],
    myHighestBid: 1800,
    status: "active",
  },
];
