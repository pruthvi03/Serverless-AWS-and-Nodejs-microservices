import { uploadPictureToS3 } from "../lib/uploadPictureToS3";
import { getAuctionById } from "./getAuction";

import middy from '@middy/core';
import httpErrorHandler from "@middy/http-error-handler";
import createError from 'http-errors';

export async function uploadAuctionPicture(event, context) {

    const { id } = event.pathParameters;
    const auction = await getAuctionById(id);
    
    try {
        const base64 = event.body.replace(/^data:image\/\w+;base64,/, '')
        const buffer = Buffer.from(base64, 'base64')
        const uploadToS3Result = await uploadPictureToS3(auction.id + '.jpg', buffer)
        console.log(uploadToS3Result)
    } catch (error) {
        throw new createError.InternalServerError(error);
    }

    return (
        {
            status: 200,
            body: JSON.stringify({})
        }
    );

}

export const handler = middy(uploadAuctionPicture)
    .use(httpErrorHandler());