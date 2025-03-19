export const ErrorCodes = {
  NotFound: 'not_found',
  AlreadyUsed: 'already_used',

  // Account
  InvalidJWT: 'invalid_jwt',
  BadAuth: 'bad_auth',

  // Documents
  InvalidDocument: 'invalid_document',
  DocumentTooLarge: 'document_too_large',

} as const;