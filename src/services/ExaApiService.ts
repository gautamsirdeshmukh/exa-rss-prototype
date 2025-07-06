import axios from 'axios';
import { ExaSearchResponse, ExaSearchResult } from '../types';

const EXA_API_BASE_URL = 'https://api.exa.ai';

export class ExaApiService {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseURL = EXA_API_BASE_URL;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
    };
  }

  async searchContent(
    query: string,
    options: {
      type?: 'neural' | 'keyword';
      useAutoprompt?: boolean;
      numResults?: number;
      publishedAfter?: string;
      includeDomains?: string[];
      excludeDomains?: string[];
      includeText?: boolean;
      textLength?: number;
    } = {}
  ): Promise<ExaSearchResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/search`,
        {
          query,
          type: options.type || 'neural',
          useAutoprompt: options.useAutoprompt || true,
          numResults: options.numResults || 10,
          publishedAfter: options.publishedAfter,
          includeDomains: options.includeDomains,
          excludeDomains: options.excludeDomains,
          contents: {
            text: options.includeText || true,
            textLength: options.textLength || 1000,
          },
        },
        {
          headers: this.getHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      console.error('Exa API search error:', error);
      throw new Error('Failed to search content');
    }
  }

  async getContents(urls: string[]): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseURL}/contents`,
        {
          ids: urls,
        },
        {
          headers: this.getHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      console.error('Exa API get contents error:', error);
      throw new Error('Failed to get contents');
    }
  }

  generateDescription(text: string, maxLength: number = 150): string {
    if (!text) return '';
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let description = '';
    
    for (const sentence of sentences) {
      if (description.length + sentence.length > maxLength) {
        break;
      }
      description += sentence.trim() + '. ';
    }
    
    return description.trim() || text.substring(0, maxLength) + '...';
  }
}