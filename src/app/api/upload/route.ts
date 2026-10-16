import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { getSession } from "@/lib/dal";
import { ROLES } from "@/constants";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_FOLDERS = ["gamestore/products", "gamestore/categories"];
const DEFAULT_FOLDER = "gamestore/products";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user || session.user.role !== ROLES.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folderInput = String(formData.get("folder") ?? "");
  const folder = ALLOWED_FOLDERS.includes(folderInput)
    ? folderInput
    : DEFAULT_FOLDER;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Only image files are allowed" },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File is too large (max 5MB)" },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadImage(buffer, folder);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
