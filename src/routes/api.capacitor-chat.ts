import { createFileRoute } from '@tanstack/react-router';
import { handleCapacitorChat } from '@/lib/capacitor-chat.server';

export const Route = createFileRoute('/api/capacitor-chat')({ server: { handlers: { POST: ({ request }) => handleCapacitorChat(request) } } });