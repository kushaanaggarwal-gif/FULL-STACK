export interface Post {
  id: number;
  content: string;
  createdAt: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  method: string;
  uri: string;
  status: number;
  timeMs: number;
  correlationId: string;
}

export interface ApiResponseData {
  status: 'success' | 'error';
  message: string;
  data: any | null;
  meta: {
    method: string;
    endpoint: string;
    statusCode: number;
    responseTime: number;
    correlationId: string;
  };
}

export interface Assignment {
  id: string;
  title: string;
  tasks: { id: string; description: string; completed: boolean }[];
}
