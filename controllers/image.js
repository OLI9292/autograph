const AWS = require("aws-sdk");

const CONFIG = require("../config/main");

const identityPoolId = { IdentityPoolId: CONFIG.AWS_IDENTITY_POOL_ID };
const region = CONFIG.AWS_REGION;
const imagesBucket = { Bucket: CONFIG.AWS_IMAGES_BUCKET };

AWS.config.region = region;
AWS.config.credentials = new AWS.CognitoIdentityCredentials(identityPoolId);

const s3 = new AWS.S3();

const encode = data => "data:image/jpeg;base64," + Buffer.from(data).toString('base64');

exports.read = (req, res, next) => {
  const params = {
    Key: req.query.word + ".jpg",
    Bucket: CONFIG.AWS_IMAGES_BUCKET
  };

  s3.getObject(params, (error, response) => {
    return error
      ? res.status(422).send({ error: error.message })
      : res.status(200).send({ source: encode(response.Body) });
  });
};
