import { createOrganization } from "@/service/clerk";
import { NextRequest, NextResponse } from "next/server";


/**
 * Create a new organization
 * @param req - The incoming request
 * @returns - The response
 */
export async function POST(req: NextRequest){
    try{
        const body = await req.json();
        const {name, slug, maxAllowedMemberships} = body;

        const newOrg = await createOrganization({name, slug, maxAllowedMemberships});
        return NextResponse.json({data: newOrg});
    }catch(error: any){
        return NextResponse.json({error: error.message}, {status: 400});
    }
}