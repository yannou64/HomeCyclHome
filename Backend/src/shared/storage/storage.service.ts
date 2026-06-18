import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { extname } from 'path';

@Injectable()
export class StorageService {
    private readonly s3: S3Client;
    private readonly bucket: string;

    constructor() {
        this.s3 = new S3Client({ region: process.env.AWS_REGION });
        this.bucket = process.env.AWS_S3_BUCKET!;
    }

    async uploadFile(
        file: Express.Multer.File,
        folder: string,
    ): Promise<{ url: string; cle: string }> {
        const extension = extname(file.originalname); // ".jpg"
        const cle = `${folder}/${randomUUID()}${extension}`; // "interventions/abc/uuid.jpg"

        await this.s3.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: cle,
                Body: file.buffer,
                ContentType: file.mimetype,
            }),
        );

        const url = `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${cle}`;
        return { url, cle };
    }
}
