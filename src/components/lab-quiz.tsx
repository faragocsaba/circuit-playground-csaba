import { useReducer, useState } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { ArrowRight, CheckCircle2, CircleHelp, RotateCcw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/lib/localization/context';
import { labQuizzes, type LabQuizData } from '@/lib/quiz-catalog';
import { initialQuizState, quizReducer, quizScore } from '@/lib/quiz-model';

export function LabQuiz() {
  const pathname = useRouterState({ select: state => state.location.pathname });
  const quiz = labQuizzes[pathname.replace(/\/$/, '')];
  return quiz ? <Quiz key={pathname} quiz={quiz} /> : null;
}

function Quiz({ quiz }: { quiz: LabQuizData }) {
  const { language, setLanguage } = useLanguage();
  const hu = language === 'hu';
  const [state, dispatch] = useReducer(quizReducer, undefined, initialQuizState);
  const [selected, setSelected] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const question = quiz.questions[state.index];
  if (!question) return null;
  const answered = state.answers.length > state.index;
  const correct = state.answers[state.index] === question.correct;
  const score = quizScore(state.answers, quiz.questions.map(item => item.correct));
  function restart() { dispatch({ type: 'restart' }); setSelected(null); }
  return <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="sm" className="quiz-trigger" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)} aria-label={hu ? 'Laborkvíz megnyitása' : 'Open lab quiz'}>
        <CircleHelp aria-hidden="true" /><span>{hu ? 'Kvíz' : 'Quiz'}</span>
      </Button>
    <DialogContent className="quiz-dialog">
      <div className="pr-6">
        <DialogTitle>{hu ? 'Kvíz' : 'Quiz'} · {quiz.title[language]}</DialogTitle>
        <DialogDescription className="mt-2">{hu ? 'Tudáspróba' : 'Knowledge check'} · {quiz.questions.length} {hu ? 'kérdés' : 'questions'}</DialogDescription>
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground" aria-live="polite">{state.finished ? (hu ? 'Kvíz befejezve' : 'Quiz complete') : `${hu ? 'Kérdés' : 'Question'} ${state.index + 1} / ${quiz.questions.length}`}</p>
        <div className="flex gap-1" role="group" aria-label="Language / Nyelv" data-no-translate>
          <Button size="sm" variant={hu ? 'ghost' : 'secondary'} aria-pressed={!hu} onClick={() => setLanguage('en')}>EN</Button>
          <Button size="sm" variant={hu ? 'secondary' : 'ghost'} aria-pressed={hu} onClick={() => setLanguage('hu')}>HU</Button>
        </div>
      </div>
      <div className="quiz-progress" aria-hidden="true">{quiz.questions.map((_, index) => <span key={index} data-complete={state.answers.length > index} />)}</div>
      {state.finished ? <>
        <div className="border-b border-border pb-4" aria-live="polite">
          <p className="text-3xl font-semibold text-primary">{score} / {quiz.questions.length}</p>
          <p className="mt-2 text-sm">{hu ? 'Helyes válaszok' : 'Correct answers'} · {Math.round(score / quiz.questions.length * 100)}%</p>
        </div>
        <div className="space-y-4">
          {quiz.questions.map((item, index) => <div key={index}>
            <p className="flex items-start gap-2 text-sm font-semibold">
              {state.answers[index] === item.correct ? <CheckCircle2 size={18} className="shrink-0 text-primary" aria-label={hu ? 'Helyes' : 'Correct'} /> : <XCircle size={18} className="shrink-0 text-destructive" aria-label={hu ? 'Helytelen' : 'Incorrect'} />}
              <span>{index + 1}. {item.prompt[language]}</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{hu ? 'Válaszod:' : 'Your answer:'} {item.options[state.answers[index] ?? -1]?.[language]}</p>
            <p className="mt-1 text-sm text-primary">{hu ? 'Helyes válasz:' : 'Correct answer:'} {item.options[item.correct]?.[language]}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.explanation[language]}</p>
          </div>)}
        </div>
        <Button onClick={restart}><RotateCcw />{hu ? 'Újrakezdés' : 'Try again'}</Button>
      </> : <>
        <fieldset disabled={answered} className="min-w-0">
          <legend className="mb-3 text-base font-semibold" tabIndex={-1}>{question.prompt[language]}</legend>
          <div className="space-y-2">
            {question.options.map((option, index) => <label key={index} className="quiz-option" data-selected={selected === index} data-correct={answered && index === question.correct} data-wrong={answered && selected === index && index !== question.correct}>
              <input type="radio" name="quiz-answer" checked={selected === index} onChange={() => setSelected(index)} />
              <span>{option[language]}</span>
              {answered && index === question.correct && <CheckCircle2 size={18} className="ml-auto shrink-0" aria-hidden="true" />}
              {answered && selected === index && index !== question.correct && <XCircle size={18} className="ml-auto shrink-0" aria-hidden="true" />}
            </label>)}
          </div>
        </fieldset>
        {answered && <div role="status" className="border-l-2 border-primary pl-3">
          <p className={correct ? 'font-semibold text-primary' : 'font-semibold text-destructive'}>{correct ? (hu ? 'Helyes!' : 'Correct!') : (hu ? 'Nem egészen.' : 'Not quite.')}</p>
          {!correct && <p className="mt-1 text-sm">{hu ? 'Helyes válasz:' : 'Correct answer:'} {question.options[question.correct]?.[language]}</p>}
          <p className="mt-1 text-sm text-muted-foreground">{question.explanation[language]}</p>
        </div>}
        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-3">
          {answered ? <Button onClick={() => { dispatch({ type: 'next', questionCount: quiz.questions.length }); setSelected(null); }}>{state.index === quiz.questions.length - 1 ? (hu ? 'Eredmény' : 'See results') : (hu ? 'Következő kérdés' : 'Next question')}<ArrowRight /></Button> : <Button disabled={selected === null} onClick={() => { if (selected !== null) dispatch({ type: 'answer', choice: selected, optionCount: question.options.length }); }}>{hu ? 'Válasz ellenőrzése' : 'Check answer'}<CheckCircle2 /></Button>}
        </div>
      </>}
    </DialogContent>
  </Dialog>;
}