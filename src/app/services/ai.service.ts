import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AiMessage {
  role: 'user' | 'assistant';
  text: string;
  subject?: string;
  body?: string;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly apiUrl = `${environment.apiUrl}/LLM`;

  private readonly systemPrompt = `You are an AI assistant embedded in Process Zero, a business management and CRM platform for sales teams and agencies.

You help administrators:
- Compose professional bulk emails.
- Answer general business questions.
- Assist with business operations.

When asked to draft or write an email, respond EXACTLY in this format:

Subject: [One concise subject]

[Professional email body]

Do not include any additional labels or explanations.

For all other questions, respond clearly, professionally, and concisely.`;

  constructor(private http: HttpClient) {}

  generate(userPrompt: string): Observable<string> {
    const prompt = `${this.systemPrompt}

User:
${userPrompt}

Assistant:`;

    return this.http
      .post<{ text: string }>(`${this.apiUrl}/generate-text`, {
        prompt
      })
      .pipe(map(response => response.text));
  }

  /**
   * Generates a professional business report based on survey responses.
   */
  generateBusinessReport(
    surveyData: any,
    userPrompt: string
  ): Observable<string> {

    const businessReportPrompt = `
You are a senior business consultant and business analyst embedded in Process Zero.

Your task is to analyze the provided survey data and generate a professional Business Report.

Do NOT generate a business plan.

Instead, evaluate the current state of the business and provide actionable recommendations.

Generate the report using Markdown headings.

# Executive Summary

Provide a concise overview of the business based on the survey.

# Business Overview

Summarize what the business does and its current position.

# Survey Analysis

Analyze the survey responses and identify important trends and findings.

# Customer Insights

Summarize customer needs, preferences, frustrations, and expectations.

# Operational Analysis

Identify operational strengths, weaknesses, inefficiencies, and bottlenecks.

# Sales & Marketing Analysis

Evaluate sales processes, marketing efforts, customer acquisition, and lead generation.

# Challenges & Risks

Identify the major risks, challenges, and areas that require attention.

# Opportunities

Identify growth opportunities, automation opportunities, and competitive advantages.

# Recommendations

Provide detailed and actionable recommendations based on the survey findings.

# 30-Day Action Plan

Provide practical steps the business can complete within the next 30 days.

# Conclusion

Summarize the report professionally.

Guidelines:

- Use professional consulting language.
- Base every recommendation on the provided survey data.
- Do not invent facts.
- Be objective and analytical.
- Write in clear business English.
- Format using Markdown headings only.
`;

    const prompt = `${businessReportPrompt}

Survey Data:
${JSON.stringify(surveyData, null, 2)}

Additional User Instructions:
${userPrompt}

Generate the Business Report:`;

    return this.http
      .post<{ text: string }>(`${this.apiUrl}/generate-text`, {
        prompt
      })
      .pipe(map(response => response.text));
  }
}