var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require("fs-extra");
var session = require("express-session");
var passwordHash = require('password-hash');
// Create application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//the id of this user
/**** get the default project html ******/
app.use(session({
        secret:"$this#IS#a#Secret#Encryption#Key#",
        resave:false,
        saveUninitialized:true
    })
);
var arrays;
app.get('/', function (req, res) {
    if(!req.session.email) {
        res.sendFile( __dirname + "/projectPH1 23 69/" + "login.html" );
    }
    else {
        res.sendFile(__dirname + "/projectPH1 23 69/" + "ToDoList.html");
    }
});
app.get("/signup", function(req, res) {
    if(!req.session.email) {
        res.sendFile(__dirname + "/projectPH1 23 69/" + "Sign-Up.html" );
    }
    else {
        res.sendFile(__dirname + "/projectPH1 23 69/" + "ToDoList.html");
    }
});
app.get("/css/" + "awesome-bootstrap-checkbox.css", function(req, res) {
    res.sendFile(__dirname + "/projectPH1 23 69/css/" + "awesome-bootstrap-checkbox.css");
});
app.get("/js/" + "data.js", function(req, res) {
    res.sendFile(__dirname + "/projectPH1 23 69/js/" + "data.js");
});
app.post("/login", function(req, res) {
    if(!req.session.email) {
        var email = req.body.email;
        var password = req.body.password;
        var usersData
        var loggedIn = false;
        fs.readFile(__dirname + "/database/" + "users.json", 'utf8', function (err, data) {
            if(err) {
                console.log("failed to open file: %s", err);
            }
            try {
                usersData = JSON.parse(data);
            } catch(ex) {
                console.log(ex);
            }
            for(var user in usersData) {
                if(usersData[user].email.toLowerCase() === email.toLowerCase() && passwordHash.verify(password, usersData[user].password)) {
                    loggedIn = true;
                    req.session.userName = usersData[user].name;
                    req.session.userID = usersData[user].id;
                    break;
                }
            }
            if(loggedIn) {
                req.session.email = email;
                res.sendFile(__dirname + "/projectPH1 23 69/" + "ToDoList.html");
                /**   
                  * fs.readFile(__dirname + "/database/data/" + "user" + req.session.userID + ".json",  'utf8', function (err, data) {
                        if(err) {
                            console.log(err);
                        }
                        try{
                            req.session.arrays = JSON.parse(data);
                            req.session.arrays["name"] = req.session.userName;
                            console.log(req.session.arrays)
                        } catch(ex) {
                            console.log(ex);
                        }
                    });
                **/
                try {
                    data = fs.readFileSync(__dirname + "/database/data/" + "user" + req.session.userID + ".json");
                    req.session.arrays = JSON.parse(data);
                    req.session.arrays["name"] = req.session.userName
                } catch (ex) {
                    console.log(ex);
                }
            }
            else {
                res.sendFile(__dirname + "/projectPH1 23 69/" + "Login Error.html")
            }
        });
        //console.log(req.session.userName);
    } else {
        res.sendFile(__dirname + "/projectPH1 23 69/" + "ToDoList.html");
    }
});
app.post("/register", function(req, res) {
    if(!req.session.email) {
        var name = req.body.name;
        var email = req.body.email;
        var password = req.body.password;
        var passwordConfirmation = req.body.pwConfirmation;
        var emailRegex =/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var correctPassword = (password.length >= 5) && (passwordConfirmation === password);
        var correctEmail = emailRegex.test(email);
        var emailRegistered = false;
        var nameRegex = /^[a-zA-Z ]{1,31}$/;
        var correctName = nameRegex.test(name.trim());
        var usersData;
        var currentUser = 1;
        var correctInput = correctName && correctEmail && correctPassword;
        fs.readFile(__dirname + "/database/" + "users.json", 'utf8', function (err, data) {
            if(err) {
                console.log("failed to open file: %s", err);
            }
            //gets the users data from the json
            //and stores it as a javascript object
            try {
                usersData = JSON.parse(data);
            } catch(ex){
                console.log(ex);
            }
            if(correctInput) {
                for(var user in usersData) {
                    currentUser++;
                    if(usersData[user].email === email) {
                        emailRegistered = true;
                    }
                }
            }
            if(correctInput && !emailRegistered) {
                req.session.email = email;
                req.session.arrays = {
                    'inProgressArray[]': [],
		            'completedArray[]': [],
		            'archivedArray[]': [],
		            "name": name
                }
                if(currentUser == 1) {
                    usersData = {};
                }
                req.session.userID = currentUser;
                req.session.userName = name;
                usersData["user" + currentUser] = {
                    email: email,
                    password: passwordHash.generate(password),
                    name: name,
                    id: currentUser
                };
                fs.mkdirs(__dirname + "/database", function(err) {
                    if (err) {
                        console.log(err);
                    }
                    fs.writeFile(__dirname + "/database/" + "users.json",JSON.stringify(usersData), function (err) {
                        if (err) return console.log(err);
                        //console.log(JSON.stringify(data));
                    });
                    fs.mkdirs(__dirname + "/database/data", function(err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                });
                res.sendFile(__dirname + "/projectPH1 23 69/" + "ToDoList.html" );
            }
            else {
                if(correctName && correctEmail && !correctPassword) {
                    res.sendFile(__dirname + "/projectPH1 23 69/" + "Sign-Up Error Password.html");
                }
                else if((!correctEmail || !correctName)) {
                    res.sendFile(__dirname + "/projectPH1 23 69/" + "Sign-Up Error Email.html");
                }
                else if(emailRegistered) {
                    res.sendFile(__dirname + "/projectPH1 23 69/" + "Sign-Up Error Already Registered.html");
                }
            }
        });
    } else {
        res.sendFile(__dirname + "/projectPH1 23 69/" + "ToDoList.html");
    }
});
app.get("/logout", function(req, res) {
    delete req.session.email;
    delete req.session.arrays;
    res.sendFile( __dirname + "/projectPH1 23 69/" + "login.html" );
});
// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', "http://localhost:8081");

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
app.post("/arraydata", function (req, res) {
    res.send(req.session.arrays);
});
app.post('/array', function(req, res) {
    var data = req.body;
    fs.writeFile(__dirname + "/database/data/" + "user" + req.session.userID +  ".json",JSON.stringify(data), function (err) {
        if (err) {
            console.log(err);
        }
    });
    req.session.arrays = data;
    req.session.arrays["name"] = req.session.userName;
    console.log(req.session.arrays);
    res.send('success');
});
app.get("*", function(req, res){
    if(!req.session.email) {
        res.sendFile(__dirname + "/projectPH1 23 69/" + "login.html");
    }
    else {
        res.sendFile(__dirname + "/projectPH1 23 69/" + "ToDoList.html");
    }
});
var server = app.listen(8081, function () {
    console.log("todo list app listening at http://127.0.0.1:8081");
});