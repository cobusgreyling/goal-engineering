import { test } from 'node:test';
import assert from 'node:assert/strict';
import { add, subtract } from '../src/math.js';

test('add sums numbers', () => {
  assert.equal(add(2, 3), 5);
});

test('subtract — intentionally failing until goal fixes it', () => {
  assert.equal(subtract(5, 3), 3);
});

test('add handles negatives — intentionally failing', () => {
  assert.equal(add(-1, 1), 0);
});