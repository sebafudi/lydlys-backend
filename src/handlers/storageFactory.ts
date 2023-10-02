import * as Minio from "minio";

export abstract class StorageFactory {
  public abstract createStorage(): Storage;
  public async uploadFile(file: Buffer, fileName: string): Promise<string> {
    const storage = this.createStorage();
    return await storage.uploadFile(file, fileName);
  }
  public async deleteFile(fileName: string): Promise<void> {
    const storage = this.createStorage();
    await storage.deleteFile(fileName);
  }
  public async listFiles(): Promise<Minio.BucketItem[]> {
    const storage = this.createStorage();
    return await storage.listFiles();
  }
  public async getFileUrl(fileName: string): Promise<string> {
    const storage = this.createStorage();
    return await storage.getFileUrl(fileName);
  }
}

interface Storage {
  uploadFile(file: Buffer, fileName: string): Promise<string>;
  deleteFile(fileName: string): Promise<void>;
  listFiles(): Promise<Minio.BucketItem[]>;
  getFileUrl(fileName: string): Promise<string>;
}

export class MinioFactory extends StorageFactory {
  private options: Minio.ClientOptions;
  private bucketName: string;
  constructor(options: Minio.ClientOptions, bucketName: string) {
    super();
    this.options = options;
    this.bucketName = bucketName;
  }
  public createStorage(): Storage {
    return new MinioStorage(this.options, this.bucketName);
  }
}

class MinioStorage implements Storage {
  private client: Minio.Client;
  private bucketName: string;
  constructor(options: Minio.ClientOptions, bucketName: string) {
    this.client = new Minio.Client(options);
    this.bucketName = bucketName;
  }
  public async uploadFile(file: Buffer, fileName: string): Promise<string> {
    await this.client.putObject(this.bucketName, fileName, file);
    return this.client.presignedUrl("GET", this.bucketName, fileName);
  }
  public async deleteFile(fileName: string): Promise<void> {
    await this.client.removeObject(this.bucketName, fileName);
  }
  public async listFiles(): Promise<Minio.BucketItem[]> {
    const files: Minio.BucketItem[] = [];
    const stream = this.client.listObjects(this.bucketName, "", true);
    for await (const file of stream) {
      files.push(file);
    }
    return files;
  }
  public async getFileUrl(fileName: string): Promise<string> {
    return this.client.presignedUrl("GET", this.bucketName, fileName);
  }
}

export function newStorage() {
  if (!process.env.STORAGE_TYPE) {
    throw new Error("Missing required environment variable: STORAGE_TYPE");
  }
  if (process.env.STORAGE_TYPE === "minio") {
    const requiredEnvVars = [
      "MINIO_ENDPOINT",
      "MINIO_ACCESS_KEY",
      "MINIO_SECRET_KEY",
      "MINIO_BUCKET_NAME",
      "MINIO_PORT",
    ];

    requiredEnvVars.forEach((envVar) => {
      const missingEnvs = [];
      if (!process.env[envVar]) {
        missingEnvs.push(envVar);
      }
      if (missingEnvs.length > 0) {
        throw new Error(
          `Missing required environment variables: ${missingEnvs.join(", ")}`,
        );
      }
    });
    return new MinioFactory(
      {
        endPoint: process.env.MINIO_ENDPOINT!,
        accessKey: process.env.MINIO_ACCESS_KEY!,
        secretKey: process.env.MINIO_SECRET_KEY!,
        useSSL: false,
        port: parseInt(process.env.MINIO_PORT!),
      },
      process.env.MINIO_BUCKET_NAME!,
    );
  }
  throw new Error(`Invalid storage type: ${process.env.STORAGE_TYPE}`);
}
