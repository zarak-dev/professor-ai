import multer from "multer";
import path from "path";
import fs from "fs";

export class MulterConfig {
    private uploadFolder: string;
    private storage: multer.StorageEngine;
    public uploader: multer.Multer;

    constructor(uploadFolder: string = 'uploads') {
        this.uploadFolder = uploadFolder;
        this.initializeFolder();
        this.storage = this.createStorage();
        this.uploader = this.createUploader();
    }

    private initializeFolder(): void {
        if (!fs.existsSync(this.uploadFolder)) {
            fs.mkdirSync(this.uploadFolder);
        }
    }

    private createStorage(): multer.StorageEngine {
        return multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, this.uploadFolder);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, uniqueSuffix + '-' + file.originalname);
            }
        });
    }

    private fileFilter(req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext === '.pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }

    private createUploader(): multer.Multer {
        return multer({ 
            storage: this.storage,
            limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
            fileFilter: this.fileFilter
        });
    }
}
