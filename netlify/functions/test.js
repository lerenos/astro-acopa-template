// export default function handler(request, response)
exports.handler = async function(event, context)  {
  const { name = 'você' } = event.queryStringParameters;
  // response.status(200).send(`Hello ${name}!`);
  return {
    statusCode: 200,
    body: JSON.stringify({ message: `Hello ${name}!` }),
  };
}