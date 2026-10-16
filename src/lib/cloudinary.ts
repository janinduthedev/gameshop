import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const PRODUCT_FOLDER = "gamestore/products";

export type UploadedImage = {
  url: string;
  publicId: string;
};

/**
 * Upload a file buffer to Cloudinary and return its URL + public id.
 * We accept a Buffer so it works with Next.js Route Handlers (FormData).
 */
export async function uploadImage(
  file: Buffer,
  folder: string = PRODUCT_FOLDER,
): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );

    uploadStream.end(file);
  });
}

/** Delete an image from Cloudinary by its public id. */
export async function deleteImage(publicId: string) {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
}

export { cloudinary };
