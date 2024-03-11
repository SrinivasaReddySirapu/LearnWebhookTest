const crypto = require('crypto');
const secret = "<FunctionKey>"; // Assuming this is your secret key

module.exports = async function (context, req) {
  context.log('JavaScript HTTP trigger function processed a request.');

  // Retrieve the signature from the request header (assuming case-insensitivity)
  const gitHubSignature = req.headers['x-hub-signature']?.toLowerCase();

  if (!gitHubSignature) {
    context.log.error("Missing X-Hub-Signature header in request");
    context.res = {
      status: 400,
      body: "Missing X-Hub-Signature header",
    };
    return;
  }

  // Calculate the signature
  try {
    const hmac = crypto.createHmac("sha1", secret);
    const calculatedSignature = hmac.update(JSON.stringify(req.body)).digest("hex");

    context.log(`Calculated Signature: ${calculatedSignature}`);
    context.log(`Received Signature: ${gitHubSignature}`);

    if (calculatedSignature  !== gitHubSignature.substring(5).trim()) {
      context.log.error("Signature verification failed!");
      context.res = {
        status: 401,
        body: "Signatures don't match",
      };
      return;
    }
  } catch (error) {
    context.log.error("Error during signature verification:", error);
    context.res = {
      status: 500,
      body: "Internal server error",
    };
    return;
  }
// Process the request payload (assuming it's a Wiki event)
  if (req.body.pages && req.body.pages[0]) {
    context.res = {
      body: `Page is ${req.body.pages[0].title}, Action is ${req.body.pages[0].action}, Event Type is ${req.headers['x-github-event']}`,
    };
  } else {
    context.res = {
      status: 400,
      body: "Invalid payload for Wiki event",
    };
  }
};
