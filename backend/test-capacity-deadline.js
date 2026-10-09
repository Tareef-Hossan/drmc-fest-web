// Test script to verify capacity and deadline enforcement logic
// This simulates the backend validation logic from functions/index.js

console.log('Testing Capacity and Deadline Enforcement Logic\n');

// Mock event data
const testEvents = {
  fullCapacity: {
    id: 'test-full',
    name: 'Full Capacity Event',
    capacity: 10,
    registered: 10,
    deadline: '2026-12-31T23:59:59'
  },
  hasCapacity: {
    id: 'test-has-space',
    name: 'Has Capacity Event',
    capacity: 10,
    registered: 5,
    deadline: '2026-12-31T23:59:59'
  },
  deadlinePassed: {
    id: 'test-expired',
    name: 'Expired Event',
    capacity: 10,
    registered: 5,
    deadline: '2020-01-01T23:59:59' // Past date
  },
  deadlineValid: {
    id: 'test-valid',
    name: 'Valid Event',
    capacity: 10,
    registered: 5,
    deadline: '2026-12-31T23:59:59' // Future date
  }
};

function testRegistration(eventData) {
  const errors = [];

  // Check capacity (from lines 78-80 of backend/functions/index.js)
  if (eventData.registered >= eventData.capacity) {
    errors.push('Event is at full capacity');
  }

  // Check deadline (from lines 83-85 of backend/functions/index.js)
  if (new Date(eventData.deadline) < new Date()) {
    errors.push('Registration deadline has passed');
  }

  return {
    allowed: errors.length === 0,
    errors
  };
}

// Run tests
console.log('Test 1: Full Capacity Event');
const result1 = testRegistration(testEvents.fullCapacity);
console.log(`  Event: ${testEvents.fullCapacity.name}`);
console.log(`  Capacity: ${testEvents.fullCapacity.capacity}, Registered: ${testEvents.fullCapacity.registered}`);
console.log(`  Result: ${result1.allowed ? 'ALLOWED' : 'BLOCKED'}`);
console.log(`  Errors: ${result1.errors.join(', ') || 'None'}\n`);

console.log('Test 2: Has Capacity Event');
const result2 = testRegistration(testEvents.hasCapacity);
console.log(`  Event: ${testEvents.hasCapacity.name}`);
console.log(`  Capacity: ${testEvents.hasCapacity.capacity}, Registered: ${testEvents.hasCapacity.registered}`);
console.log(`  Result: ${result2.allowed ? 'ALLOWED' : 'BLOCKED'}`);
console.log(`  Errors: ${result2.errors.join(', ') || 'None'}\n`);

console.log('Test 3: Deadline Passed Event');
const result3 = testRegistration(testEvents.deadlinePassed);
console.log(`  Event: ${testEvents.deadlinePassed.name}`);
console.log(`  Deadline: ${testEvents.deadlinePassed.deadline}`);
console.log(`  Current Date: ${new Date().toISOString()}`);
console.log(`  Result: ${result3.allowed ? 'ALLOWED' : 'BLOCKED'}`);
console.log(`  Errors: ${result3.errors.join(', ') || 'None'}\n`);

console.log('Test 4: Valid Deadline Event');
const result4 = testRegistration(testEvents.deadlineValid);
console.log(`  Event: ${testEvents.deadlineValid.name}`);
console.log(`  Deadline: ${testEvents.deadlineValid.deadline}`);
console.log(`  Current Date: ${new Date().toISOString()}`);
console.log(`  Result: ${result4.allowed ? 'ALLOWED' : 'BLOCKED'}`);
console.log(`  Errors: ${result4.errors.join(', ') || 'None'}\n`);

// Summary
console.log('='.repeat(50));
console.log('Test Summary:');
console.log(`  Full Capacity Check: ${result1.allowed ? 'FAIL (should be blocked)' : 'PASS'}`);
console.log(`  Has Capacity Check: ${result2.allowed ? 'PASS' : 'FAIL (should be allowed)'}`);
console.log(`  Deadline Passed Check: ${result3.allowed ? 'FAIL (should be blocked)' : 'PASS'}`);
console.log(`  Valid Deadline Check: ${result4.allowed ? 'PASS' : 'FAIL (should be allowed)'}`);
console.log('='.repeat(50));
