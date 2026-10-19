import { describe, expect, it } from 'vitest';
import { initialQuizState, quizReducer, quizScore } from './quiz-model';
import { labQuizzes } from './quiz-catalog';

describe('Lab quizzes', () => {
  it('covers all 17 lab topics, with matching bilingual choices and valid answers', () => {
    expect(Object.keys(labQuizzes).sort()).toEqual(['/resistors','/capacitors','/inductors','/diodes','/transistors','/circuits','/circuits/kirchhoff','/circuits/resonance','/circuits/lenz','/logic-gates','/flip-flops','/adders','/bit-shifts','/antennas','/radio/modulation','/radio/receiver','/radio/transmitter'].sort());
    for (const quiz of Object.values(labQuizzes)) {
      expect(quiz.questions.length).toBe(3);
      for (const question of quiz.questions) {
        expect(question.options[question.correct]).toBeDefined();
        expect(Number.isInteger(question.correct)).toBe(true);
        for (const language of ['en', 'hu'] as const) {
          expect(question.prompt[language].length).toBeGreaterThan(0);
          expect(question.explanation[language].length).toBeGreaterThan(0);
          expect(question.options.every(option => option[language].length > 0)).toBe(true);
        }
      }
    }
  });
  it('cannot advance before submitting an answer', () => {
    expect(quizReducer(initialQuizState(), { type: 'next', questionCount: 3 })).toEqual(initialQuizState());
  });
  it('locks submitted answers and rejects invalid choices', () => {
    const start = initialQuizState();
    expect(quizReducer(start, { type: 'answer', choice: 3, optionCount: 3 })).toEqual(start);
    expect(quizReducer(start, { type: 'answer', choice: -1, optionCount: 3 })).toEqual(start);
    const answered = quizReducer(start, { type: 'answer', choice: 1, optionCount: 3 });
    expect(quizReducer(answered, { type: 'answer', choice: 2, optionCount: 3 }).answers).toEqual([1]);
  });
  it('completes after the final submitted question and resets on retry', () => {
    let state = initialQuizState();
    for (const choice of [0, 1, 2]) {
      state = quizReducer(state, { type: 'answer', choice, optionCount: 3 });
      state = quizReducer(state, { type: 'next', questionCount: 3 });
    }
    expect(state).toEqual({ index: 2, answers: [0, 1, 2], finished: true });
    expect(quizReducer(state, { type: 'restart' })).toEqual(initialQuizState());
  });
  it('scores only correct submitted answers', () => {
    expect(quizScore([0, 0, 2], [0, 1, 2])).toBe(2);
    expect(quizScore([], [0, 1, 2])).toBe(0);
    expect(quizScore([0, 1, 2], [0, 1, 2])).toBe(3);
  });
});