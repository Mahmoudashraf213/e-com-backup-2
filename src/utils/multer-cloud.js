// import module
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import multer, { diskStorage } from "multer";
import { fileValidation } from "./multer.js";


export const cloudUploads = ({  allowFile = fileValidation.image }= {}) => {
  const storage = diskStorage({});

  const fileFilter = (req, file, cb) => {
    console.log("File mimetype:", file.mimetype); // أضف log للتحقق من نوع الملف
    if (allowFile.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error("invalid file format"), false);
  };

  return multer({ storage, fileFilter });
};
