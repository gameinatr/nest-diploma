import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import { User } from "./entities/user.entity";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async register(registerDto: RegisterDto): Promise<{
    user: Partial<User>;
    access_token: string;
    refresh_token: string;
  }> {
    // Create user using users service
    const userWithoutPassword = await this.usersService.create(registerDto);

    // Get full user for token generation
    const fullUser = await this.usersService.findById(userWithoutPassword.id);

    // Generate tokens
    const tokens = this.generateTokens(fullUser);

    return {
      user: userWithoutPassword,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  async login(loginDto: LoginDto): Promise<{
    user: Partial<User>;
    access_token: string;
    refresh_token: string;
  }> {
    try {
      // Generate tokens
      const user = await this.usersService.findByEmail(loginDto.email);
      const isPasswordCorrect = await this.usersService.verifyPassword(
        user,
        loginDto.password
      );

      if (!isPasswordCorrect) {
        throw new UnauthorizedException("Invalid credentials");
      }

      const tokens = this.generateTokens(user);

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      };
    } catch (error) {
      throw new UnauthorizedException("Login failed due to unknown reason");
    }
  }

  async refreshToken(
    refreshToken: string
  ): Promise<{ user: User; access_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      });

      const user = await this.findUserById(payload.sub);
      if (!user) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      // Generate new access token
      const accessTokenPayload = { email: user.email, sub: user.id };
      const access_token = this.jwtService.sign(accessTokenPayload, {
        secret: this.configService.get<string>("JWT_SECRET"),
        expiresIn: "15m",
      });

      return { user, access_token };
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  private generateTokens(user: User): {
    access_token: string;
    refresh_token: string;
  } {
    const payload = { email: user.email, sub: user.id };

    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_SECRET"),
      expiresIn: "15m",
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      expiresIn: "7d",
    });

    return { access_token, refresh_token };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async findUserById(id: number): Promise<User | null> {
    return this.usersService.findById(id);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.usersService.findByEmail(email);
  }
}
