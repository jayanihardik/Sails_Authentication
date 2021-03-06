/**
 * RegistationController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
var handlebars = require('handlebars');
var fs = require('fs');

module.exports = {

    profile: (req, res) => {
        return res.view('profile/profile')
    },

    profiledata: (req, res) => {
        var saveData = ` Titile : API_Request_Profiledata || Id: ${req.userData.id} || Email: ${req.userData.email} || 
        Date: ${new Date()}\n\n`
        fs.appendFile(".tmp/req.txt", saveData, function (err) { })
        user.find({ _id: req.userData.id }).exec((err, result) => {
            if (err) {
                res.send(500, { err: err })
                var saveData = ` Titile : API_Error_Profiledata ||  Error: ${err} || Id: ${req.userData.id} || Email: ${req.userData.email} || Date: ${new Date()}\n\n`
                fs.appendFile(".tmp/req.txt", saveData, function (err) { })
            }
            var saveData = ` Titile : API_Responce_Profiledata message: "Data Get Sucessfully" || Id: ${req.userData.id} || Email: ${req.userData.email} || Date: ${new Date()}\n\n`
            fs.appendFile(".tmp/req.txt", saveData, function (err) { })
            res.send(result)
        })
    },

    signup: (req, res) => {
        return res.view('registation/signup')
    },

    signupadd: async (req, res) => {
        var saveData = ` Titile : API_Request_signUp || name: ${req.body.name} || Email: ${req.body.email} || 
        Date: ${new Date()}\n\n`
        fs.appendFile(".tmp/req.txt", saveData, function (err) { })
        var data = {
            Titile: "API_Request_signUp",
            Name: req.body.name,
            Email: req.body.email,
            Date: new Date()
        }
        logtable.create(data).exec((err, result) => { })
        var readHTMLFile = function (path, callback) {
            fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
                if (err) {
                    throw err;
                    callback(err);
                }
                else {
                    callback(null, html);
                }
            });
        };

        const getUser = await user.findOne({ email: req.body.email });
        if (getUser)
            return res.status(200).send({ message: "Email is exist" });
        else
            bcrypt.hash(
                req.body.password,
                10,
                (err, hash) => {
                    if (err) {
                        return res.status(200).json({
                            message: "Not found"
                        });
                    } else {
                        var data = {
                            name: req.body.name,
                            email: req.body.email,
                            password: hash,
                            status: "panding",
                            verifyToken: Math.random().toString(36).replace('0.', '')
                        };
                        user.create(data).then(results => {
                            const url = `${req.protocol}://${req.get('host')}/verify/link/${data.verifyToken}`;
                            let testAccount = nodemailer.createTestAccount();
                            let transporter = nodemailer.createTransport({
                                host: "smtp.gmail.com",
                                port: 465,
                                auth: {
                                    user: 'techlession@gmail.com',
                                    pass: 'Techlession@#123'
                                }
                            });
                            readHTMLFile(__dirname + '../../email/verify/veryfy.html', function (err, html) {
                                var template = handlebars.compile(html);
                                var replacements = {
                                    url: url
                                };
                                var htmlToSend = template(replacements);
                                let info = transporter.sendMail({
                                    to: req.body.email,
                                    subject: "Account Verify",
                                    html: htmlToSend
                                    // html: "<b>Link is " + url + " </b>"
                                })
                            });
                            transporter.verify(function (error, success) {
                                if (error) {
                                    return res.status(200).send({ ResponseStatus: 1, message: "Email is Not Found" })
                                } else {
                                    var saveData = ` Titile : API_Responce_signUp || Status: true || Message: sign up successfull || name: ${req.body.name} || Email: ${req.body.email} || 
                                    Date: ${new Date()}\n\n`
                                    fs.appendFile(".tmp/req.txt", saveData, function (err) { })
                                    return res.status(200).send({ ResponseStatus: 0, message: "sign up successful and Verify your Email First" })
                                }
                            });
                        });
                    }
                }
            );
    },

    loginadd: async (req, res) => {
        var saveData = ` Titile : API_Request_Login || Email: ${req.body.email}  || 
        Date: ${new Date()}\n\n`
        fs.appendFile(".tmp/req.txt", saveData, function (err) { })
        var data = {
            Titile: "API_Request_Login",
            Email: req.body.email,
            Date: new Date()
        }
        logtable.create(data).exec((err, result) => { })
        const getUser = await user.findOne({ email: req.body.email });
        if (!getUser)
            return res.status(200).send({ message: "Email is Not Found" })
        if (getUser.status === "panding")
            return res.status(200).send({ message: "Email is Not verify" })
        else
            bcrypt.compare(req.body.password, getUser.password, (err, result) => {
                if (err) {
                    var saveData = ` Titile : API_Responce_Login || Status: false || Message: Enter valid Password || Email: ${req.body.email}  || 
                    Date: ${new Date()}\n\n`
                    fs.appendFile(".tmp/req.txt", saveData, function (err) { })
                    return res.status(200).json({
                        message: "Enter valid Password"
                    });
                }
                if (result) {
                    const token = jwt.sign(
                        { id: getUser.id, email: getUser.email },
                        'SECRET_KEY',
                        {
                            expiresIn: 120000
                        }
                    );
                    var saveData = ` Titile : API_Responce_Login || Status : true || Message : Login Sucessfull || Email: ${req.body.email}  ||  Date: ${new Date()}\n\n`
                    fs.appendFile(".tmp/req.txt", saveData, function (err) { })
                    return res.status(200).json({
                        ResponseStatus: 0,
                        message: "Sucefull",
                        token: token
                    });
                }
                var saveData = ` Titile : API_Responce_Login || Status : false || Message : Enter valid Password  || Email: ${req.body.email}  ||  Date: ${new Date()}\n\n`
                fs.appendFile(".tmp/req.txt", saveData, function (err) { })
                res.status(200).json({
                    message: "Enter valid Password "
                });
            })
    },

    verifyAccount: async (req, res) => {
        data = {
            status: "veryfiy"
        }
        await user.updateOne({ verifyToken: req.params.id }, data)
        return res.view('registation/verifyAccount')
    },

    logindata: (req, res) => {
        user.find().exec((err, result) => {
            if (err) {
                res.send(500, { err: err })
            }
            res.view('registation/login', { registation: result })
        })
    },

    forgetpassword: (req, res) => {
        registation.find().exec((err, result) => {
            if (err) {
                res.send(500, { err: err })
            }
            res.view('registation/forgetpassword', { registation: result })
        })
    },

    home: (req, res) => {
        return res.view('registation/registation')
    },

    listdata: async (req, res) => {
        registation.find().exec((err, result) => {
            if (err) {
                res.send(500, { err: err })
            }
            res.send(result)
        })
    },

    adddata: (req, res) => {
        var saveData = ` Titile : API_Reqest_adddata || Address: ${req.body.name} || PhoneNo: ${req.body.address} || Age: ${req.body.Phone} || City: ${req.body.city} || Date: ${new Date()}\n\n`
        fs.appendFile(".tmp/req.txt", saveData, function (err) { })
        registation.create(req.body).exec((err, result) => {
            if (err) {
                res.send(500, { err: err })
            }
            var saveData = ` Titile : API_Responce_adddata || status: true || message: "Data Add successfully || Address: ${req.body.name} || PhoneNo: ${req.body.address} || Age: ${req.body.Phone} || City: ${req.body.city} || Date: ${new Date()}\n\n`
            fs.appendFile(".tmp/req.txt", saveData, function (err) { })
            res.redirect('/registation/listdata')
        })

    },

    editdata: (req, res) => {
        registation.findOne({ _id: req.params.id }).exec((err, result) => {
            if (err) {
                res.send(500, { err: err })
            }
            res.view('registation/edit', { registation: result })
        })

    },

    deletedata: (req, res) => {
        var saveData = ` Titile : API_Reqest_deletedata || id: ${req.params.id}  || Date: ${new Date()}\n\n`
        fs.appendFile(".tmp/req.txt", saveData, function (err) { })
        registation.destroy({ id: req.params.id }).exec((err, result) => {
            if (err) {
                res.send(500, { err: err })
            }
            var saveData = ` Titile : API_Responce_deletedata|| status: true || message: " Delete successfully || id: ${req.params.id}  || Date: ${new Date()}\n\n`
            fs.appendFile(".tmp/req.txt", saveData, function (err) { })
            res.redirect('/registation/listdata')
        })

    },

    updatedata: (req, res) => {
        var saveData = ` Titile : API_Reqest_updatedata || status: true || message: " update successfully || id: ${req.params.id}  || Date: ${new Date()}\n\n`
            fs.appendFile(".tmp/req.txt", saveData, function (err) { })
        registation.update({ _id: req.params.id }, req.body).exec((err, result) => {
            if (err) {
                res.send(500, { err: err })
            }
            var saveData = ` Titile : API_Responce_updatedata || status: true || message: " update successfully || id: ${req.params.id}  || Date: ${new Date()}\n\n`
            fs.appendFile(".tmp/req.txt", saveData, function (err) { })
            return res.json({ status: true, message: "Data update successfully" });
        })
    },

    profileedit: (req, res) => {
        var saveData = ` Titile : API_Request_AddProfile || Address: ${req.body.Address} || PhoneNo: ${req.body.PhonNo} || Age: ${req.body.Age} || City: ${req.body.City} || Date: ${new Date()}\n\n`
        fs.appendFile(".tmp/req.txt", saveData, function (err) { })
        var data = {
            Titile: " API_Request_AddProfile",
            Address: req.body.Address,
            PhoneNo: req.body.PhonNo,
            Age: req.body.Age,
            City: req.body.City,
            Date: new Date()
        }
        logtable.create(data).exec((err, result) => { })
        user.updateOne({ _id: req.params.id }, req.body).exec((err, result) => {
            if (err) {
                var saveData = ` Titile : API_err_AddProfile || err : ${err} || Date: ${new Date()}\n\n`
                fs.appendFile(".tmp/req.txt", saveData, function (err) { })
                res.send(500, { err: err })
            }
            var saveData = ` Titile : API_Responce_AddProfile || status: true || message: "Data Update successfully || Address: ${req.body.Address} || PhoneNo: ${req.body.PhonNo} || Age: ${req.body.Age} || City: ${req.body.City} || Date: ${new Date()}\n\n`
            fs.appendFile(".tmp/req.txt", saveData, function (err) { })
            return res.json({ status: true, message: "Data ADD successfully" });
        })
    },

    updateProfile: (req, res) => {
        var saveData = ` Titile : API_Request_updateProfile , Address: ${req.body.Address} , PhoneNo: ${req.body.PhonNo} , Age: ${req.body.Age} , City: ${req.body.City} , Date: ${new Date()}\n\n`
        fs.appendFile(".tmp/req.txt", saveData, function (err, result) {
        })
        user.updateOne({ _id: req.params.id }, req.body).exec((err, result) => {
            if (err) {
                res.send(500, { err: err })
                var saveData = ` Titile : API_Respons_err_updateProfile || err: ${err} || Date: ${new Date()}\n\n`
                fs.appendFile(".tmp/req.txt", saveData, function (err) {
                })
            }
            var saveData = ` Titile : API_Respons_sucess_updateProfile || status: true || message: "Data Update successfully || Address: ${req.body.Address} || PhoneNo: ${req.body.PhonNo} || Age: ${req.body.Age} || City: ${req.body.City} ||  Date: ${new Date()}\n\n`
            fs.appendFile(".tmp/req.txt", saveData, function (err) { })
            return res.json({ status: true, message: "Data Update successfully" });
        })
    }

};

