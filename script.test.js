/**
 * @jest-environment jsdom
 */
const { generateWelcomeMessage } = require('./script');

describe('generateWelcomeMessage', () => {
  // PASSING test
  test('returns a morning greeting at 9 AM', () => {
    expect(generateWelcomeMessage(9)).toBe('Good morning! Pin your first thought of the day 🌅');
  });

  // FAILING test (intentional, for the CI demo)
  // TO MAKE IT PASS: change the expected string on the line below
  // from 'Good night!' to 'Good evening! Pin your thoughts before bed 🌙'
  test('returns an evening greeting at 9 PM', () => {
    expect(generateWelcomeMessage(21)).toBe('Good evening! Pin your thoughts before bed 🌙'); // <-- CHANGE THIS LINE
  });
});
