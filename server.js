const express = require('express')
const app = express()

var cors = require('cors')

app.use(cors()) // Use this after the variable declaration


const bodyParser = require('body-parser');
var knex = require('knex')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { firebase, admin, provider } = require("./fbConfig")



// Cross domain setting
// var whiteList = {
//     "http://localhost:3000": true,
//     "https://example-url.herokuapp.com": true
// };
// var allowCrossDomain = function(req, res, next) {    
//         if(whiteList[req.headers.origin]){            
//             res.header('Access-Control-Allow-Credentials', true);
//             res.header('Access-Control-Allow-Origin', req.headers.origin);
//             res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
//             res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Origin, Accept');        
//             next();
//         } 
// };
// app.use(allowCrossDomain);

// 
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:3000');
//     res.header('Access-Control-Allow-Methods', 'POST');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     cors()
//     next();
// });

app.use(express.json({
    type: ['application/json', 'text/plain']
  }))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl:true,
    },
    useNullAsDefault: true
});

app.get('/landing-page', (req, res) => res.send("succes"))


app.post('/login-page', (req, res) => {
    firebase.auth().signInWithEmailAndPassword(/*userInfo.email, userInfo.password*/req.body.email, req.body.password)
        .then(function () {
            firebase.auth().currentUser.getIdToken(true).then(function (idToken) {
                db.select('*').from('users')
                    .where('email', '=', req.body.email)
                    .then(user => {
                        res.json({ "user": user[0], "token": idToken });
                    })
                    .catch(function (error) {
                        console.log(error)
                    });
            })
                .catch(error => {
                    res.status(400).json(error)
                })
        })
        .catch(function (error) {
            res.status(400).json("Unsuccesful registration. error: " + error)
        });
})

// app.post('/signinwithGoogle', (req, res) =>{
//     firebase.auth().signInWithPopup(provider).then(function(result) {
//         // This gives you a Google Access Token. You can use it to access the Google API.
//         var token = result.credential.accessToken;
//         // Build Firebase credential with the Google ID token.
//         var id_token = googleUser.getAuthResponse().id_token
//         var credential = firebase.auth.GoogleAuthProvider.credential(id_token);

// // Sign in with credential from the Google user.
// firebase.auth().signInWithCredential(credential).catch(function(error) {
//   // Handle Errors here.
//   var errorCode = error.code;
//   var errorMessage = error.message;
//   // The email of the user's account used.
//   var email = error.email;
//   // The firebase.auth.AuthCredential type that was used.
//   var credential = error.credential;
//   // ...
// });
//         // The signed-in user info.
//         var user = result.user;
//         res.json({"user": user, "token":token})
//         // ...
//       })
//       .catch(error =>{
//         // Handle Errors here.
//         // var errorCode = error.code;
//         // var errorMessage = error.message;
//         // The email of the user's account used.
//         // var email = error.email;
//         // The firebase.auth.AuthCredential type that was used.
//         // var credential = error.credential;
//         // ...
//         res.status(400).json(error)
//       });
// })

app.post("/register-page", (req, res) => {
    firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.password)
        .then(function () {
            firebase.auth().currentUser.getIdToken(true).then(function (idToken) {
                db("users")
                    .returning("*")
                    .insert({
                        email: req.body.email,
                        username: req.body.name,
                    })
                    .then(user => {
                        res.json({ "user": user[0], "token": idToken })

                    })
                    .catch(err=>{
                        res.json(err)
                    })

            })
                .catch(error => {
                    res.status(401).send(error);
                })
        })
        .catch(error => {
            res.status(401).send(error);
        })

})

// https://firebase.google.com/docs/auth/web/google-signin   


app.use(
    (req, res, next) => {
        try {
            const token = req.header('Authorization').replace('Bearer', '').trim()
            var user = firebase.auth().currentUser;
            if (user) {
                // let checkRevoked = true;
                admin.auth().verifyIdToken(token)
                    .then(function (decodedToken) {
                        if (decodedToken.uid === user.uid) {
                            req.user = user.uid
                            return next()
                        }
                    }).catch(function (error) {
                        // if (error.code == 'auth/id-token-revoked') {
                        //     res.send( "Token has been revoked. Reauthenticate or signOut() the user.")
                        //   } else {
                        //     res.send("Token is invalid.")
                        //   }
                        res.status(500).json(error)
                    });
            } 
            else {
                console.log("There is no current user.");
                res.status(401).json()
            }
        }
        catch (e) {
            console.log(e)
            res.status(401).send("Unauthorized")
        }

    }
);


app.post("/loadBoards", (req, res) => {
    const { userId } = req.body;
    db.select('*').from('boards')
        .where('userid', '=', userId)
        .then(boards => {
            res.json(boards);
        })
        .catch(function (error) {
            console.log(error)
            res.status(500).json(error)
        });

})

app.post("/createBoard", (req, res) => {
    const { boardTitle, userId } = req.body;
    db("boards")
        .returning("*")
        .insert({
            boardname: boardTitle,
            userid: userId,
        })
        .then(board => {
            res.json(board[0])

        })

})



app.post("/createList", (req, res) => {
    const { boardId, listTitle } = req.body;
    db("lists")
        .returning("*")
        .insert({
            boardid: boardId,
            listtitle: listTitle,
        })
        .then(list => {
            res.json(list[0])

        })
})

app.post('/loadLists' , (req, res) =>{
    const {boardId} = req.body;
    db.select('*').from('lists')
        .where('boardid', '=', boardId)
        .then(lists => {
            res.json(lists);
        })
        .catch(function (error) {
            console.log(error)
            res.status(500).json(error)
        });

})



app.post('/loadCards', (req, res) =>{
    const {listId} = req.body;
    db.select('*').from('cards')
        .where('listid', '=', listId)
        .then(cards => {
            res.json(cards);
        })
        .catch(function (error) {
            console.log(error)
            res.status(500).json(error)
        });
})


app.post("/createCard", (req, res) => {
    const { listId, cardContent } = req.body;
    db("cards")
        .returning("*")
        .insert({
            listid: listId,
            cardcontent: cardContent,
        })
        .then(list => {
            res.json(list[0])

        })
})

app.post('/loadCurrenteBoard', (req, res) =>{
    const {boardId} =  req.body;
    db.select('*').from('boards')
        .where('boardid', '=', boardId)
        .then(board => {
            res.json(board[0]);
        })
        .catch(function (error) {
            console.log(error)
            res.status(500).json(error)
        });
})


    app.post('/loadCurrentBoardList', (req, res) =>{
        const {boardId} =  req.body;
        db.select('*').from('lists')
            .where('boardid', '=', boardId)
            .then(lists => {
                res.json(lists);
            })
            .catch(function (error) {
                console.log(error)
                res.status(500).json(error)
            });
    })
    
    app.post('/updateBoardTitle', (req,res)=>{
        const {boardId, newTitle} = req.body;
        db('boards')
        .returning("*")
        .where({ boardid: boardId })
        .update({ boardname: newTitle})
        .then(board =>{
                res.json(board[0])
            })
            .catch(error =>{
                res.json(error)
            })
    })

    app.post('/updateListTitle', (req,res) =>{
        const {listId, newTitle} = req.body

        db('lists')
        .returning("*")
        .where({ listid: listId })
        .update({ listtitle: newTitle})
        .then(list =>{
                res.json(list[0])
            })
            .catch(error =>{
                res.json(error)
            })
    })

    app.post('/updateCardContent', (req,res)=>{
        const {cardId, newCardContent} = req.body
        db("cards")
        .returning('*')
        .where({cardid:cardId})
        .update({cardcontent:newCardContent})
        .then(card =>{
            res.json(card[0])
        })
        .catch(error =>{
            res.json(error)
        })
    })

   app.post('/dragCard', (req,res)=>{
       const{cardId, listId} = req.body
       db('cards')
       .returning("*")
       .where({ cardid: cardId })
       .update({ listid: listId})
       .then(card =>{
               res.json(card[0])
           })
           .catch(error =>{
               res.json(error)
           })
   })

   app.post('/deleteList', (req,res)=>{
       const {lisId} = req.body;

       db('lists')
       .where({listid:listId})
       .del()
   })
    
app.listen(process.env.PORT || 3001);

// 1. signin route ---> POST ==  success/fail  
// 2. register route ---> POST = user
// 3. profile/:userid --->  GET = user
// 4. creareBoard route put
// 5. createList route  put
// 6. create card route put



