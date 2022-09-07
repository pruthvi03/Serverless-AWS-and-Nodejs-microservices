import middy from '@middy/core'
import httpJsonBodyParser from '@middy/http-json-body-parser'
import httpEventNormalizer from '@middy/http-event-normalizer'
import httpErrorHandler from '@middy/http-error-handler'

// export default function that take handler wraps it in middy middlewares

// httpJsonBodyParser: automatically parse our stringified event body.

// httpEventNormalizer: automatically adjust the API Gateway objects to
// prevent us from accidentally having non exisiting objects when trying to 
// access path parameters or query parameters.

// httpErrorHandler: make us our handling error process smooth easy and clean
// by working with http-errors NPM package. 

export default handler => middy(handler)
    .use([
        httpJsonBodyParser(),
        httpEventNormalizer(),
        httpErrorHandler()
    ])