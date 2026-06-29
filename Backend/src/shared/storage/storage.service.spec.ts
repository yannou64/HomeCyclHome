import { StorageService } from './storage.service';
import { S3Client } from '@aws-sdk/client-s3';

// On mock le client S3 pour ne pas faire de vrais appels réseau
jest.mock('@aws-sdk/client-s3', () => ({
    S3Client: jest.fn().mockImplementation(() => ({
        send: jest.fn().mockResolvedValue({}),
    })),
    PutObjectCommand: jest.fn(),
}));

describe('StorageService', () => {
    let service: StorageService;
    let mockSend: jest.Mock;

    beforeEach(() => {
        process.env.AWS_S3_BUCKET = 'test-bucket';
        process.env.AWS_REGION = 'eu-west-3';

        const mockClient = { send: jest.fn().mockResolvedValue({}) };
        (S3Client as jest.Mock).mockImplementation(() => mockClient);
        mockSend = mockClient.send;

        service = new StorageService();
    });

    it('retourne une url et une clé après upload', async () => {
        const fakeFile = {
            originalname: 'velo.jpg',
            mimetype: 'image/jpeg',
            buffer: Buffer.from('fake-image-data'),
        } as Express.Multer.File;

        const result = await service.uploadFile(
            fakeFile,
            'interventions/abc-123',
        );

        expect(mockSend).toHaveBeenCalledTimes(1);
        expect(result.url).toContain('test-bucket');
        expect(result.url).toContain('interventions/abc-123');
        expect(result.cle).toContain('interventions/abc-123');
        expect(result.cle).toContain('.jpg');
    });

    it('propage une erreur si S3 échoue', async () => {
        mockSend.mockRejectedValueOnce(new Error('S3 unavailable'));

        const fakeFile = {
            originalname: 'velo.jpg',
            mimetype: 'image/jpeg',
            buffer: Buffer.from('data'),
        } as Express.Multer.File;

        await expect(
            service.uploadFile(fakeFile, 'interventions/abc-123'),
        ).rejects.toThrow('S3 unavailable');
    });
});
