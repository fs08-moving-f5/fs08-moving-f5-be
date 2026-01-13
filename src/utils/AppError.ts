import HTTP_STATUS from '@/constants/http.constant';

class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

export default AppError;
