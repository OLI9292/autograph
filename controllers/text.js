const path = require("path");
const fs = require("fs");

const https = require("https");
const http = require("http");
const mongoose = require("mongoose");
const Busboy = require("busboy");
const _ = require("underscore");
const util = require("util");
const spawn = require("child_process").spawn;

const Word = require("../models/word");

const CONTEXT = 3;

const likelySentence = sentence =>
  sentence.split(" ").length > 8 && sentence.split(">").length < 8;

const searchDoc = (doc, cb) => {
  const sentences = doc.split(".");

  Word.find({}, (error, words) => {
    let allMatches = [];
    const values = _.pluck(words, "value");
    const likelySentences = _.filter(sentences, likelySentence);

    sentences.forEach((sentence, idx) => {
      if (likelySentence(sentence)) {
        const matches = _.filter(values, value =>
          sentence.toLowerCase().includes(value)
        );
        if (matches.length) {
          allMatches.push({
            words: matches,
            context: sentences.splice(idx - 1, 4).join(". ")
          });
        }
      }
    });

    const filtered = _.filter(
      allMatches,
      match => match.context.length < 3000 && match.words.length < 4
    );
    cb(filtered);
  });
};

const search = async (filepath, cb) => {
  const lines = fs
    .readFileSync(filepath)
    .toString()
    .split("\n");

  Word.find({}, (error, words) => {
    if (error) {
      cb({ error: error.message });
    }

    let allMatches = [];
    const pattern = words.map(w => w.value).join("|");

    const grep = spawn("grep", ["-n", "-oiw", "-E", pattern, filepath]);

    grep.stdout.on("data", data => {
      const matches = data
        .toString()
        .split("\n")
        .filter(m => m.length && m.split(":").length > 1)
        .map(m => ({ lineNo: m.split(":")[0], word: m.split(":")[1] }));

      matches.forEach(
        m =>
          (m.context = lines
            .slice(
              parseInt(m.lineNo) - CONTEXT - 1,
              parseInt(m.lineNo) + CONTEXT
            )
            .join(" "))
      );

      allMatches.push(matches);
    });

    grep.on("close", code => {
      const uniqueMatches = _.flatten(allMatches);

      const grouped = _.values(
        _.mapObject(
          _.groupBy(uniqueMatches, m => m.lineNo),
          (matches, lineNo) => ({
            lineNo: lineNo,
            context: matches[0].context,
            words: _.pluck(matches, "word").sort()
          })
        )
      );

      cb(grouped);
    });
  });
};

exports.parse = (req, res, next) => {
  if (req.query.type === "url" && req.query.url) {
    const protocol = req.query.url.includes("https") ? https : http;
    protocol.get(req.query.url, resp => {
      let data = "";

      resp.on("data", chunk => (data += chunk));

      resp.on("end", () => {
        searchDoc(data, result => {
          return res.status(201).send(result);
        });
      });
    });
  } else {
    const busboy = new Busboy({ headers: req.headers });

    busboy.on("file", async (fieldname, file, filename, encoding, mimetype) => {
      const saveTo = path.join(".", filename);

      file.pipe(fs.createWriteStream(saveTo)).on("finish", async () => {
        console.log(`File ${filename} is ${fs.statSync(saveTo).size / 1000000} mb.`);

        search(saveTo, result => {
          fs.unlink(saveTo);
          return res.status(201).send(result);
        });
      });
    });

    req.pipe(busboy);
  }
};
