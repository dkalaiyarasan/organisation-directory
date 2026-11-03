
import { readFileSync, writeFileSync } from 'node:fs';

const fixturePath = new URL(
  '../src/assets/data/organisations.json',
  import.meta.url,
);

const originalRecords = JSON.parse(
  readFileSync(fixturePath, 'utf8'),
).slice(0, 8);

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
    id: number % 2 === 0 ? `ORG-${1000 + number}` : 1000 + number,

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

console.log(`Original records preserved: ${originalRecords.length}`);
console.log(`Generated records: ${generatedRecords.length}`);
console.log(`Total records: ${allRecords.length}`);
