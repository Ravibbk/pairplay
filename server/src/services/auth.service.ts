import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';

function generatePartnerCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'PAIR-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export class AuthService {
  static async signup(data: {
    email: string;
    password: string;
    displayName: string;
    partnerCodeToConnect?: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    // Generate unique partner code
    let partnerCode = generatePartnerCode();
    while (await prisma.user.findUnique({ where: { partnerCode } })) {
      partnerCode = generatePartnerCode();
    }

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        displayName: data.displayName,
        partnerCode,
        interests: JSON.stringify(['Deep Questions', 'Quality Time', 'Travel']),
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        partnerCode: true,
        avatarUrl: true,
        bio: true,
        interests: true,
        loveLanguage: true,
        createdAt: true,
      },
    });

    // If partner code was provided at signup, auto-connect
    if (data.partnerCodeToConnect) {
      try {
        await this.connectPartner(user.id, data.partnerCodeToConnect);
      } catch (e) {
        // Continue even if partner code is invalid, user can connect later
      }
    }

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: '7d',
    });

    return { user, token };
  }

  static async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      throw new AppError('Invalid email or password combination.', 401);
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password combination.', 401);
    }

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: '7d',
    });

    const sanitizedUser = await this.getUserProfile(user.id);

    return { user: sanitizedUser, token };
  }

  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        partnerCode: true,
        interests: true,
        loveLanguage: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Find active partner
    const couple = await prisma.couple.findFirst({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
        status: 'ACTIVE',
      },
      include: {
        user1: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            email: true,
            partnerCode: true,
          },
        },
        user2: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            email: true,
            partnerCode: true,
          },
        },
      },
    });

    let partner = null;
    if (couple) {
      partner = couple.user1Id === userId ? couple.user2 : couple.user1;
    }

    let parsedInterests: string[] = [];
    try {
      parsedInterests = JSON.parse(user.interests);
    } catch {
      parsedInterests = [];
    }

    return {
      ...user,
      interests: parsedInterests,
      partner,
      coupleId: couple?.id || null,
    };
  }

  static async updateProfile(
    userId: string,
    data: {
      displayName?: string;
      avatarUrl?: string;
      bio?: string;
      interests?: string[];
      loveLanguage?: string;
    }
  ) {
    const updateData: any = {};
    if (data.displayName !== undefined) updateData.displayName = data.displayName;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.interests !== undefined) updateData.interests = JSON.stringify(data.interests);
    if (data.loveLanguage !== undefined) updateData.loveLanguage = data.loveLanguage;

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return this.getUserProfile(userId);
  }

  static async connectPartner(userId: string, partnerCode: string) {
    const cleanCode = partnerCode.trim().toUpperCase();

    const partner = await prisma.user.findUnique({
      where: { partnerCode: cleanCode },
    });

    if (!partner) {
      throw new AppError('No partner found with this partner code. Please double-check.', 404);
    }

    if (partner.id === userId) {
      throw new AppError('You cannot pair with yourself. Share this code with your partner!', 400);
    }

    // Check if either already in an active couple
    const existingUserCouple = await prisma.couple.findFirst({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
        status: 'ACTIVE',
      },
    });

    if (existingUserCouple) {
      throw new AppError('You are already paired with a partner. Disconnect first to link a new partner.', 400);
    }

    const existingPartnerCouple = await prisma.couple.findFirst({
      where: {
        OR: [{ user1Id: partner.id }, { user2Id: partner.id }],
        status: 'ACTIVE',
      },
    });

    if (existingPartnerCouple) {
      throw new AppError('Your partner is already paired with an existing account.', 400);
    }

    const couple = await prisma.couple.create({
      data: {
        user1Id: userId,
        user2Id: partner.id,
        status: 'ACTIVE',
      },
    });

    return { couple, partner: { id: partner.id, displayName: partner.displayName, avatarUrl: partner.avatarUrl } };
  }

  static async disconnectPartner(userId: string) {
    const couple = await prisma.couple.findFirst({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
        status: 'ACTIVE',
      },
    });

    if (!couple) {
      throw new AppError('No active couple connection found.', 404);
    }

    await prisma.couple.update({
      where: { id: couple.id },
      data: { status: 'DISCONNECTED' },
    });

    return { success: true, message: 'Successfully uncoupled from partner.' };
  }

  static async deleteAccount(userId: string) {
    await prisma.user.delete({
      where: { id: userId },
    });
    return { success: true, message: 'Account and associated data deleted.' };
  }
}
