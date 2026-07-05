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
  // Using hosted LLM service - proxied through dev server to avoid CORS
  private readonly apiUrl = '/api/ai/generate';

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

  generateBusinessPlan(surveyData: any, userPrompt: string): Observable<string> {
    const systemPrompt = `You are an AI business analyst embedded in Process Zero. Your task is to generate a comprehensive business plan PDF report based on survey response data.

When generating the business plan, structure it with clear sections using markdown formatting:
# [Section Title]

[Content]

Use the following structure:
- Executive Summary
- Market Analysis  
- Business Objectives
- Target Audience Insights
- Challenges & Opportunities
- Recommendations
- Action Plan

Make it professional, detailed, and actionable. Include specific data points from the survey responses where relevant.`;

    const prompt = `${systemPrompt}\n\nSurvey Data:\n${JSON.stringify(surveyData, null, 2)}\n\nUser Instructions: ${userPrompt}\n\nAssistant: Generate the business plan report:`;
    
    return this.http.post<OllamaResponse>(this.apiUrl, {
      model: 'llama3',
      prompt,
      stream: false
    }).pipe(map(r => r.response.trim()));
  }
}
