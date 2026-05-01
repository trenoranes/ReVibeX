// Fashion categories are featured first (Revix launches clothes-first),
// followed by other thrift categories so customers can list & browse anything.
export type Category =
  // Fashion
  | "Tops" | "Dresses" | "Bottoms" | "Outerwear" | "Shoes" | "Bags" | "Accessories" | "Jewelry"
  // Home & decor
  | "Furniture" | "Kitchen" | "Decor"
  // Books, music & games
  | "Books" | "Music" | "Games"
  // Electronics & tech
  | "Phones" | "Laptops" | "Gadgets"
  // Catch-all
  | "Other";

export const CATEGORY_GROUPS: { label: string; items: Category[] }[] = [
  { label: "Fashion", items: ["Tops", "Dresses", "Bottoms", "Outerwear", "Shoes", "Bags", "Accessories", "Jewelry"] },
  { label: "Home & decor", items: ["Furniture", "Kitchen", "Decor"] },
  { label: "Books, music & games", items: ["Books", "Music", "Games"] },
  { label: "Electronics & tech", items: ["Phones", "Laptops", "Gadgets"] },
  { label: "Other", items: ["Other"] },
];

export const ALL_CATEGORIES: Category[] = CATEGORY_GROUPS.flatMap((g) => g.items);

export type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL";
export type Condition = "New with tags" | "Like new" | "Good" | "Fair";
export type ListingType = "Sell" | "Trade";

export interface Seller {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  sales: number;
  followers: number;
  verified: boolean;
  neighbourhood: string;
}

export interface Listing {
  id: string;
  title: string;
  brand: string;
  price: number;
  type: ListingType;
  tradeFor?: string;
  category: Category;
  condition: Condition;
  size: Size;
  neighbourhood: string;
  description: string;
  photos: string[];
  seller: Seller;
  postedAt: string;
  sold?: boolean;
  soldAt?: number;
}

export interface Message {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
}

export interface Thread {
  id: string;
  user: Seller;
  listingTitle: string;
  lastMessage: string;
  time: string;
  unread: number;
  typing?: boolean;
  messages: Message[];
}

export interface Review {
  id: string;
  reviewer: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
}

const HALIFAX_HOODS = ["North End", "South End", "Downtown", "Quinpool", "Dartmouth", "Clayton Park", "West End"];

const sellers: Seller[] = [
  { id: "u1", name: "Maya Chen", avatar: "https://i.pravatar.cc/150?img=47", rating: 4.9, sales: 38, followers: 412, verified: true, neighbourhood: "North End" },
  { id: "u2", name: "Jordan Reid", avatar: "https://i.pravatar.cc/150?img=12", rating: 4.7, sales: 21, followers: 188, verified: true, neighbourhood: "Downtown" },
  { id: "u3", name: "Sasha Park", avatar: "https://i.pravatar.cc/150?img=32", rating: 5.0, sales: 56, followers: 720, verified: true, neighbourhood: "South End" },
  { id: "u4", name: "Theo Bennett", avatar: "https://i.pravatar.cc/150?img=15", rating: 4.6, sales: 14, followers: 96, verified: false, neighbourhood: "Dartmouth" },
  { id: "u5", name: "Lila Moreau", avatar: "https://i.pravatar.cc/150?img=44", rating: 4.8, sales: 29, followers: 244, verified: true, neighbourhood: "Quinpool" },
];

const photoFor = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=800&q=80`;

export const listings: Listing[] = [
  {
    id: "l1", title: "Vintage Levi's 501 Jeans", brand: "Levi's", price: 45, type: "Sell",
    category: "Bottoms", condition: "Good", size: "M", neighbourhood: "North End",
    description: "Classic mid-rise straight leg. Perfect fade, broken in beautifully. Picked up at a Halifax thrift years ago.",
    photos: [photoFor("photo-1542272604-787c3835535d"), photoFor("photo-1604176354204-9268737828e4")],
    seller: sellers[0], postedAt: "2h ago",
  },
  {
    id: "l2", title: "Cream Knit Cardigan", brand: "Aritzia", price: 38, type: "Sell",
    category: "Tops", condition: "Like new", size: "S", neighbourhood: "South End",
    description: "Cozy oversized fit, only worn twice. From the Wilfred line.",
    photos: [photoFor("photo-1591047139829-d91aecb6caea"), photoFor("photo-1434389677669-e08b4cac3105")],
    seller: sellers[2], postedAt: "5h ago",
  },
  {
    id: "l3", title: "Black Linen Slip Dress", brand: "Reformation", price: 0, type: "Trade",
    tradeFor: "Looking for size S blazer or chunky boots",
    category: "Dresses", condition: "Like new", size: "S", neighbourhood: "Downtown",
    description: "Bias cut midi, gorgeous on. Trading because I have too many black dresses.",
    photos: [photoFor("photo-1539008835657-9e8e9680c956"), photoFor("photo-1572804013309-59a88b7e92f1")],
    seller: sellers[1], postedAt: "1d ago",
  },
  {
    id: "l4", title: "Doc Martens 1460 Boots", brand: "Dr. Martens", price: 85, type: "Sell",
    category: "Shoes", condition: "Good", size: "L", neighbourhood: "Quinpool",
    description: "Classic 8-eye boots. Broken in, lots of life left.",
    photos: [photoFor("photo-1605812860427-4024433a70fd"), photoFor("photo-1542838132-92c53300491e")],
    seller: sellers[4], postedAt: "3h ago",
  },
  {
    id: "l5", title: "Y2K Mesh Top", brand: "Vintage", price: 22, type: "Sell",
    category: "Tops", condition: "Good", size: "XS", neighbourhood: "North End",
    description: "Iridescent mesh long sleeve, perfect layering piece.",
    photos: [photoFor("photo-1554568218-0f1715e72254"), photoFor("photo-1503342217505-b0a15ec3261c")],
    seller: sellers[0], postedAt: "6h ago",
  },
  {
    id: "l6", title: "Leather Crossbody Bag", brand: "Coach", price: 65, type: "Sell",
    category: "Accessories", condition: "Like new", size: "M", neighbourhood: "Dartmouth",
    description: "Authentic, comes with dust bag. Soft tan leather.",
    photos: [photoFor("photo-1584917865442-de89df76afd3"), photoFor("photo-1591561954557-26941169b49e")],
    seller: sellers[3], postedAt: "8h ago",
  },
  {
    id: "l7", title: "Pleated Tennis Skirt", brand: "Brandy Melville", price: 18, type: "Trade",
    tradeFor: "Trade for cute crop top size XS/S",
    category: "Bottoms", condition: "Good", size: "XS", neighbourhood: "South End",
    description: "Classic navy pleated mini.",
    photos: [photoFor("photo-1583496661160-fb5886a13d44")],
    seller: sellers[2], postedAt: "1d ago",
  },
  {
    id: "l8", title: "Oversized Denim Jacket", brand: "Levi's", price: 42, type: "Sell",
    category: "Tops", condition: "Good", size: "L", neighbourhood: "Downtown",
    description: "Light wash, perfect oversized fit.",
    photos: [photoFor("photo-1551537482-f2075a1d41f2"), photoFor("photo-1576995853123-5a10305d93c0")],
    seller: sellers[1], postedAt: "12h ago",
  },
  {
    id: "l9", title: "Silk Floral Maxi Dress", brand: "Zara", price: 35, type: "Sell",
    category: "Dresses", condition: "Like new", size: "M", neighbourhood: "West End",
    description: "Stunning print, worn once to a wedding.",
    photos: [photoFor("photo-1496747611176-843222e1e57c"), photoFor("photo-1515886657613-9f3515b0c78f")],
    seller: sellers[4], postedAt: "2d ago",
  },
  {
    id: "l10", title: "Nike Air Force 1 White", brand: "Nike", price: 55, type: "Sell",
    category: "Shoes", condition: "Good", size: "L", neighbourhood: "North End",
    description: "Clean white AF1s, size 9.",
    photos: [photoFor("photo-1542291026-7eec264c27ff"), photoFor("photo-1600185365926-3a2ce3cdb9eb")],
    seller: sellers[0], postedAt: "1d ago",
  },
  {
    id: "l11", title: "Gold Hoop Earrings Set", brand: "Mejuri", price: 28, type: "Sell",
    category: "Accessories", condition: "Like new", size: "M", neighbourhood: "South End",
    description: "Set of 3 gold-plated hoops. Tarnish free.",
    photos: [photoFor("photo-1535632787350-4e68ef0ac584")],
    seller: sellers[2], postedAt: "4h ago",
  },
  {
    id: "l12", title: "Wool Plaid Trousers", brand: "Uniqlo", price: 30, type: "Sell",
    category: "Bottoms", condition: "Good", size: "M", neighbourhood: "Dartmouth",
    description: "High waist, tapered. So cozy for fall.",
    photos: [photoFor("photo-1594633312681-425c7b97ccd1")],
    seller: sellers[3], postedAt: "1d ago",
  },
];

export const threads: Thread[] = [
  {
    id: "t1", user: sellers[0], listingTitle: "Vintage Levi's 501 Jeans",
    lastMessage: "Yes still available! Want to meet at Common Roots?",
    time: "2m", unread: 2, typing: true,
    messages: [
      { id: "m1", from: "me", text: "Hey! Are these still available?", time: "10:32 AM" },
      { id: "m2", from: "them", text: "Hey! Yes they are 💖", time: "10:34 AM" },
      { id: "m3", from: "them", text: "Yes still available! Want to meet at Common Roots?", time: "10:35 AM" },
    ],
  },
  {
    id: "t2", user: sellers[2], listingTitle: "Cream Knit Cardigan",
    lastMessage: "Sounds great, see you Saturday!",
    time: "1h", unread: 0,
    messages: [
      { id: "m4", from: "them", text: "Hi! Thanks for your interest", time: "Yesterday" },
      { id: "m5", from: "me", text: "Could we meet downtown this weekend?", time: "Yesterday" },
      { id: "m6", from: "them", text: "Sounds great, see you Saturday!", time: "1h ago" },
    ],
  },
  {
    id: "t3", user: sellers[1], listingTitle: "Black Linen Slip Dress",
    lastMessage: "Would you trade for these boots?",
    time: "3h", unread: 1,
    messages: [
      { id: "m7", from: "them", text: "Would you trade for these boots?", time: "3h ago" },
    ],
  },
  {
    id: "t4", user: sellers[4], listingTitle: "Doc Martens 1460 Boots",
    lastMessage: "Sold! Thanks so much 🙌",
    time: "2d", unread: 0,
    messages: [
      { id: "m8", from: "me", text: "I'll take them!", time: "2d ago" },
      { id: "m9", from: "them", text: "Sold! Thanks so much 🙌", time: "2d ago" },
    ],
  },
];

export const reviews: Review[] = [
  { id: "r1", reviewer: "Emma S.", avatar: "https://i.pravatar.cc/100?img=20", rating: 5, text: "Item was even better than pictured. Smooth meetup!", date: "2 weeks ago" },
  { id: "r2", reviewer: "Noah W.", avatar: "https://i.pravatar.cc/100?img=33", rating: 5, text: "Such a sweet seller. Would buy again 💖", date: "1 month ago" },
  { id: "r3", reviewer: "Avery K.", avatar: "https://i.pravatar.cc/100?img=25", rating: 4, text: "Quick replies, clothes well packed.", date: "1 month ago" },
];

export const currentUser: Seller = {
  id: "me", name: "Alex Rivera", avatar: "https://i.pravatar.cc/150?img=68",
  rating: 4.8, sales: 17, followers: 142, verified: true, neighbourhood: "North End",
};

export { HALIFAX_HOODS };
