import { ApiProperty } from '@nestjs/swagger';

export class PhotosUploadedDto {
    @ApiProperty()
    count: number;

    @ApiProperty({ type: [String] })
    urls: string[];
}
