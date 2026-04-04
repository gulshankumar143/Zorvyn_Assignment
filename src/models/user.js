// User and Role model (for reference, logic handled in db.js for now)
export const Roles = {
  VIEWER: 'viewer',
  ANALYST: 'analyst',
  ADMIN: 'admin',
};

export const UserStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

// User schema (for validation, not enforced by DB directly)
export const UserSchema = {
  username: 'string',
  password: 'string',
  role: Object.values(Roles),
  status: Object.values(UserStatus),
};
