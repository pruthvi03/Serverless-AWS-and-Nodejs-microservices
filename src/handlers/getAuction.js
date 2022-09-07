import AWS from 'aws-sdk';

import commonMiddleware from '../lib/commonMiddleware';

// used to create http error in very declarative way 
import createError from 'http-errors';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export async function getAuctionById(id) {
    let auction;
    try {
        // id is primary partition key that's why it will be used to get item
        // from dynamoDB table
        const result = await dynamoDB.get({
            TableName: process.env.AUCTIONS_TABLE_NAME,
            Key: { id }
        }).promise();

        auction = result.Item

    } catch (error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    }

    
    if (!auction){
        throw new createError.NotFound(`Auction with ID ${id} not found!`);
    }

    return auction;
}


async function getAuction(event, context) {
    // event -> will have all the information about event or execution stuff like
    // the event body, query params, path params, headers etc.

    // context -> will contains some meta data about execution of this lambda function.

    // you can also add custom data both to your events and context via middleware.
    // ex. if lambda require a id of user then you can create a middleware that put the
    // user ID in context.

    // lambdas can only run up to 15 minutes. 

    const { id } = event.pathParameters;
    const auction = await getAuctionById(id)

    // if you called lambda function by https then it expect, below like response.
    // it is neccsary to return string in body.
    return {
        statusCode: 200,
        body: JSON.stringify(auction),
    };
}

// middy is used to add middleware to our lambda function 
export const handler = commonMiddleware(getAuction)

