
import { writeFileSync } from 'node:fs';

const fixturePath = new URL(
  '../src/assets/data/organisations.json',
  import.meta.url,
);

// Original assessment records.
// Preserve their inconsistencies intentionally.
const originalRecords = [
  {
    id: 1,
    name: 'Northwind Traders',
    status: 'active',
    memberCount: 42,
    owner: { email: 'ops@northwind.example' },
    createdAt: '2024-03-11T09:12:00Z',
  },
  {
    id: 2,
    name: '',
    status: 'ACTIVE',
    memberCount: '12',
    owner: { email: 'a@b.example' },
    createdAt: 1710150720000,
  },
  {
    id: 3,
    name: null,
    status: 'Active',
    memberCount: -1,
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 42,
    name: 'Globex Corporation',
    status: 'suspended',
    memberCount: 7,
    owner: { email: 'hq@globex.example' },
    createdAt: '2023-11-30T14:45:10Z',
  },
  {
    id: 42,
    name: 'Globex Corporation Ltd',
    status: 'actve',
    memberCount: 7,
    owner: { email: 'hq@globex.example' },
    createdAt: '2023-11-30T14:45:10Z',
  },
  {
    id: 6,
    name: 'شركة الأمل ��',
    status: 'active',
    memberCount: 3,
    owner: { email: 'info@amal.example' },
    createdAt: '2025-06-01T08:00:00Z',
  },
  {
    id: 7,
    name: 'The Very Long Organisation Name That Somebody Actually Typed Into The Field Because Nobody Validated It And It Keeps Going Well Past Any Reasonable Column Width And Still Has Not Stopped',
    status: 'inactive',
    memberCount: 0,
    owner: { email: 'long@example.com' },
    createdAt: '2024-07-19T16:20:00Z',
  },
  {
    id: 8,
    name: 'Initech',
    status: null,
    memberCount: null,
    owner: { email: 'not-an-email' },
    createdAt: 'not a date',
  },
];

const statuses = ['active', 'inactive', 'pending'];

const owners = [
  'James Wilson',
  'Sophia Martin',
  'Daniel Thomas',
  'Emma Anderson',
  'William Taylor',
  'Isabella Moore',
];

const generatedRecords = Array.from({ length: 129 }, (_, index) => {
  const number = index + 1;

  const memberCount = 10 + ((number * 17) % 450);

  return {
    id: number % 2 === 0
      ? `ORG-${1000 + number}`
      : 1000 + number,

    name: number % 7 === 0
      ? `  Organisation ${number}  `
      : `Organisation ${number}`,

    status: number % 17 === 0
      ? ' archived '
      : statuses[index % statuses.length],

    memberCount: number % 23 === 0
      ? null
      : number % 3 === 0
        ? String(memberCount)
        : memberCount,

    owner: number % 19 === 0
      ? null
      : owners[index % owners.length],

    createdAt: number % 29 === 0
      ? 'invalid-date'
      : new Date(
          Date.UTC(
            2022 + (index % 5),
            index % 12,
            (index % 28) + 1,
          ),
        ).toISOString(),
  };
});

const allRecords = [...originalRecords, ...generatedRecords];

writeFileSync(
  fixturePath,
  `${JSON.stringify(allRecords, null, 2)}\n`,
  'utf8',
);

console.log(`Original assessment records: ${originalRecords.length}`);
console.log(`Generated records: ${generatedRecords.length}`);
console.log(`Total records: ${allRecords.length}`);
