const _ = require("underscore");
const AWS = require("aws-sdk");

const CONFIG = require("../config/main");
const cache = require("../cache");

const identityPoolId = { IdentityPoolId: CONFIG.AWS_IDENTITY_POOL_ID };
const region = CONFIG.AWS_REGION;
const imagesBucket = { Bucket: CONFIG.AWS_IMAGES_BUCKET };

AWS.config.region = region;
AWS.config.credentials = new AWS.CognitoIdentityCredentials(identityPoolId);
const s3 = new AWS.S3();

const encode = data => "data:image/jpeg;base64," + Buffer.from(data).toString("base64");

const saveLocations = res => {
  s3.listObjects(imagesBucket, (error, data) => {
    if (error) { return res.status(404).send({ error: error.message }); }
    
    cache.del("images");
    const keys = _.pluck(data.Contents, "Key");
    const multi = cache.multi();
    _.forEach(keys, key => multi.rpush("images", key));

    multi.exec((errors, results) => {
      return errors
        ? res.status(422).send({ error: errors })
        : res.status(200).send({ success: `Saved ${results.length} keys.` });
    });
  });
}

const getLocations = res => {
  cache.lrange("images", 0, -1, async (error, reply) => {
    return reply
      ? res.status(200).send({ imageKeys: reply })
      : res.status(404).send({ error: error || "Not found." });
  });  
}

const getImage = (key, res) => {
  const params = {
    Key: key,
    Bucket: CONFIG.AWS_IMAGES_BUCKET
  };

  s3.getObject(params, (error, response) => {
    return error
      ? res.status(422).send({ error: error.message })
      : res.status(200).send({ source: encode(response.Body) });
  });  
}

exports.read = (req, res, next) => {
  const {
    key,
    save
  } = req.query;

  if (save) {
    return saveLocations(res);
  } else if (key) {
    return getImage(key, res);
  } else {
    return getLocations(res);
  }
};
