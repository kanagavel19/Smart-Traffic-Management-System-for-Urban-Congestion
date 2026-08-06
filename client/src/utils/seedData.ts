// Clean TS Client static mocks for memory fallback mode

export const seedUsers = [
  {
    name: 'Chief Admin',
    email: 'admin@traffic.gov',
    role: 'Administrator',
    badgeNumber: 'AD-001'
  },
  {
    name: 'Officer John Smith',
    email: 'officer@traffic.gov',
    role: 'Traffic Officer',
    badgeNumber: 'TO-482'
  },
  {
    name: 'Citizen Jane Doe',
    email: 'citizen@traffic.gov',
    role: 'Citizen',
    badgeNumber: ''
  }
];

export const seedIntersections = [
  {
    _id: '60c72b2f9b1d8b2bad000001',
    name: '5th Avenue & 42nd Street (Grand Central)',
    lat: 40.7527,
    lng: -73.9818,
    congestionIndex: 78,
    status: 'Heavy',
    lanes: [
      { direction: 'Northbound', capacity: 120, currentVehicleCount: 104, averageSpeed: 18 },
      { direction: 'Southbound', capacity: 120, currentVehicleCount: 92, averageSpeed: 22 },
      { direction: 'Eastbound', capacity: 90, currentVehicleCount: 81, averageSpeed: 12 },
      { direction: 'Westbound', capacity: 90, currentVehicleCount: 65, averageSpeed: 15 }
    ]
  },
  {
    _id: '60c72b2f9b1d8b2bad000002',
    name: 'Broadway & 34th Street (Herald Square)',
    lat: 40.7489,
    lng: -73.9881,
    congestionIndex: 45,
    status: 'Moderate',
    lanes: [
      { direction: 'Northbound', capacity: 100, currentVehicleCount: 52, averageSpeed: 38 },
      { direction: 'Southbound', capacity: 100, currentVehicleCount: 41, averageSpeed: 42 },
      { direction: 'Broadway-Diagonal', capacity: 80, currentVehicleCount: 35, averageSpeed: 30 }
    ]
  },
  {
    _id: '60c72b2f9b1d8b2bad000003',
    name: 'Madison Avenue & 57th Street (Midtown North)',
    lat: 40.7620,
    lng: -73.9723,
    congestionIndex: 25,
    status: 'Clear',
    lanes: [
      { direction: 'Northbound', capacity: 110, currentVehicleCount: 28, averageSpeed: 48 },
      { direction: 'Southbound', capacity: 110, currentVehicleCount: 22, averageSpeed: 52 },
      { direction: 'Eastbound', capacity: 80, currentVehicleCount: 20, averageSpeed: 35 }
    ]
  },
  {
    _id: '60c72b2f9b1d8b2bad000004',
    name: '7th Avenue & 23rd Street (Chelsea)',
    lat: 40.7441,
    lng: -73.9961,
    congestionIndex: 90,
    status: 'Emergency',
    lanes: [
      { direction: 'Northbound', capacity: 120, currentVehicleCount: 115, averageSpeed: 8 },
      { direction: 'Southbound', capacity: 120, currentVehicleCount: 98, averageSpeed: 14 },
      { direction: 'Eastbound', capacity: 70, currentVehicleCount: 68, averageSpeed: 5 },
      { direction: 'Westbound', capacity: 70, currentVehicleCount: 60, averageSpeed: 6 }
    ]
  },
  {
    _id: '60c72b2f9b1d8b2bad000005',
    name: 'Lexington Avenue & 86th Street (Upper East)',
    lat: 40.7794,
    lng: -73.9555,
    congestionIndex: 12,
    status: 'Clear',
    lanes: [
      { direction: 'Northbound', capacity: 100, currentVehicleCount: 12, averageSpeed: 55 },
      { direction: 'Southbound', capacity: 100, currentVehicleCount: 14, averageSpeed: 58 }
    ]
  }
];

export const seedSignals = [
  {
    _id: '60c72c2f9b1d8b2bad000011',
    intersectionId: '60c72b2f9b1d8b2bad000001',
    intersectionName: '5th Avenue & 42nd Street (Grand Central)',
    mode: 'Adaptive',
    currentDirection: 'Northbound',
    greenDuration: 40,
    yellowDuration: 5,
    redDuration: 45,
    timeRemaining: 24,
    phases: [
      { direction: 'Northbound', state: 'Green', density: 86 },
      { direction: 'Southbound', state: 'Green', density: 76 },
      { direction: 'Eastbound', state: 'Red', density: 90 },
      { direction: 'Westbound', state: 'Red', density: 72 }
    ]
  },
  {
    _id: '60c72c2f9b1d8b2bad000012',
    intersectionId: '60c72b2f9b1d8b2bad000002',
    intersectionName: 'Broadway & 34th Street (Herald Square)',
    mode: 'Adaptive',
    currentDirection: 'Broadway-Diagonal',
    greenDuration: 30,
    yellowDuration: 5,
    redDuration: 35,
    timeRemaining: 12,
    phases: [
      { direction: 'Northbound', state: 'Red', density: 52 },
      { direction: 'Southbound', state: 'Red', density: 41 },
      { direction: 'Broadway-Diagonal', state: 'Green', density: 43 }
    ]
  },
  {
    _id: '60c72c2f9b1d8b2bad000013',
    intersectionId: '60c72b2f9b1d8b2bad000003',
    intersectionName: 'Madison Avenue & 57th Street (Midtown North)',
    mode: 'Fixed',
    currentDirection: 'Southbound',
    greenDuration: 25,
    yellowDuration: 4,
    redDuration: 29,
    timeRemaining: 18,
    phases: [
      { direction: 'Northbound', state: 'Green', density: 25 },
      { direction: 'Southbound', state: 'Green', density: 20 },
      { direction: 'Eastbound', state: 'Red', density: 25 }
    ]
  },
  {
    _id: '60c72c2f9b1d8b2bad000014',
    intersectionId: '60c72b2f9b1d8b2bad000004',
    intersectionName: '7th Avenue & 23rd Street (Chelsea)',
    mode: 'Emergency',
    currentDirection: 'Northbound',
    greenDuration: 60,
    yellowDuration: 5,
    redDuration: 15,
    timeRemaining: 45,
    phases: [
      { direction: 'Northbound', state: 'Green', density: 95 },
      { direction: 'Southbound', state: 'Red', density: 81 },
      { direction: 'Eastbound', state: 'Red', density: 97 },
      { direction: 'Westbound', state: 'Red', density: 85 }
    ]
  },
  {
    _id: '60c72c2f9b1d8b2bad000015',
    intersectionId: '60c72b2f9b1d8b2bad000005',
    intersectionName: 'Lexington Avenue & 86th Street (Upper East)',
    mode: 'Adaptive',
    currentDirection: 'Southbound',
    greenDuration: 30,
    yellowDuration: 5,
    redDuration: 35,
    timeRemaining: 8,
    phases: [
      { direction: 'Northbound', state: 'Red', density: 12 },
      { direction: 'Southbound', state: 'Green', density: 14 }
    ]
  }
];

export const seedCameras = [
  {
    _id: '60c72d2f9b1d8b2bad000021',
    intersectionId: '60c72b2f9b1d8b2bad000001',
    name: 'CCTV-01: Grand Central Outer',
    lat: 40.7530,
    lng: -73.9815,
    status: 'Online',
    imageUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=600&auto=format&fit=crop',
    liveMetrics: { car: 42, bus: 8, truck: 4, motorcycle: 12, bicycle: 5, rickshaw: 0, pedestrian: 35, emergency: 0 },
    averageSpeed: 16,
    densityScore: 82,
    violations: { overspeeding: 1, redLight: 0, noHelmet: 2, wrongWay: 0 }
  },
  {
    _id: '60c72d2f9b1d8b2bad000022',
    intersectionId: '60c72b2f9b1d8b2bad000002',
    name: 'CCTV-02: Herald Square Junction',
    lat: 40.7492,
    lng: -73.9878,
    status: 'Online',
    imageUrl: 'https://images.unsplash.com/photo-1494783367193-149034c05e8f?q=80&w=600&auto=format&fit=crop',
    liveMetrics: { car: 21, bus: 3, truck: 1, motorcycle: 8, bicycle: 4, rickshaw: 0, pedestrian: 60, emergency: 0 },
    averageSpeed: 38,
    densityScore: 48,
    violations: { overspeeding: 3, redLight: 1, noHelmet: 0, wrongWay: 0 }
  },
  {
    _id: '60c72d2f9b1d8b2bad000023',
    intersectionId: '60c72b2f9b1d8b2bad000004',
    name: 'CCTV-03: Chelsea Expressway Camera',
    lat: 40.7445,
    lng: -73.9958,
    status: 'Online',
    imageUrl: 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=600&auto=format&fit=crop',
    liveMetrics: { car: 68, bus: 12, truck: 8, motorcycle: 18, bicycle: 2, rickshaw: 0, pedestrian: 12, emergency: 1 },
    averageSpeed: 7,
    densityScore: 92,
    violations: { overspeeding: 0, redLight: 4, noHelmet: 8, wrongWay: 1 }
  },
  {
    _id: '60c72d2f9b1d8b2bad000024',
    intersectionId: '60c72b2f9b1d8b2bad000005',
    name: 'CCTV-04: Upper East Side Cam',
    lat: 40.7790,
    lng: -73.9559,
    status: 'Maintenance',
    imageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?q=80&w=600&auto=format&fit=crop',
    liveMetrics: { car: 8, bus: 0, truck: 0, motorcycle: 2, bicycle: 1, rickshaw: 0, pedestrian: 5, emergency: 0 },
    averageSpeed: 56,
    densityScore: 12,
    violations: { overspeeding: 0, redLight: 0, noHelmet: 0, wrongWay: 0 }
  }
];

export const seedIncidents = [
  {
    _id: '60c72e2f9b1d8b2bad000031',
    title: 'Multi-Vehicle Collision',
    type: 'Accident',
    severity: 'Critical',
    lat: 40.7441,
    lng: -73.9961,
    description: 'A three-car fender-bender blocking 2 main lanes is causing severe backlog.',
    status: 'Active',
    reportedBy: 'AI Camera Sensor CCTV-03',
    assignedOfficer: 'Officer John Smith',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    _id: '60c72e2f9b1d8b2bad000032',
    title: 'Stalled Delivery Truck',
    type: 'Stalled Vehicle',
    severity: 'Medium',
    lat: 40.7527,
    lng: -73.9818,
    description: 'FedEx delivery truck stalled with hazard lights on in the northbound bus lane.',
    status: 'Assigned',
    reportedBy: 'AI Camera Sensor CCTV-01',
    assignedOfficer: 'Officer John Smith',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  }
];

export const seedEmergencies = [
  {
    _id: '60c72f2f9b1d8b2bad000041',
    vehicleNumber: 'AMB-109',
    type: 'Ambulance',
    status: 'En Route',
    currentLat: 40.7580,
    currentLng: -73.9780,
    destLat: 40.7441,
    destLng: -73.9961,
    routePoints: [
      [40.7580, -73.9780],
      [40.7527, -73.9818],
      [40.7489, -73.9881],
      [40.7441, -73.9961]
    ] as [number, number][],
    speed: 55,
    activeGreenCorridor: true,
    priorityIntersectionIds: [
      '60c72b2f9b1d8b2bad000001',
      '60c72b2f9b1d8b2bad000002',
      '60c72b2f9b1d8b2bad000004'
    ],
    createdAt: new Date().toISOString()
  }
];

export const seedComplaints = [
  {
    _id: '60c7302f9b1d8b2bad000051',
    citizenName: 'Sarah Jenkins',
    citizenEmail: 'sarah.j@gmail.com',
    type: 'Road Damage',
    description: 'Deep pothole in center lane right after 23rd St intersection. Needs repair ASAP, cars are swerving.',
    lat: 40.7438,
    lng: -73.9968,
    address: 'Seventh Ave, opposite pharmacy shop',
    status: 'In Progress',
    officerNotes: 'Assigned to NY Highroad Repair team. Scheduled for repair tonight.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: '60c7302f9b1d8b2bad000052',
    citizenName: 'Robert Lee',
    citizenEmail: 'robert.lee@yahoo.com',
    type: 'Broken Signal',
    description: 'Pedestrian crossing crosswalk button refuses to light up or stop traffic. Crossing is dangerous.',
    lat: 40.7794,
    lng: -73.9555,
    address: 'Lexington Ave & E 86th St, North-West corner',
    status: 'Pending',
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString()
  }
];

export const seedWeatherData = {
  temperature: 28,
  condition: 'Rain',
  humidity: 82,
  visibility: 6.5,
  windSpeed: 14,
  rainfall: 3.2,
  congestionMultiplier: 1.25,
  timestamp: new Date().toISOString()
};

export const seedAnalytics = [
  { timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), averageSpeed: 42, congestionIndex: 28, activeIncidentCount: 1, signalEfficiency: 82 },
  { timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), averageSpeed: 38, congestionIndex: 35, activeIncidentCount: 2, signalEfficiency: 79 },
  { timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), averageSpeed: 21, congestionIndex: 72, activeIncidentCount: 3, signalEfficiency: 68 },
  { timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), averageSpeed: 18, congestionIndex: 85, activeIncidentCount: 3, signalEfficiency: 62 },
  { timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), averageSpeed: 35, congestionIndex: 48, activeIncidentCount: 2, signalEfficiency: 75 },
  { timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), averageSpeed: 40, congestionIndex: 38, activeIncidentCount: 2, signalEfficiency: 81 },
  { timestamp: new Date().toISOString(), averageSpeed: 44, congestionIndex: 24, activeIncidentCount: 2, signalEfficiency: 88 }
];
