export interface MongoError {
  code: number;
  keyPattern: Record<string, number>;
}

export function isMongoError(error: unknown): error is MongoError {
  return typeof error === 'object' && error !== null && 'code' in error;
}
