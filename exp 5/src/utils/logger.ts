import { v4 as uuidv4 } from 'uuid';
import { LogEntry, ApiResponseData } from '../types';

export const generateCorrelationId = () => uuidv4();

export const logRequest = (
  method: string,
  uri: string,
  status: number,
  timeMs: number,
  correlationId: string,
  addLog: (log: LogEntry) => void
) => {
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
  addLog({
    id: uuidv4(),
    timestamp,
    method,
    uri,
    status,
    timeMs,
    correlationId
  });
};

export const createApiResponse = (
  status: 'success' | 'error',
  message: string,
  data: any,
  method: string,
  endpoint: string,
  statusCode: number,
  timeMs: number,
  correlationId: string
): ApiResponseData => ({
  status,
  message,
  data,
  meta: {
    method,
    endpoint,
    statusCode,
    responseTime: timeMs,
    correlationId
  }
});
