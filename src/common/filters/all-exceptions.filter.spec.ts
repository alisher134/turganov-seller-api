import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

interface MockResponse {
  status: jest.Mock<MockResponse, [number]>;
  json: jest.Mock<MockResponse, [unknown]>;
}

interface MockRequest {
  url: string;
  method: string;
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: MockResponse;
  let mockRequest: MockRequest;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis() as jest.Mock<MockResponse, [number]>,
      json: jest.fn().mockReturnThis() as jest.Mock<MockResponse, [unknown]>,
    };
    mockRequest = {
      url: '/api/v1/test',
      method: 'GET',
    };
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: (): MockResponse => mockResponse,
        getRequest: (): MockRequest => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  it('should handle HttpException correctly', () => {
    const exception = new BadRequestException('Validation failed');

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        path: '/api/v1/test',
        method: 'GET',
        message: 'Validation failed',
      }),
    );
  });

  it('should handle unknown Error as 500 Internal Server Error', () => {
    const exception = new Error('Database connection failed');

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        path: '/api/v1/test',
        method: 'GET',
        message: 'Database connection failed',
      }),
    );
  });

  it('should handle HttpException with object response', () => {
    const exception = new HttpException(
      {
        message: ['name is required', 'email must be valid'],
        error: 'Bad Request',
      },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['name is required', 'email must be valid'],
        error: 'Bad Request',
      }),
    );
  });
});
