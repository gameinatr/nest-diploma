import { Controller, Post, Body, UseGuards, Request, Get, Response, UnauthorizedException } from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Response() res: ExpressResponse) {
    const result = await this.authService.register(registerDto);
    
    // Set refresh token as HTTP-only cookie
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return response without refresh token in body
    return res.json({
      user: result.user,
      access_token: result.access_token,
    });
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Response() res: ExpressResponse) {
    const result = await this.authService.login(req.user);
    
    // Set refresh token as HTTP-only cookie
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return response without refresh token in body
    return res.json({
      user: result.user,
      access_token: result.access_token,
    });
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh')
  async refresh(@Request() req) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  async logout(@Response() res: ExpressResponse) {
    res.clearCookie('refresh_token');
    return res.json({ message: 'Logged out successfully' });
  }
}