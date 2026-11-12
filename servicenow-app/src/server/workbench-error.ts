import { ReviewValidationError } from './generated/assessment-checks.js';

export class WorkbenchError extends ReviewValidationError {
  message: string;
  status: number;
  details: unknown;
  constructor(message: string, status = 400, details: unknown = null) {
    super('WORKBENCH_ERROR', message, details);
    this.message = message;
    this.status = status;
    this.details = details;
  }
}
