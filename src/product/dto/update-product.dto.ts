import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto.js';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @IsOptional()
    @IsString()
    name: string;
    @IsOptional()
    @IsString()
    description: string;
    @IsOptional()
    @IsNumber()
    price: number;
    @IsOptional()
    @IsNumber()
    stock: number;
    @IsOptional()
    @IsString()
    imageUrl: string;
}
