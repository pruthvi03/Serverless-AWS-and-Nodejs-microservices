async function notifyAuctionEnded(event, context) {
  const record = event.Records[0];
  console.log('record prrocessing: ', record);

  const email = JSON.parse(record.body)
  const { subject, body, recipient } = email
  console.log(subject, body, recipient);
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello World' }),
  };
}

export const handler = notifyAuctionEnded;


