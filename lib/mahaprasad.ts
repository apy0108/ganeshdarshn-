export interface MahaprasadEntry {
  id: string;
  mandalName: string;
  mandalNameMarathi: string;
  mandalId?: string;
  area: string;
  timeRange: string;
  frequency: string;
  lat: number;
  lng: number;
  itemDescription?: string;
}

export const MAHAPRASAD_LIST: MahaprasadEntry[] = [
  {
    id: "nav-kiran",
    mandalName: "Nav Kiran Tarun Mandal",
    mandalNameMarathi: "नवकिरण तरुण मंडळ",
    area: "Shaniwar Peth",
    timeRange: "7:00 PM – 11:00 PM",
    frequency: "Every evening during festival",
    lat: 18.5185,
    lng: 73.8495,
    itemDescription: "Traditional Masale Bhaat, Sheera, and Laddu prasad distributed to all devotees.",
  },
  {
    id: "akhil-mandai",
    mandalName: "Akhil Mandai Mandal",
    mandalNameMarathi: "अखिल मंडई मंडळ",
    mandalId: "akhil-mandai-mandal",
    area: "Shukrawar Peth",
    timeRange: "12:30 PM – 3:30 PM & 7:30 PM – 10:30 PM",
    frequency: "Daily Bhandara & Mahaprasad",
    lat: 18.5152,
    lng: 73.8578,
    itemDescription: "Large community Annachhatra feast with Puri, Amti, Rice, and seasonal Kheer.",
  },
  {
    id: "tulshibaug",
    mandalName: "Tulshibaug Ganpati Mandal",
    mandalNameMarathi: "तुळशीबाग गणपती मंडळ",
    mandalId: "tulshibaug-ganpati",
    area: "Budhwar Peth",
    timeRange: "1:00 PM – 4:00 PM",
    frequency: "Gauri Pujan day & Anant Chaturdashi",
    lat: 18.5128,
    lng: 73.8564,
    itemDescription: "Special Modak, Sabudana Khichdi, and festive Pulao prasad.",
  },
  {
    id: "kesariwada",
    mandalName: "Kesariwada Ganpati",
    mandalNameMarathi: "केसरीवाडा गणपती",
    mandalId: "kesariwada-ganpati",
    area: "Narayan Peth",
    timeRange: "8:00 PM – 10:30 PM",
    frequency: "Daily evening distribution",
    lat: 18.5148,
    lng: 73.853,
    itemDescription: "Ukadiche Modak and fragrant Sheera distributed after evening Aarti.",
  },
  {
    id: "dagdusheth",
    mandalName: "Shrimant Dagdusheth Halwai Trust",
    mandalNameMarathi: "श्रीमंत दगडूशेठ हलवाई ट्रस्ट",
    mandalId: "dagdusheth-halwai-ganpati",
    area: "Budhwar Peth",
    timeRange: "11:30 AM – 3:00 PM & 6:30 PM – 10:30 PM",
    frequency: "Continuous prasad counters",
    lat: 18.5162,
    lng: 73.8554,
    itemDescription: "Pedha, Boondi Laddu, and holy Tirupati-style packed prasad for queueing devotees.",
  },
];
