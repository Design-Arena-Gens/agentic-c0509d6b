import { NextResponse } from 'next/server';

interface Message {
  id: string;
  text: string;
  timestamp: number;
  user: string;
}

// In-memory storage (will reset on deployment, but works for demo)
let messages: Message[] = [];

// Limit to last 100 messages
const MAX_MESSAGES = 100;

export async function GET() {
  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, user } = body;

    if (!text || !user) {
      return NextResponse.json(
        { error: 'Text and user are required' },
        { status: 400 }
      );
    }

    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      text: text.substring(0, 500), // Limit message length
      timestamp: Date.now(),
      user,
    };

    messages.push(newMessage);

    // Keep only the last MAX_MESSAGES
    if (messages.length > MAX_MESSAGES) {
      messages = messages.slice(-MAX_MESSAGES);
    }

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
