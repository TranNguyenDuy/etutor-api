import AWS from 'aws-sdk';
import { Progress } from 'aws-sdk/clients/s3';
import { AWSConfig } from '../configs';
AWS.config.accessKeyId = AWSConfig.accessKeyId;
AWS.config.secretAccessKey = AWSConfig.acessKeySecret;
AWS.config.region = AWSConfig.region;

export class S3Service {
    private static _s3 = new AWS.S3();

    getObjectURLPrefix(bucket: string) {
        return `https://${bucket}.s3-ap-southeast-1.amazonaws.com/`;
    }

    async pushFile(
        bucket: 'public' | 'private',
        folder: string,
        fileName: string, data: AWS.S3.Body,
        onUploadProgess?: (progress: Progress, response: AWS.Response<AWS.S3.PutObjectOutput, AWS.AWSError>) => void
    ) {
        const key = `${folder}/${fileName}`;
        const params = {
            Bucket: AWSConfig.buckets[bucket],
            Key: key,
            ACL: 'public-read',
            Body: data
        };
        const request = S3Service._s3.putObject(params);
        if (onUploadProgess) request.on('httpUploadProgress', onUploadProgess as any);
        try {
            const result = await request.promise();
            return {
                key: `${this.getObjectURLPrefix(params.Bucket)}${key}`,
                result
            };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}