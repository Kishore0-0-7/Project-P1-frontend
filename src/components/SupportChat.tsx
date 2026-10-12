import { useEffect, useRef, useState, type FormEvent } from 'react';
import { api, ApiError } from '../lib/api';
import type { FollowUpMessage } from '../types';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export function SupportChat() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadRef.current?.scrollTo?.({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const text = question.trim();
    if (!text || busy) return;
    const history: FollowUpMessage[] = messages.slice(-12).map((message) => ({ ...message }));
    setMessages((items) => [...items, { role: 'user', content: text }]);
    setQuestion('');
    setError('');
    setBusy(true);
    try {
      const response = await api.askSupportChat(text, history);
      setMessages((items) => [...items, { role: 'assistant', content: response.answer }]);
    } catch (cause) {
      if (cause instanceof ApiError && (cause.status === 503 || cause.status === 429)) {
        setError(cause.detail || 'AI support is temporarily unavailable. Try again later or use Help & Guides.');
      } else {
        setError(cause instanceof Error ? cause.message : 'Could not reach support chat. Please retry.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="support-chat">
      {open && (
        <section className="support-chat-panel" role="dialog" aria-modal="false" aria-labelledby="support-chat-title">
          <header>
            <span className="support-chat-mark" aria-hidden="true">?</span>
            <div><h2 id="support-chat-title">OpsTriage support</h2><small>Ask about pages and workflows · Gemini</small></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close support chat">×</button>
          </header>
          <div className="support-chat-thread" ref={threadRef} aria-live="polite">
            {messages.length === 0 && <p className="support-chat-welcome">Hi! I can help you find features and understand OpsTriage workflows. I can’t access your records or change workspace settings.</p>}
            {messages.map((message, index) => <div key={`${index}-${message.role}`} className={`support-chat-message is-${message.role}`}><b>{message.role === 'user' ? 'You' : 'Support'}</b><p>{message.content}</p></div>)}
            {busy && <p className="support-chat-status" role="status">Support is replying…</p>}
            {error && <p className="support-chat-error" role="alert">{error}</p>}
          </div>
          <form onSubmit={submit}>
            <label className="support-chat-label-sr" htmlFor="support-chat-question">Message support</label>
            <textarea id="support-chat-question" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={1000} placeholder="How do I investigate a signal?" rows={2} disabled={busy} />
            <button className="button primary" type="submit" disabled={busy || !question.trim()}>Send</button>
          </form>
        </section>
      )}
      <button className="support-chat-trigger" type="button" aria-expanded={open} aria-label={open ? 'Close support chat' : 'Open support chat'} onClick={() => setOpen((value) => !value)}>
        <span aria-hidden="true">{open ? '×' : '✦'}</span>{open ? 'Close support' : 'Support chat'}
      </button>
    </div>
  );
}
