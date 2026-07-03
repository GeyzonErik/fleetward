import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Db } from 'mongodb';
import { MONGO_DB } from './mongo.provider';
import { Request, Response } from 'express';

const SENSITIVE_FIELDS = ['password'];

interface AuditLogEntry {
  method: string;
  url: string;
  statusCode: number;
  user: string;
  body: Record<string, unknown> | undefined;
  durationMs: number;
  timestamp: Date;
  error?: string;
}

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    nickname: string;
  };
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(@Inject(MONGO_DB) private readonly db: Db) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();

    const request = httpContext.getRequest<AuthenticatedRequest>();
    const startTime = Date.now();
    const body = request.body as Record<string, unknown> | undefined;
    const { method, originalUrl, user } = request;

    return next.handle().pipe(
      tap(() => {
        const response = httpContext.getResponse<Response>();

        void this.record({
          method,
          url: originalUrl,
          statusCode: response.statusCode,
          user: user?.nickname ?? 'anonymous',
          body: this.sanitize(body),
          durationMs: Date.now() - startTime,
          timestamp: new Date(),
        });
      }),
      catchError((error) => {
        const err = error as
          | { status?: number; statusCode?: number; message?: string }
          | null
          | undefined;
        const statusCode = err?.status ?? err?.statusCode ?? 500;
        const errorMessage = err?.message ?? 'Unknown error';

        void this.record({
          method,
          url: originalUrl,
          statusCode,
          user: user?.nickname ?? 'anonymous',
          body: this.sanitize(body),
          durationMs: Date.now() - startTime,
          timestamp: new Date(),
          error: errorMessage,
        });

        throw error;
      }),
    );
  }

  private sanitize(
    body: Record<string, unknown> | undefined,
  ): Record<string, unknown> | undefined {
    if (!body) return body;

    const clone = { ...body };

    for (const field of SENSITIVE_FIELDS) {
      if (field in clone) clone[field] = '[REDACTED]';
    }

    return clone;
  }

  private async record(entry: AuditLogEntry): Promise<void> {
    try {
      await this.db.collection('audit_logs').insertOne(entry);
    } catch (error) {
      this.logger.error('Failed to write audit log', error);
    }
  }
}
