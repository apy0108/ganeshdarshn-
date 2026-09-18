export interface ParkingSpot {
  id: number;
  name: string;
  lat: number;
  lng: number;
  isStretch?: boolean; // road stretch, not a point
  nearestMandalId: string;
  nearestMandalDistanceM: number;
  capacityType?: string; // e.g., "2-Wheeler & 4-Wheeler"
}

export interface RoadClosure {
  id: string;
  name: string;
  closedAfter: string; // "17:00"
  startPoint?: string;
  endPoint?: string;
  coordinates?: [number, number][]; // [lng,lat] pairs for polyline
  alternateRoute?: string;
}

export interface FootCorridor {
  id: string;
  direction: string; // e.g. "Walk south → Dagdusheth"
  description: string;
  warning: string; // "You will not be able to walk back up it"
  coordinates: [number, number][]; // [lng,lat] arrow direction
}

export interface TrafficJunction {
  id: number;
  name: string;
  area: string;
  lat: number;
  lng: number;
  restriction: string;
}

// 23 Parking Spots in Pune Central & Surrounding Peths
export const PARKING_SPOTS: ParkingSpot[] = [
  {
    id: 1,
    name: "New English School, Ramanbaug",
    lat: 18.5208,
    lng: 73.8512,
    nearestMandalId: "kesariwada-ganpati",
    nearestMandalDistanceM: 170,
    capacityType: "2-Wheeler & 4-Wheeler",
  },
  {
    id: 2,
    name: "Shivaji Akhada Ground",
    lat: 18.5225,
    lng: 73.8578,
    nearestMandalId: "hutatma-babu-genu-mandal",
    nearestMandalDistanceM: 790,
    capacityType: "2-Wheeler only",
  },
  {
    id: 3,
    name: "H.V. Desai College Ground",
    lat: 18.5175,
    lng: 73.8542,
    nearestMandalId: "bhau-rangari-ganpati",
    nearestMandalDistanceM: 90,
    capacityType: "2-Wheeler & 4-Wheeler",
  },
  {
    id: 4,
    name: "Hamalwada, Patrya Maruti Chowk",
    lat: 18.5192,
    lng: 73.8530,
    nearestMandalId: "kesariwada-ganpati",
    nearestMandalDistanceM: 250,
    capacityType: "2-Wheeler only",
  },
  {
    id: 5,
    name: "Peshwe Park & Sarasbaug Parking",
    lat: 18.5028,
    lng: 73.8525,
    nearestMandalId: "sarasbaug-ganpati",
    nearestMandalDistanceM: 170,
    capacityType: "2-Wheeler & 4-Wheeler",
  },
  {
    id: 6,
    name: "Sir Parashurambhau (S.P.) College Ground",
    lat: 18.5065,
    lng: 73.8505,
    nearestMandalId: "sadashiv-peth-mandal",
    nearestMandalDistanceM: 240,
    capacityType: "Large Capacity (2W & 4W)",
  },
  {
    id: 7,
    name: "New English School (Tilak Road / Sadashiv Peth)",
    lat: 18.5115,
    lng: 73.8502,
    nearestMandalId: "hatti-ganpati-mandal",
    nearestMandalDistanceM: 60,
    capacityType: "2-Wheeler only",
  },
  {
    id: 8,
    name: "Riverbed Road Parking (Bhide Bridge to Garware Bridge)",
    lat: 18.5152,
    lng: 73.8445,
    isStretch: true,
    nearestMandalId: "kesariwada-ganpati",
    nearestMandalDistanceM: 650,
    capacityType: "2-Wheeler & 4-Wheeler Stretch",
  },
  {
    id: 9,
    name: "Shaniwar Wada Front Parking Ground",
    lat: 18.5198,
    lng: 73.8550,
    nearestMandalId: "kasba-ganpati",
    nearestMandalDistanceM: 320,
    capacityType: "2-Wheeler only",
  },
  {
    id: 10,
    name: "Mandai Multi-Level Parking",
    lat: 18.5135,
    lng: 73.8575,
    nearestMandalId: "akhil-mandai-mandal",
    nearestMandalDistanceM: 110,
    capacityType: "Multi-Level 2W & 4W",
  },
  {
    id: 11,
    name: "Phadke Haud Parking Lot",
    lat: 18.5180,
    lng: 73.8592,
    nearestMandalId: "kasba-ganpati",
    nearestMandalDistanceM: 390,
    capacityType: "2-Wheeler only",
  },
  {
    id: 12,
    name: "Gogte Prashala / Nutan Marathi Vidyalaya (NMV)",
    lat: 18.5158,
    lng: 73.8492,
    nearestMandalId: "bhau-rangari-ganpati",
    nearestMandalDistanceM: 420,
    capacityType: "2-Wheeler only",
  },
  {
    id: 13,
    name: "Garware College Ground (Karve Road)",
    lat: 18.5102,
    lng: 73.8368,
    nearestMandalId: "kesariwada-ganpati",
    nearestMandalDistanceM: 1400,
    capacityType: "Large Capacity (Park & Walk/Metro)",
  },
  {
    id: 14,
    name: "COEP Ground (Shivajinagar)",
    lat: 18.5285,
    lng: 73.8560,
    nearestMandalId: "kasba-ganpati",
    nearestMandalDistanceM: 1250,
    capacityType: "Large Capacity 4W & 2W",
  },
  {
    id: 15,
    name: "Bhave High School Ground (Perugate)",
    lat: 18.5108,
    lng: 73.8540,
    nearestMandalId: "tulshibaug-ganpati",
    nearestMandalDistanceM: 360,
    capacityType: "2-Wheeler only",
  },
  {
    id: 16,
    name: "Nehru Stadium / Sanas Ground",
    lat: 18.5030,
    lng: 73.8562,
    nearestMandalId: "sarasbaug-ganpati",
    nearestMandalDistanceM: 350,
    capacityType: "Large Ground (2W & 4W)",
  },
  {
    id: 17,
    name: "Minatai Thackeray Parking (Swargate)",
    lat: 18.5005,
    lng: 73.8582,
    nearestMandalId: "sarasbaug-ganpati",
    nearestMandalDistanceM: 680,
    capacityType: "4-Wheeler & 2-Wheeler",
  },
  {
    id: 18,
    name: "Kasarwadi / Juna Bazaar Ground",
    lat: 18.5255,
    lng: 73.8610,
    nearestMandalId: "kasba-ganpati",
    nearestMandalDistanceM: 950,
    capacityType: "Open Ground 4W & 2W",
  },
  {
    id: 19,
    name: "Ranade Balak Mandir Ground (Shaniwar Peth)",
    lat: 18.5185,
    lng: 73.8475,
    nearestMandalId: "kesariwada-ganpati",
    nearestMandalDistanceM: 380,
    capacityType: "2-Wheeler only",
  },
  {
    id: 20,
    name: "Appa Balwant Chowk Municipal Complex Basement",
    lat: 18.5168,
    lng: 73.8528,
    nearestMandalId: "tambdi-jogeshwari",
    nearestMandalDistanceM: 280,
    capacityType: "2-Wheeler only",
  },
  {
    id: 21,
    name: "Shahu Udyan Ground (Somwar Peth)",
    lat: 18.5210,
    lng: 73.8660,
    nearestMandalId: "trishund-ganpati",
    nearestMandalDistanceM: 310,
    capacityType: "2-Wheeler & 4-Wheeler",
  },
  {
    id: 22,
    name: "Golibar Maidan (Camp Approach)",
    lat: 18.5060,
    lng: 73.8765,
    nearestMandalId: "sarasbaug-ganpati",
    nearestMandalDistanceM: 1900,
    capacityType: "Massive 4W & Bus Lot",
  },
  {
    id: 23,
    name: "Modern College Ground (Shivajinagar / JM Road)",
    lat: 18.5262,
    lng: 73.8475,
    nearestMandalId: "kesariwada-ganpati",
    nearestMandalDistanceM: 920,
    capacityType: "2-Wheeler & 4-Wheeler",
  },
];

// 13 Stretches Closed to Vehicular Traffic after 17:00
export const ROAD_CLOSURES: RoadClosure[] = [
  {
    id: "laxmi-road",
    name: "Laxmi Road",
    closedAfter: "17:00",
    startPoint: "Hajekhan Chowk (Alka Talkies)",
    endPoint: "Tilak Chowk / Sonya Maruti Chowk",
    alternateRoute: "Via Kelkar Road / Kumthekar Road till 17:00, then Riverbed Road",
    coordinates: [
      [73.8475, 18.5140],
      [73.8520, 18.5152],
      [73.8565, 18.5165],
      [73.8610, 18.5178],
    ],
  },
  {
    id: "bajirao-road",
    name: "Bajirao Road",
    closedAfter: "17:00",
    startPoint: "Puram Chowk (Swargate end)",
    endPoint: "Appa Balwant (ABC) Chowk",
    alternateRoute: "Via Tilak Road → Shastri Road",
    coordinates: [
      [73.8530, 18.5035],
      [73.8535, 18.5100],
      [73.8538, 18.5168],
    ],
  },
  {
    id: "shivaji-road",
    name: "Shivaji Road",
    closedAfter: "17:00",
    startPoint: "Kakasaheb Gadgil Statue / Dengle Bridge",
    endPoint: "Jedhe Chowk (Swargate)",
    alternateRoute: "Via Jangli Maharaj Road → Deccan → Shastri Road",
    coordinates: [
      [73.8560, 18.5260],
      [73.8565, 18.5200],
      [73.8570, 18.5140],
      [73.8580, 18.5015],
    ],
  },
  {
    id: "tilak-road",
    name: "Tilak Road",
    closedAfter: "17:00",
    startPoint: "Alka Talkies Chowk",
    endPoint: "Jedhe Chowk (Swargate)",
    alternateRoute: "Via Shastri Road & Sinhagad Road links",
    coordinates: [
      [73.8455, 18.5125],
      [73.8510, 18.5080],
      [73.8575, 18.5020],
    ],
  },
  {
    id: "kumthekar-road",
    name: "Kumthekar Road",
    closedAfter: "17:00",
    startPoint: "Alka Talkies Chowk",
    endPoint: "Shanipar Chowk",
    alternateRoute: "Pedestrian only after 17:00",
    coordinates: [
      [73.8465, 18.5130],
      [73.8515, 18.5138],
      [73.8545, 18.5142],
    ],
  },
  {
    id: "kelkar-road",
    name: "Kelkar Road",
    closedAfter: "17:00",
    startPoint: "Z-Bridge / Deccan Gymkhana End",
    endPoint: "Appa Balwant Chowk",
    alternateRoute: "Via NC Kelkar Road to Shaniwar Peth boundary",
    coordinates: [
      [73.8450, 18.5165],
      [73.8495, 18.5168],
      [73.8535, 18.5170],
    ],
  },
  {
    id: "shastri-road-peth-entry",
    name: "Shastri Road (Peth Access Points)",
    closedAfter: "17:00",
    startPoint: "Senadatta Chowk",
    endPoint: "Alka Talkies Chowk",
    alternateRoute: "Traffic diverted outward toward Karve Road & Mhatre Bridge",
    coordinates: [
      [73.8410, 18.5080],
      [73.8440, 18.5105],
      [73.8460, 18.5130],
    ],
  },
  {
    id: "ganesh-road",
    name: "Ganesh Road",
    closedAfter: "17:00",
    startPoint: "Phadke Haud Chowk",
    endPoint: "Jijamata Chowk / Kasba Peth",
    alternateRoute: "Via Apollo Talkies / Rasta Peth outer road",
    coordinates: [
      [73.8595, 18.5180],
      [73.8570, 18.5190],
      [73.8555, 18.5195],
    ],
  },
  {
    id: "budhwar-lane",
    name: "Appa Balwant Chowk to Budhwar Chowk",
    closedAfter: "17:00",
    startPoint: "Appa Balwant Chowk",
    endPoint: "Budhwar Chowk (Jogeshwari Lane)",
    alternateRoute: "Strictly pedestrian corridor only",
    coordinates: [
      [73.8535, 18.5170],
      [73.8550, 18.5160],
      [73.8565, 18.5148],
    ],
  },
  {
    id: "mandai-road",
    name: "Mandai Bazaar Internal Road",
    closedAfter: "17:00",
    startPoint: "Rameshwar Chowk",
    endPoint: "Shanipar Chowk",
    alternateRoute: "Closed for mandal dekhavas and foot processions",
    coordinates: [
      [73.8565, 18.5130],
      [73.8545, 18.5142],
    ],
  },
  {
    id: "dengle-bridge-approach",
    name: "Dengle Bridge to Mangalwar Peth Entry",
    closedAfter: "17:00",
    startPoint: "Dengle Bridge South end",
    endPoint: "Kumbharves Chowk",
    alternateRoute: "Diverted towards Pune Station / Sangamwadi",
    coordinates: [
      [73.8580, 18.5270],
      [73.8605, 18.5230],
    ],
  },
  {
    id: "shaniwar-peth-river-lane",
    name: "Shaniwar Peth Riverside Lane",
    closedAfter: "17:00",
    startPoint: "Rashtrabhushan Chowk",
    endPoint: "Ahilyadevi Holkar School Road",
    alternateRoute: "Use Riverbed paved motor track until full",
    coordinates: [
      [73.8480, 18.5195],
      [73.8520, 18.5205],
    ],
  },
  {
    id: "narayan-peth-main",
    name: "Narayan Peth Laxmi Road Connector",
    closedAfter: "17:00",
    startPoint: "Ganjave Chowk",
    endPoint: "Patrya Maruti Chowk",
    alternateRoute: "Pedestrian only",
    coordinates: [
      [73.8470, 18.5150],
      [73.8505, 18.5175],
      [73.8530, 18.5190],
    ],
  },
];

// 6 One-Way Foot Corridors
export const FOOT_CORRIDORS: FootCorridor[] = [
  {
    id: "shaniwarwada-dagdusheth",
    direction: "Shaniwar Wada → Dagdusheth (Walk South)",
    description: "Main arterial walking entry from Shaniwar Wada / Kakasaheb Gadgil Chowk southward toward Dagdusheth Halwai Ganpati.",
    warning: "The crowd walks one way here. You will not be able to walk back.",
    coordinates: [
      [73.8550, 18.5195],
      [73.8565, 18.5165],
    ],
  },
  {
    id: "guruji-tulshibaug",
    direction: "Guruji Talim → Tulshibaug (Walk South)",
    description: "Pedestrian queue passage moving from Ganpati Chowk through Laxmi Road south into Tulshibaug temple complex.",
    warning: "The crowd walks one way here. You will not be able to walk back.",
    coordinates: [
      [73.8560, 18.5150],
      [73.8562, 18.5135],
    ],
  },
  {
    id: "tulshibaug-jilbya",
    direction: "Tulshibaug → Jilbya Maruti (Walk South)",
    description: "One-way exit corridor exiting Tulshibaug southward past Jilbya Maruti toward Mandai Market.",
    warning: "The crowd walks one way here. You will not be able to walk back.",
    coordinates: [
      [73.8562, 18.5135],
      [73.8565, 18.5120],
    ],
  },
  {
    id: "tulshibaug-bajirao",
    direction: "Tulshibaug → Bajirao Road (Walk West)",
    description: "Fast-drain one-way pedestrian exit moving west through the narrow alleys out to Bajirao Road.",
    warning: "The crowd walks one way here. You will not be able to walk back.",
    coordinates: [
      [73.8562, 18.5135],
      [73.8535, 18.5135],
    ],
  },
  {
    id: "tulshibaug-east-lane",
    direction: "Tulshibaug East → Main Lane (Walk East)",
    description: "One-way dispersal lane heading eastward from Tulshibaug towards Sonya Maruti Chowk / Belbaug.",
    warning: "The crowd walks one way here. You will not be able to walk back.",
    coordinates: [
      [73.8562, 18.5135],
      [73.8590, 18.5140],
    ],
  },
  {
    id: "dagdusheth-gotiram",
    direction: "Dagdusheth → Gotiram Bhaiya Chowk (Walk South)",
    description: "Continuous darshan egress flowing past the main Dagdusheth sanctum south into Babu Genu / Mandai area.",
    warning: "The crowd walks one way here. You will not be able to walk back.",
    coordinates: [
      [73.8565, 18.5165],
      [73.8568, 18.5145],
    ],
  },
];

// 23 Key Traffic & Police Junctions
export const TRAFFIC_JUNCTIONS: TrafficJunction[] = [
  { id: 1, name: "Alka Talkies Chowk (Tilak Chowk)", area: "Deccan / Sadashiv", lat: 18.5135, lng: 73.8465, restriction: "Major diversion point. Vehicles turned to Karve Rd or Riverbed." },
  { id: 2, name: "Kakasaheb Gadgil Statue Chowk", area: "Shaniwar Peth", lat: 18.5225, lng: 73.8555, restriction: "No entry southward into Shivaji Road after 17:00." },
  { id: 3, name: "Appa Balwant (ABC) Chowk", area: "Budhwar Peth", lat: 18.5168, lng: 73.8532, restriction: "Bajirao Road vehicular traffic stopped. Foot traffic only." },
  { id: 4, name: "Phadke Haud Chowk", area: "Kasba Peth", lat: 18.5180, lng: 73.8592, restriction: "Entry barricaded for ceremonial procession route." },
  { id: 5, name: "Jedhe Chowk (Swargate)", area: "Swargate", lat: 18.5015, lng: 73.8580, restriction: "Vehicles diverted outward toward Shankar Sheth Road." },
  { id: 6, name: "Sonya Maruti Chowk", area: "Raviwar Peth", lat: 18.5165, lng: 73.8610, restriction: "Laxmi Road eastern vehicular cutoff." },
  { id: 7, name: "Shanipar Chowk", area: "Sadashiv Peth", lat: 18.5142, lng: 73.8545, restriction: "Internal Peth barricade & foot corridor control." },
  { id: 8, name: "Puram Chowk", area: "Sadashiv Peth", lat: 18.5040, lng: 73.8530, restriction: "Bajirao Road southern access closed to vehicles." },
  { id: 9, name: "Belbaug Chowk", area: "Budhwar Peth", lat: 18.5160, lng: 73.8570, restriction: "High security pedestrian confluence (Dagdusheth / Laxmi Rd)." },
  { id: 10, name: "Rameshwar Chowk", area: "Shukrawar Peth", lat: 18.5130, lng: 73.8565, restriction: "Mandai pedestrian corridor entry." },
  { id: 11, name: "Senadatta Chowk", area: "Sadashiv Peth", lat: 18.5090, lng: 73.8440, restriction: "Shastri Road vehicle filter." },
  { id: 12, name: "Dengle Bridge Chowk", area: "Mangalwar Peth", lat: 18.5265, lng: 73.8575, restriction: "Peth entry blocked from Old Sangam / RTO side." },
  { id: 13, name: "Jijamata Chowk", area: "Kasba Peth", lat: 18.5195, lng: 73.8565, restriction: "Kasba Ganpati ceremonial zone filter." },
  { id: 14, name: "Kumbharves Chowk", area: "Mangalwar Peth", lat: 18.5230, lng: 73.8615, restriction: "Access restricted towards Kasba Peth." },
  { id: 15, name: "Rashtrabhushan Chowk", area: "Shaniwar Peth", lat: 18.5195, lng: 73.8480, restriction: "Narayan Peth access checkpoint." },
  { id: 16, name: "Ganjave Chowk", area: "Narayan Peth", lat: 18.5150, lng: 73.8470, restriction: "Riverbed parking exit monitor." },
  { id: 17, name: "Daruwala Bridge Chowk", area: "Raviwar Peth", lat: 18.5185, lng: 73.8645, restriction: "Diversion toward Apollo Talkies." },
  { id: 18, name: "Seven Loves Chowk", area: "Bhavani Peth", lat: 18.5025, lng: 73.8690, restriction: "Outer ring diversion for buses & trucks." },
  { id: 19, name: "Apollo Cinema Chowk", area: "Rasta Peth", lat: 18.5160, lng: 73.8670, restriction: "Eastern peripheral parking check." },
  { id: 20, name: "Bhide Bridge Chowk", area: "Deccan", lat: 18.5160, lng: 73.8440, restriction: "Bridge closed to all motorized 4-wheelers." },
  { id: 21, name: "Garware Bridge / Khanduji Baba Chowk", area: "Deccan", lat: 18.5140, lng: 73.8390, restriction: "Karve Road access junction." },
  { id: 22, name: "S.P. College Chowk (Tilak Rd)", area: "Sadashiv Peth", lat: 18.5075, lng: 73.8510, restriction: "Pedestrian priority & parking guidance post." },
  { id: 23, name: "Madiwale Colony Chowk", area: "Sadashiv Peth", lat: 18.5110, lng: 73.8485, restriction: "Sadashiv Peth residential filter." },
];
