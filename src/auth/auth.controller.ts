import { Controller, HttpCode, HttpStatus, Post, Request, Response } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req, @Response() res) {
    const token = this.authService.getAccessToken(req.user);
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Login successful',
      token,
    });
  }
}
