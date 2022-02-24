import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(@Req() req: Request, @Res() res: Response): string {
    console.log(req.body);
    res.json({ cats: [] });
    return 'This action returns all cats';
  }

  @Get(':id')
  findOne(@Param('id') id: string): string {
    return `This action returns #${id} cat`;
  }

  @Post()
  create(@Body() createDto: CreateDto): string {
    return 'This action add a new cat';
  }
}
