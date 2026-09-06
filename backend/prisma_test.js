const { PrismaClient } = require('@prisma/client');

const ext = {
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        console.log('EXTENSION CALLED:', model, operation);
        return query(args);
      }
    }
  }
};

const client = new PrismaClient({ log: ['error'] });
const extended = client.$extends(ext);

console.log('Extended has job:', typeof extended.job);
console.log('Extended has company:', typeof extended.company);
console.log('Same prototype?', Object.getPrototypeOf(extended) === Object.getPrototypeOf(client));
console.log('Extended own props:', Object.getOwnPropertyNames(extended).filter(k => !k.startsWith('_')));

// Try copying to a new PrismaClient
const client2 = new PrismaClient({ log: ['error'] });
Object.assign(client2, extended);
console.log('After Object.assign, client2.job type:', typeof client2.job);
console.log('client2.job === extended.job?', client2.job === extended.job);

// Test with setPrototypeOf
const client3 = new PrismaClient({ log: ['error'] });
Object.setPrototypeOf(client3, Object.getPrototypeOf(extended));
console.log('After setPrototypeOf, client3.job type:', typeof client3.job);

(async () => {
  await client.$disconnect();
  await client2.$disconnect();
  await client3.$disconnect();
  process.exit(0);
})();
