import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit } from '@/components/ai-elements/prompt-input';
import { Shimmer } from '@/components/ai-elements/shimmer';
import type { CapacitorContext } from '@/lib/capacitor-context';

function GuideMark() {
  return <svg viewBox="0 0 40 40" className="size-9 text-primary" aria-label="Capacitor Guide"><path d="M4 20H16M24 20H36M16 9V31M24 9V31" fill="none" stroke="currentColor" strokeWidth="2.5" /><circle cx="5" cy="20" r="2" fill="currentColor" /><circle cx="35" cy="20" r="2" fill="currentColor" /></svg>;
}
export function CapacitorHelper({ setup }: { setup: CapacitorContext }) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState('');
  const [snapshot, setSnapshot] = useState<CapacitorContext>();
  const [stopped, setStopped] = useState(false);
  const [notice, setNotice] = useState('');
  const transport = useMemo(() => new DefaultChatTransport({ api: '/api/capacitor-chat', fetch: async (url, init) => {
    const response = await fetch(url, init);
    if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.error ?? 'The AI helper is unavailable right now.'); }
    return response;
  } }), []);
  const { messages, sendMessage, status, stop, error, setMessages, clearError } = useChat({ transport, onFinish: ({ message, isAbort, isError }) => {
    if (!isAbort && !isError && !message.parts.some(p => p.type === 'text' && p.text.trim())) setNotice('The model did not provide an answer to this question.');
  } });
  const busy = status === 'submitted' || status === 'streaming';
  useEffect(() => {
    if (!busy && (document.activeElement === document.body || document.activeElement === inputRef.current || document.activeElement?.closest('[data-capacitor-helper]'))) inputRef.current?.focus({ preventScroll: true });
  }, [busy]);
  async function ask(text: string) {
    if (busy || !text.trim()) return;
    clearError(); setNotice(''); setStopped(false); setSnapshot(setup); setInput('');
    inputRef.current?.focus({ preventScroll: true });
    await sendMessage({ text: text.trim(), metadata: { setup } }, { body: { setup } });
  }
  return <section data-capacitor-helper className="capacitor-helper" aria-label="Capacitor AI helper">
    <div className="section-top"><h2 className="flex items-center gap-2"><GuideMark />Capacitor Guide</h2><div className="flex items-center gap-3"><span className="eyebrow text-muted-foreground">AI-POWERED</span><Button variant="ghost" size="icon" disabled={busy || messages.length === 0} title="Clear conversation" aria-label="Clear conversation" onClick={() => { setMessages([]); clearError(); setNotice(''); setSnapshot(undefined); setStopped(false); inputRef.current?.focus(); }}><Trash2 /></Button></div></div>
    <div className="helper-context font-mono text-xs text-muted-foreground">{snapshot ? 'QUESTION SNAPSHOT' : 'CURRENT SETUP'} · {(snapshot ?? setup).settings.mode.toUpperCase()} · {(snapshot ?? setup).settings.voltage.toFixed(1)} V · {(snapshot ?? setup).settings.resistance.toFixed(1)} kΩ · {(snapshot ?? setup).settings.capacitance} µF{(snapshot ?? setup).settings.mode === 'ac' ? ` · ${(snapshot ?? setup).settings.frequency.toFixed(1)} Hz` : (snapshot ?? setup).settings.connected ? ' · Charge' : ' · Discharge'} · t = {(snapshot ?? setup).sample.time.toFixed(1)} s</div>
    <Conversation className="helper-conversation" aria-label="Questions and answers"><ConversationContent>
      {messages.length === 0 && <ConversationEmptyState><GuideMark /><h3 className="text-sm font-medium">What are you noticing?</h3><div className="flex flex-wrap justify-center gap-2">{(setup.settings.mode === 'dc' ? ['Why does the current fall?', 'What happens if I double the resistance?'] : ['Why does the voltage lag?', 'What happens at a higher frequency?']).map(q => <Button key={q} variant="outline" size="sm" onClick={() => ask(q)}>{q}</Button>)}</div></ConversationEmptyState>}
      {messages.map(message => <Message key={message.id} from={message.role}><span className="eyebrow text-muted-foreground">{message.role === 'user' ? 'YOU' : 'CAPACITOR GUIDE'}</span><MessageContent>{message.parts.map((part, i) => part.type === 'text' ? <MessageResponse key={i}>{part.text}</MessageResponse> : part.type === 'reasoning' && part.text ? <details key={i} className="text-xs text-muted-foreground"><summary>Reasoning</summary><MessageResponse>{part.text}</MessageResponse></details> : null)}</MessageContent></Message>)}
      {busy && <div role="status"><Shimmer>Considering your circuit…</Shimmer></div>}
      {stopped && <p role="status" className="text-xs text-muted-foreground">Response stopped.</p>}
    </ConversationContent><ConversationScrollButton /></Conversation>
    {(error || notice) && <p role="alert" className="my-3 text-sm text-destructive">{error?.message ?? notice}</p>}
    <PromptInput maxFiles={0} onSubmit={({ text }) => ask(text)}><PromptInputTextarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} maxLength={4000} aria-label="Question about your capacitor" placeholder="Ask about your capacitor…" /><PromptInputFooter><span className="text-[11px] text-muted-foreground">Not saved · AI answers may be mistaken</span><PromptInputSubmit status={status} disabled={!busy && !input.trim()} title={busy ? 'Stop response' : 'Ask question'} aria-label={busy ? 'Stop response' : 'Ask question'} onStop={() => { stop(); setStopped(true); }} /></PromptInputFooter></PromptInput>
  </section>;
}