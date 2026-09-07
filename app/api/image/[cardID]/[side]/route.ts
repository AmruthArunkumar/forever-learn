import cloudinary from "@/app/cloudinary/config";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ cardID: string; side: string }> }) {
    const { cardID, side } = await params;
    // console.log(
    //     cloudinary.url(`${path}`, {
    //         type: "authenticated",
    //         sign_url: true,
    //         secure: true,
    //         format: "png",
    //     }),
    // );
    // Response.redirect()
    // return Response.json({ message: "successfully found image" }, { status: 200 });
}
