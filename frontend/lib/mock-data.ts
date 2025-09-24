export interface Artwork {
  id: string
  title: string
  artist: string
  description: string
  category: "Painting" | "Sculpture" | "Digital" | "Photography"
  imageUrl: string
  startingBid: number
  currentBid: number
  minIncrement: number
  endTime: Date
  highestBidder?: string
  bidHistory: Bid[]
}

export interface Bid {
  id: string
  artworkId: string
  bidderName: string
  amount: number
  timestamp: Date
}

export interface UserBid {
  artworkId: string
  artwork: Artwork
  myHighestBid: number
  status: "active" | "outbid" | "won" | "lost"
  wonDate?: Date
  paymentStatus?: "pending" | "paid"
  shippingStatus?: "preparing" | "shipped" | "delivered"
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
    imageUrl: "/abstract-oil-painting-misty-mountains-dawn.jpg",
    startingBid: 2500,
    currentBid: 3200,
    minIncrement: 100,
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    highestBidder: "ArtCollector_92",
    bidHistory: [
      {
        id: "1",
        artworkId: "1",
        bidderName: "ArtCollector_92",
        amount: 3200,
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
      },
      {
        id: "2",
        artworkId: "1",
        bidderName: "GalleryOwner",
        amount: 3000,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        id: "3",
        artworkId: "1",
        bidderName: "ModernArt_Fan",
        amount: 2800,
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
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
    imageUrl: "/modern-bronze-sculpture-urban-abstract.jpg",
    startingBid: 4500,
    currentBid: 5800,
    minIncrement: 200,
    endTime: new Date(Date.now() + 8 * 60 * 1000), // 8 minutes from now (warning state)
    highestBidder: "SculptureLover",
    bidHistory: [
      {
        id: "4",
        artworkId: "2",
        bidderName: "SculptureLover",
        amount: 5800,
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
      },
      {
        id: "5",
        artworkId: "2",
        bidderName: "MetalWorks_Co",
        amount: 5400,
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
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
    imageUrl: "/digital-art-neon-cyberpunk-abstract.jpg",
    startingBid: 1200,
    currentBid: 1800,
    minIncrement: 50,
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    highestBidder: "CryptoArt_Enthusiast",
    bidHistory: [
      {
        id: "6",
        artworkId: "3",
        bidderName: "CryptoArt_Enthusiast",
        amount: 1800,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
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
    imageUrl: "/blue-oil-painting-solitude-contemplative.jpg",
    startingBid: 3000,
    currentBid: 4200,
    minIncrement: 150,
    endTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
    highestBidder: "BlueArt_Collector",
    bidHistory: [
      {
        id: "7",
        artworkId: "4",
        bidderName: "BlueArt_Collector",
        amount: 4200,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
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
    imageUrl: "/black-white-street-photography-urban-emotion.jpg",
    startingBid: 800,
    currentBid: 1200,
    minIncrement: 25,
    endTime: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
    highestBidder: "PhotoArt_Fan",
    bidHistory: [
      {
        id: "8",
        artworkId: "5",
        bidderName: "PhotoArt_Fan",
        amount: 1200,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
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
    imageUrl: "/renaissance-style-oil-painting-classical-portrait.jpg",
    startingBid: 5500,
    currentBid: 7200,
    minIncrement: 250,
    endTime: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18 hours from now
    highestBidder: "ClassicalArt_Patron",
    bidHistory: [
      {
        id: "9",
        artworkId: "6",
        bidderName: "ClassicalArt_Patron",
        amount: 7200,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    ],
  },
]

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
]
