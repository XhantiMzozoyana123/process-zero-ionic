import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface AiMessage {
  role: 'user' | 'assistant';
  text: string;
  subject?: string;
  body?: string;
}

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly apiUrl = 'https://llm.processzero.xyz/api/generate';

  private readonly systemPrompt = `You are an AI assistant embedded in Process Zero, a business management and CRM platform for sales teams and agencies. You help admins compose professional bulk emails for their users and answer general questions about the business.

When asked to draft or write an email, format your response EXACTLY like this:
Subject: [one concise subject line]

[professional email body — no extra labels, just clean prose]

For all other questions, respond concisely and helpfully.`;

  constructor(private http: HttpClient) {}

  generate(userPrompt: string): Observable<string> {
    const prompt = `${this.systemPrompt}\n\nUser: ${userPrompt}\nAssistant:`;
    return this.http.post<OllamaResponse>(this.apiUrl, {
      model: 'llama3',
      prompt,
      stream: false
    }).pipe(map(r => r.response.trim()));
  }
}
