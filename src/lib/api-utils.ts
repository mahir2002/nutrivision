// API Response Utilities

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

export function errorResponse(error: string, code?: string, details?: Record<string, string[]>): ApiError {
  return {
    success: false,
    error,
    code,
    details,
  };
}

export function validationErrorResponse(errors: Record<string, string[]>): ApiError {
  const firstField = Object.keys(errors)[0];
  const firstError = errors[firstField]?.[0] || 'Validation failed';
  
  return {
    success: false,
    error: firstError,
    code: 'VALIDATION_ERROR',
    details: errors,
  };
}

// Zod validation helper
export function validateRequest<T>(
  schema: import('zod').ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: ApiError } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string[]> = {};
  result.error.issues.forEach((err) => {
    const path = err.path.map(p => String(p)).join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });
  
  return { success: false, error: validationErrorResponse(errors) };
}

// Get request body with validation
export async function getValidatedBody<T>(
  req: Request,
  schema: import('zod').ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: ApiError }> {
  try {
    const body = await req.json();
    return validateRequest(schema, body);
  } catch {
    return { 
      success: false, 
      error: errorResponse('Invalid JSON body', 'PARSE_ERROR') 
    };
  }
}

// Get and validate query params
export function validateQuery<T>(
  schema: import('zod').ZodSchema<T>,
  url: URL
): { success: true; data: T } | { success: false; error: ApiError } {
  const queryObj: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    queryObj[key] = value;
  });
  
  return validateRequest(schema, queryObj);
}
