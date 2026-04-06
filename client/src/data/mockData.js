import { demoCharities } from './demoCharities';

export const mockUsers = [
  {
    _id: 'user-admin-1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    status: 'active',
    subscriptionStatus: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    _id: 'user-player-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    status: 'active',
    subscriptionStatus: 'active',
    selectedCharity: 'demo-golf-for-kids',
    charityPercentage: 50,
    createdAt: '2026-02-15T00:00:00Z',
  },
  {
    _id: 'user-player-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    status: 'active',
    subscriptionStatus: 'inactive',
    createdAt: '2026-03-10T00:00:00Z',
  }
];

export const mockScores = [
  { _id: 's1', value: 72, date: '2026-04-01T10:00:00Z', userId: 'user-player-1' },
  { _id: 's2', value: 75, date: '2026-04-02T10:00:00Z', userId: 'user-player-1' },
  { _id: 's3', value: 70, date: '2026-04-03T10:00:00Z', userId: 'user-player-1' },
  { _id: 's4', value: 74, date: '2026-04-04T10:00:00Z', userId: 'user-player-1' },
  { _id: 's5', value: 71, date: '2026-04-05T10:00:00Z', userId: 'user-player-1' },
];

export const mockDraws = [
  {
    _id: 'draw-last-week',
    status: 'published',
    drawDate: '2026-03-31T23:59:59Z',
    winners: [
      { userId: { _id: 'user-player-1', name: 'John Doe' }, prize: 'Course Voucher', paymentStatus: 'paid' }
    ],
    charityStats: [
      { charityId: 'demo-golf-for-kids', totalRaised: 1200 }
    ],
    totalPool: 5000,
  },
  {
    _id: 'draw-current',
    status: 'active',
    drawDate: '2026-04-07T23:59:59Z',
    entriesCount: 154,
    totalPool: 4200,
  }
];

export const mockAdminStats = {
  totalUsers: 154,
  activeSubscriptions: 120,
  totalRaised: 42500,
  pendingDraws: 1,
  recentActivity: [
    { type: 'user_joined', user: 'Mike Ross', date: '2026-04-05T14:30:00Z' },
    { type: 'score_added', user: 'John Doe', date: '2026-04-05T12:00:00Z' },
  ]
};

export const mockCharities = [...demoCharities];
