export type QuizState = { index: number; answers: number[]; finished: boolean };
export const initialQuizState = (): QuizState => ({ index: 0, answers: [], finished: false });
export type QuizAction = { type: 'answer'; choice: number; optionCount: number } | { type: 'next'; questionCount: number } | { type: 'restart' };
export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  if (action.type === 'restart') return initialQuizState();
  if (state.finished) return state;
  if (action.type === 'answer') {
    if (state.answers.length > state.index || !Number.isInteger(action.choice) || action.choice < 0 || action.choice >= action.optionCount) return state;
    return { ...state, answers: [...state.answers, action.choice] };
  }
  if (state.answers.length <= state.index) return state;
  return state.index + 1 >= action.questionCount ? { ...state, finished: true } : { ...state, index: state.index + 1 };
}
export function quizScore(answers: readonly number[], correctAnswers: readonly number[]): number {
  return correctAnswers.reduce((score, answer, index) => score + (answers[index] === answer ? 1 : 0), 0);
}