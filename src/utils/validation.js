// Simple validation helpers (replace with Joi or Zod for production)
export function validateUserInput(data) {
  if (!data.username || typeof data.username !== 'string') return 'Invalid username';
  if (!data.password || typeof data.password !== 'string') return 'Invalid password';
  // Normalize role to lowercase for validation
  if (!data.role || typeof data.role !== 'string') return 'Invalid role';
  const normalizedRole = data.role.toLowerCase();
  if (!['viewer', 'analyst', 'admin'].includes(normalizedRole)) return 'Invalid role';
  // Optionally, update the role in the data object
  data.role = normalizedRole;
  return null;
}

export function validateRecordInput(data) {
  if (typeof data.amount !== 'number' || isNaN(data.amount)) return 'Invalid amount';
  if (!['income', 'expense'].includes(data.type)) return 'Invalid type';
  if (!data.category || typeof data.category !== 'string') return 'Invalid category';
  if (!data.date || isNaN(Date.parse(data.date))) return 'Invalid date';
  return null;
}
