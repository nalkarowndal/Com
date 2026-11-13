import { authService } from '../services/auth.service.js';
import { userRepository } from '../repositories/user.repository.js';

const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 24 * 60 * 60 * 1000
});

export class AuthController {
  async register(req, res, next) {
    try {
      const { username, email, password, name } = req.body;
      const { user, token } = await authService.register({ username, email, password, name });

      res.cookie('prism_auth_token', token, getCookieOptions());
      res.cookie('auth_token', token, getCookieOptions());
      if (user.role === 'admin') {
        res.cookie('admin_token', token, getCookieOptions());
      }

      return res.status(201).json({
        success: true,
        data: {
          user,
          token
        },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const identifier = req.body.identifier || req.body.username || req.body.email;
      const { password } = req.body;

      if (!identifier || !password) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email/Username and password are required'
          }
        });
      }

      const authResult = await authService.authenticate(identifier, password);
      if (!authResult) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid credentials. Please verify your login information.'
          }
        });
      }

      res.cookie('prism_auth_token', authResult.token, getCookieOptions());
      res.cookie('auth_token', authResult.token, getCookieOptions());
      if (authResult.user.role === 'admin') {
        res.cookie('admin_token', authResult.token, getCookieOptions());
      }

      return res.json({
        success: true,
        data: {
          user: authResult.user,
          token: authResult.token
        },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res) {
    res.clearCookie('prism_auth_token');
    res.clearCookie('auth_token');
    res.clearCookie('admin_token');
    return res.json({
      success: true,
      data: { message: 'Successfully signed out' }
    });
  }

  async getMe(req, res, next) {
    try {
      const freshUser = await userRepository.findById(req.user.id);
      const user = freshUser ? userRepository.sanitizeUser(freshUser) : req.user;
      return res.json({
        success: true,
        data: { user }
      });
    } catch (err) {
      next(err);
    }
  }

  async getSession(req, res) {
    if (!req.user) {
      return res.json({
        success: true,
        data: {
          isAuthenticated: false,
          user: null,
          role: 'guest'
        }
      });
    }

    const freshUser = await userRepository.findById(req.user.id);
    const user = freshUser ? userRepository.sanitizeUser(freshUser) : req.user;
    return res.json({
      success: true,
      data: {
        isAuthenticated: true,
        user,
        role: user.role || 'user'
      }
    });
  }

  async updateProfile(req, res, next) {
    try {
      const { name, email, avatar } = req.body;
      const { user, token } = await authService.updateProfile(req.user.id, { name, email, avatar });
      return res.json({
        success: true,
        data: { user, token }
      });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Current password and new password are required'
          }
        });
      }

      await authService.changePassword(req.user.id, currentPassword, newPassword);
      return res.json({
        success: true,
        data: { message: 'Password updated successfully' }
      });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();

