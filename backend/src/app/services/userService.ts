// User service - functional approach as per architecture
import { query } from '../../infra/db/helpers';
import { hashPassword } from '../../utils/password';
import { User, CreateUserData } from '../../domain/user';
import { logger } from '../../utils/logger';

/**
 * Create a new user account
 */
export async function createUser(userData: CreateUserData): Promise<User> {
  const { email, password, role } = userData;

  try {
    // Hash the password
    const passwordHash = await hashPassword(password);

    // Insert user into database
    const result = await query<User>(`
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, $3)
      RETURNING id, email, role, created_at as "createdAt", updated_at as "updatedAt"
    `, [email, passwordHash, role]);

    if (result.rows.length === 0) {
      throw new Error('Failed to create user');
    }

    const user = result.rows[0];
    logger.info('User created successfully', { userId: user.id, email: user.email, role: user.role });

    return user;
  } catch (error) {
    logger.error('Failed to create user', { email, role, error });
    
    // Handle unique constraint violation (duplicate email)
    if (error instanceof Error && error.message.includes('duplicate key value')) {
      throw new Error('Email already exists');
    }
    
    throw error;
  }
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await query<User>(`
      SELECT id, email, role, created_at as "createdAt", updated_at as "updatedAt"
      FROM users 
      WHERE email = $1
    `, [email]);

    return result.rows[0] || null;
  } catch (error) {
    logger.error('Failed to find user by email', { email, error });
    throw error;
  }
}

/**
 * Find user by ID
 */
export async function findUserById(id: string): Promise<User | null> {
  try {
    const result = await query<User>(`
      SELECT id, email, role, created_at as "createdAt", updated_at as "updatedAt"
      FROM users 
      WHERE id = $1
    `, [id]);

    return result.rows[0] || null;
  } catch (error) {
    logger.error('Failed to find user by ID', { userId: id, error });
    throw error;
  }
}
