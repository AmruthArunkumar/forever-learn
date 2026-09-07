import cloudinary from "@/app/cloudinary/config";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const { image, folder, name } = await request.json();
    if (!image || !folder) {
        return new Response("Bad Request", { status: 400 });
    }
    try {
        const result = await cloudinary.uploader.upload(image, {
            public_id: name,
            asset_folder: folder,
            use_asset_folder_as_public_id_prefix: true,
            type: "authenticated",
            access_mode: "authenticated",
        });
        return Response.json({ message: "successfully uploaded image" }, { status: 200 });
    } catch (error: any) {
        console.error("Caught Exception:", error.message || error);
        return Response.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
