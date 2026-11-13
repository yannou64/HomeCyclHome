import { ApiProperty } from '@nestjs/swagger';

export class PhotosUploadedResponseDto {
    @ApiProperty()
    count!: number;

    @ApiProperty({ type: [String] })
    urls!: string[];
}
