const path = require('path')
const fs = require('fs')
const mongoose = require('mongoose')
const Busboy = require('busboy')
const _ = require('underscore')
const util  = require('util')
const spawn = require('child_process').spawn

const Word = require('../models/word')

const CONTEXT = 2

const search = async (filepath, cb) => {
  const lines = fs.readFileSync(filepath).toString().split('\n')

  Word.find({}, (error, words) => {    
    if (error) { cb({ error: error.message }) }

    let allMatches = []
    const pattern = words.map((w) => w.value).join('|')
    const grep = spawn('grep', ['-n', '-oiw', '-E', pattern, filepath])

    grep.stdout.on('data', (data) => {
      const matches = data.toString()
        .split('\n')
        .filter(m => m.length && m.split(':').length > 1)
        .map((m) => ({ lineNo: m.split(':')[0], word: m.split(':')[1] }))
      matches.forEach((m) => m.context = lines.slice(parseInt(m.lineNo) - CONTEXT - 1, parseInt(m.lineNo) + CONTEXT).join(' '))  
      allMatches.push(matches)
    })

    grep.on('close', (code) => {
      const uniqueMatches = _.flatten(allMatches)
      cb(uniqueMatches)
    })
  })
}

exports.parse = (req, res, next) => {
  const busboy = new Busboy({ headers: req.headers })

  busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
    const saveTo = path.join('.', filename)
    
    file.pipe(fs.createWriteStream(saveTo)).on('finish', async () => {
      OLOG.log({ level: 'info', message: `File ${filename} is ${fs.statSync(saveTo).size/1000000} mb.` });

      search(saveTo, (result) => {
        fs.unlink(saveTo)
        return res.status(201).send(result)
      })
    })
  })

  req.pipe(busboy) 
}
