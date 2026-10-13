import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { AnalyticsService } from '../services/analytics.service.js';
import {
  signupSchema,
  loginSchema,
  updateProfileSchema,
  connectPartnerSchema,
} from '../schemas/auth.schema.js';

export class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = signupSchema.parse(req.body);
      const { user, token } = await AuthService.signup(validated);

      // Set HTTP-only session cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      await AnalyticsService.recordEvent('signup_completed', user.id, {
        hasPartnerCode: !!validated.partnerCodeToConnect,
      });

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        user,
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = loginSchema.parse(req.body);
      const { user, token } = await AuthService.login(validated);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        user,
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie('token');
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await AuthService.getUserProfile(req.user!.id);
      res.status(200).json({
        success: true,
        user: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateProfileSchema.parse(req.body);
      const updated = await AuthService.updateProfile(req.user!.id, validated);
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async connectPartner(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = connectPartnerSchema.parse(req.body);
      const result = await AuthService.connectPartner(req.user!.id, validated.partnerCode);

      await AnalyticsService.recordEvent('invitation_accepted', req.user!.id, {
        type: 'partner_code',
      });

      res.status(200).json({
        success: true,
        message: 'Partner connected successfully!',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async disconnectPartner(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.disconnectPartner(req.user!.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('token');
      const result = await AuthService.deleteAccount(req.user!.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
