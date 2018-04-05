const mongoose = require("mongoose");
const _ = require("underscore");
const JSZip = require("jszip");
const fs = require("fs");
const pdfmake = require("../node_modules/pdfmake/build/pdfmake.min.js");
const pdffonts = require("../node_modules/pdfmake/build/vfs_fonts.js");
pdfmake.vfs = pdffonts.pdfMake.vfs;

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const TYPES = [
  "welcome",
  "newAccounts"
];

const message = (email, type, name, attachment) => ({
  welcome: {
    to: email,
    from: "hello@playwordcraft.com",
    bcc: ["ben@playwordcraft.com"],
    subject: "Welcome to Wordcraft",
    templateId: "248a901d-22b5-493c-a255-44e431954da0",
    attachments: [{
      content: attachment,
      filename: 'Wordcraft.zip',
      type: 'application/zip'
    }]
  },
  newAccounts: {
    to: email,
    from: "hello@playwordcraft.com",
    bcc: ["ben@playwordcraft.com"],    
    subject: "New Accounts",
    templateId: "9f00ab28-13cf-4d47-97fd-525acd9930b5",
    attachments: [{
      content: attachment,
      filename: 'Accounts.pdf'
    }]
  }    
}[type]);

const accountsPdf = (students, email, password, includeMasterList, cb) => {
  fs.readFile('lib/images/account-card.jpg', { encoding: 'base64' }, (error, imgBase64) => {
    if (error) { return cb({ error: error.message }); }

    const masterList = includeMasterList ? [
      { text: 'WORDCRAFT', style: ['header'] },
      { text: 'Teacher Account', style: ['subHeader'], margin: [0,30,0,10] },
      { text: `${email} - ${password}`, style: ['masterListCredentials'] },
      { text: 'Student Accounts', style: ['subHeader'], margin: [0,30,0,10] },
      _.map(students, student => ({
        text: `${student.firstName} ${student.lastName}, ${student.email} - ${student.password}`,
        style: ['masterListCredentials'],
        margin: [0,2,0,0]
      })),
      { text: "", pageBreak: "after" }
    ] : [];

    const docDefinition = {
      background: function(currentPage) {
        return (includeMasterList && currentPage === 1) ? {} : {
          image: "data:image/jpg;base64," + imgBase64,
          width: 595,
          height: 841
        }
      },
      content: _.flatten([
        masterList,
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

    pdfmake.createPdf(docDefinition).getBase64(base64 => cb(base64));
  });
}

exports.send = (data, cb) => {
  const {
    email,
    password,
    name,
    type,
    students
  } = data;

  if (type === "welcome") {
    const valid = email && name && password && _.contains(TYPES, type) && _.isArray(students);
    if (!valid) { return cb({ error: "Bad input." }); }

    fs.readFile("lib/pdfs/Wordcraft-Guide.pdf", (error, data) => {
      if (error) { return cb({ error: error.message }); };

      accountsPdf(students, email, password, true, result => {
        if (result.error) { return cb({ error: error }); }

        var zip = new JSZip();
        zip.file("Wordcraft-Guide.pdf", data);
        zip.file("Accounts-Information.pdf", result, { base64: true });

        zip.generateAsync({ type: "base64" }).then(attachment => {
          const msg = message(email, type, name, attachment);
          process.env.NODE_ENV === "test"
            ? cb(msg)
            : sgMail
                .send(msg)
                .then(() => cb(msg))
                .catch(error => cb({ error: error.message }));
        });
      });
    });    
  } 

  if (type === "newAccounts") {
    const valid = email && _.contains(TYPES, type) && _.isArray(students);
    if (!valid) { return cb({ error: "Bad input." }); }
    accountsPdf(students, email, null, false, result => {
      if (result.error) { return cb({ error: error }); }
      const msg = message(email, type, name, result);      

      process.env.NODE_ENV === "test"
        ? cb(msg)
        : sgMail
            .send(msg)
            .then(() => cb(msg))
            .catch(error => cb({ error: error.message }));
    });
  }
};

exports.post = (req, res, next) => {
  return exports.send(req.body, r => res.status(r.error ? 422 : 200).send(r));
};
