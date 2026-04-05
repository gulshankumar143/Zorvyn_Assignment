// Simple validation helpers (replace with Joi or Zod for production)
export function validateUserInput(data) {
  const username = data.username || data.email;
  if (!username || typeof username !== 'string') return 'Invalid username or email';
  data.username = username;
  if (!data.password || typeof data.password !== 'string') return 'Invalid password';
  // Normalize role to lowercase for validation
  if (!data.role || typeof data.role !== 'string') return 'Invalid role';
  const normalizedRole = data.role.toLowerCase();
  if (!['viewer', 'analyst', 'admin'].includes(normalizedRole)) return 'Invalid role';
  data.role = normalizedRole;
  return null;
}

export function validateRecordInput(data) {
  if (typeof data.amount !== 'number' || isNaN(data.amount)) return 'Invalid amount';
  if (!data.type || typeof data.type !== 'string') return 'Invalid type';
  const normalizedType = data.type.toLowerCase();
  if (!['income', 'expense'].includes(normalizedType)) return 'Invalid type';
  data.type = normalizedType;
  if (!data.category || typeof data.category !== 'string') return 'Invalid category';
  if (!data.date || isNaN(Date.parse(data.date))) return 'Invalid date';
  return null;
}
