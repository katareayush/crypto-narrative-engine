export function validatePositiveInteger(value: string, fieldName: string): { isValid: boolean; error?: string; parsed?: number } {
  const parsed = parseInt(value);
  
  if (isNaN(parsed)) {
    return { isValid: false, error: `Invalid ${fieldName}. Must be a positive integer.` };
  }
  
  if (parsed < 1) {
    return { isValid: false, error: `Invalid ${fieldName}. Must be a positive integer.` };
  }
  
  return { isValid: true, parsed };
}

export function validateLimit(limitParam: unknown): { isValid: boolean; error?: string; limit?: number } {
  if (!limitParam) {
    return { isValid: true, limit: 10 }; // Default
  }
  
  const validation = validatePositiveInteger(limitParam as string, 'limit');
  if (!validation.isValid) {
    return validation;
  }
  
  const limit = Math.min(validation.parsed!, 50); // Cap at 50
  return { isValid: true, limit };
}