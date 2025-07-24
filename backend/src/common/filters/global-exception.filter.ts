import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: number;
    let message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        // Handle validation errors and other structured responses
        const responseObj = exceptionResponse as any;
        message = responseObj.message || responseObj.error || 'An error occurred';
        
        // If message is an array (validation errors), join them
        if (Array.isArray(message)) {
          message = message.join(', ');
        }
      } else {
        message = 'An error occurred';
      }
    } else {
      // Handle unexpected errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      
      // Log the unexpected error for debugging
      console.error('Unexpected error:', exception);
    }

    response.status(status).json({
      status,
      message,
    });
  }
}