const mongoose = require("mongoose");
const _ = require("underscore");
const JSZip = require("jszip");
const fs = require("fs");
const pdfmake = require("../node_modules/pdfmake/build/pdfmake.min.js");
const pdffonts = require("../node_modules/pdfmake/build/vfs_fonts.js");
pdfmake.vfs = pdffonts.pdfMake.vfs;

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const TYPES = ["welcome"];

const message = (email, type, name, attachment) =>
  ({
    welcome: {
      to: email,
      from: "ben@playwordcraft.com",
      bcc: ["ben@playwordcraft.com"],
      subject: "Welcome to Wordcraft",
      templateId: "248a901d-22b5-493c-a255-44e431954da0",
      attachments: [{
        content: attachment,
        filename: 'Wordcraft.zip',
        type: 'application/zip'
      }]
    }
  }[type]);

exports.send = (data, cb) => {
  const {
    email,
    password,
    name,
    type,
    students
  } = data;

  const valid = email && password && name && _.contains(TYPES, type) && _.isArray(students);
  if (!valid) { return cb({ error: "Bad input." }); }

  fs.readFile("lib/pdfs/Wordcraft-Guide.pdf", (error, data) => {
    if (error) { return cb({ error: error.message }); };

    fs.readFile('controllers/account-card.jpg', { encoding: 'base64' }, (error, imgBase64) => {
      if (error) { return cb({ error: error }); }

      const docDefinition = {
        background: function(currentPage) {
          return currentPage === 1 ? {} : {
            image: "data:image/jpg;base64," + imgBase64,
            width: 595,
            height: 841
          }
        },
        content: _.flatten([
          { text: 'WORDCRAFT', style: ['header'] },
          { text: 'Teacher Account', style: ['subHeader'], margin: [0,30,0,10] },
          { text: `${email} - ${password}`, style: ['masterListCredentials'] },
          { text: 'Student Accounts', style: ['subHeader'], margin: [0,30,0,10] },
          _.map(students, student => ({
            text: `${student.firstName + student.lastName ? ` ${student.lastName}` : ''}, ${student.email} - ${student.password}`,
            style: ['masterListCredentials'],
            margin: [0,2,0,0]
          })),
          { text: "", pageBreak: "after" },
          _.map(students, (student, idx) => [
            {
              text: student.email,
              style: ['accountCardCredentials'],
              margin: [0,519,0,0]
            },
            {
              text: student.password,
              pageBreak: students.length === idx + 1 ? "none" : "after",
              style: ['accountCardCredentials'],
              margin: [0,134,0,0]
            }
          ])
        ]),
        styles: {
          header: {
            color: "#f3be5b",
            bold: true,
            fontSize: 20
          },
          subHeader: {
            alignment: "center",
            fontSize: 16
          },
          masterListCredentials: {
            alignment: "center",
            fontSize: 12
          },
          accountCardCredentials: {
            alignment: "center",
            bold: true,
            fontSize: 18
          }
        }
      };

      pdfmake.createPdf(docDefinition).getBase64(base64 => {

        var zip = new JSZip();
        zip.file("Wordcraft-Guide.pdf", data);
        zip.file("Accounts-Information.pdf", base64, { base64: true });

        zip.generateAsync({ type: "base64" }).then(attachment => {
          const msg = message(email, type, name, attachment);
          process.env.NODE_ENV === "test"
            ? cb(msg)
            : sgMail
                .send(msg)
                .then(() => cb(msg))
                .catch(error => cb({ error: error.message }));
        })
      });      
    });
  });
};

exports.post = (req, res, next) => {
  return exports.send(req.body, r => res.status(r.error ? 422 : 200).send(r));
};
