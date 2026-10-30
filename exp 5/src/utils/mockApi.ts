import { Post, LogEntry, ApiResponseData } from '../types';
import { generateCorrelationId, logRequest, createApiResponse } from './logger';

const DELAY = 15; // mock network delay

const getInitialPosts = (): Post[] => {
  const stored = localStorage.getItem('exp5_posts');
  if (stored) return JSON.parse(stored);
  return [
    { id: 1, content: 'Understanding REST APIs', createdAt: new Date().toISOString() },
    { id: 2, content: 'Spring Boot layered architecture', createdAt: new Date().toISOString() }
  ];
};

export const resetData = () => {
  localStorage.removeItem('exp5_posts');
};

export const savePosts = (posts: Post[]) => {
  localStorage.setItem('exp5_posts', JSON.stringify(posts));
};

export class MockApiService {
  private addLog: (log: LogEntry) => void;
  private setLastResponse: (res: ApiResponseData) => void;

  constructor(addLog: (log: LogEntry) => void, setLastResponse: (res: ApiResponseData) => void) {
    this.addLog = addLog;
    this.setLastResponse = setLastResponse;
  }

  private async simulateRequest<T>(
    method: string,
    endpoint: string,
    handler: () => { status: number; body: any }
  ): Promise<T | null> {
    const correlationId = generateCorrelationId();
    const startTime = performance.now();
    
    // Simulate delay
    await new Promise(r => setTimeout(r, DELAY));
    
    try {
      const result = handler();
      const timeMs = Math.round(performance.now() - startTime);
      
      const success = result.status >= 200 && result.status < 300;
      const apiStatus = success ? 'success' : 'error';
      
      const response = createApiResponse(
        apiStatus,
        result.body.message || (success ? 'Success' : 'Error'),
        result.body.data || null,
        method,
        endpoint,
        result.status,
        timeMs,
        correlationId
      );
      
      logRequest(method, endpoint, result.status, timeMs, correlationId, this.addLog);
      this.setLastResponse(response);
      
      if (!success) {
        throw response;
      }
      return result.body.data;
    } catch (error: any) {
      if (error && error.meta) {
        throw error;
      }
      const timeMs = Math.round(performance.now() - startTime);
      const errResponse = createApiResponse(
        'error',
        'Internal Server Error',
        null,
        method,
        endpoint,
        500,
        timeMs,
        correlationId
      );
      logRequest(method, endpoint, 500, timeMs, correlationId, this.addLog);
      this.setLastResponse(errResponse);
      throw errResponse;
    }
  }

  async getPosts(): Promise<Post[]> {
    return this.simulateRequest('GET', '/api/posts', () => {
      const posts = getInitialPosts();
      return { status: 200, body: { message: 'Posts retrieved', data: posts } };
    }) as Promise<Post[]>;
  }

  async createPost(content: string): Promise<Post> {
    return this.simulateRequest('POST', '/api/posts', () => {
      if (!content || content.trim() === '') {
         return { status: 400, body: { message: 'Validation failed: Content must not be empty', data: null } };
      }
      if (content.length > 280) {
         return { status: 400, body: { message: 'Validation failed: Content must not exceed 280 characters', data: null } };
      }

      const posts = getInitialPosts();
      const newPost: Post = {
        id: posts.length ? Math.max(...posts.map(p => p.id)) + 1 : 1,
        content,
        createdAt: new Date().toISOString()
      };
      posts.push(newPost);
      savePosts(posts);
      return { status: 201, body: { message: 'Post created', data: newPost } };
    }) as Promise<Post>;
  }

  async updatePost(id: number, content: string): Promise<Post> {
    return this.simulateRequest('PUT', `/api/posts/${id}`, () => {
      if (!content || content.trim() === '') {
         return { status: 400, body: { message: 'Validation failed: Content must not be empty', data: null } };
      }
      if (content.length > 280) {
         return { status: 400, body: { message: 'Validation failed: Content must not exceed 280 characters', data: null } };
      }

      const posts = getInitialPosts();
      const index = posts.findIndex(p => p.id === id);
      if (index === -1) {
        return { status: 404, body: { message: 'Post not found', data: null } };
      }

      posts[index].content = content;
      savePosts(posts);
      return { status: 200, body: { message: 'Post updated', data: posts[index] } };
    }) as Promise<Post>;
  }

  async deletePost(id: number): Promise<void> {
    return this.simulateRequest('DELETE', `/api/posts/${id}`, () => {
      let posts = getInitialPosts();
      const initialLength = posts.length;
      posts = posts.filter(p => p.id !== id);
      if (posts.length === initialLength) {
        return { status: 404, body: { message: 'Post not found', data: null } };
      }
      savePosts(posts);
      return { status: 200, body: { message: 'Post deleted', data: null } };
    }) as Promise<void>;
  }

  async triggerGenericException(): Promise<void> {
    return this.simulateRequest('GET', '/api/error', () => {
       throw new Error('Simulated internal server error');
    }) as Promise<void>;
  }

  async scheduleTask(taskName: string, date: string, time: string): Promise<any> {
    return this.simulateRequest('POST', '/api/schedule', () => {
      if (!taskName || taskName.trim() === '') {
         return { status: 400, body: { message: 'Validation failed: Task name must not be empty', data: null } };
      }
      if (!date || date.trim() === '') {
         return { status: 400, body: { message: 'Validation failed: Date is required', data: null } };
      }
      if (!time || time.trim() === '') {
         return { status: 400, body: { message: 'Validation failed: Time is required', data: null } };
      }
      return { status: 201, body: { message: 'Task scheduled', data: { task: taskName, date, time } } };
    });
  }
}
