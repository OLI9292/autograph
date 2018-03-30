const jwt = require("jwt-simple");
const mongoose = require("mongoose");

const CONFIG = require("../config/main");
const User = require("../models/user");

const helpers = require("../lib/helpers");

const expiresIn = numDays => {
  var dateObj = new Date();
  return dateObj.setDate(dateObj.getDate() + numDays);
};

const genToken = user => {
  const expires = expiresIn(7);
  const token = jwt.encode({ exp: expires }, CONFIG.VALIDATION_TOKEN);
  return {
    user: user,
    expires: expires,
    token: token,
    sessionId: helpers.guid(),
    isTeacher: user.isTeacher
  };
};

exports.login = async (email, password, cb) => {
  if (!email || !password) {
    cb({ error: "Email & password required." });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      cb({ error: "Email not found." });
    }

    await user.comparePassword(password, function(error, isMatch) {
      if (error) {
        return { error: "Something went wrong." };
      }
      const result = isMatch
        ? genToken(user)
        : { error: "Incorrect password." };
      cb(result);
    });
  } catch (error) {
    cb({ error: "Something went wrong." });
  }
};

exports.loginRequest = async (req, res, next) => {
  const { email, password } = req.body;
  exports.login(email, password, result =>
    res.status(result.error ? 422 : 200).send(result)
  );
};
