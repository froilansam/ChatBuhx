const express = require('express');
const router = express.Router();
const logInRouter = express.Router();
const authMiddleware = require('../auth/middleware');
const db = require('../../lib/database')();


logInRouter.use(authMiddleware.noAuthed);
logInRouter.get('/', (req, res) => {
    console.log('Log In Router');
    res.render('main/views/login', req.query);
})
.post('/', (req, res) => {


    // Change the database name, and the table where you get the user.
    let queryString = `SELECT * FROM users WHERE strEmail = ? AND strPassword = ?;`
    db.query(queryString, [req.body.email, req.body.password], (err, results, fields) => {
        if (err) throw err;
        if (results.length === 0) return res.redirect('/login?incorrect');

        let user = results[0];

        delete user.password;

        req.session.user = user;

        return res.redirect('/index');
    });
})
.post('/register', (req, res) => {
    console.log('----- Account Information -----')
    console.log(req.body)
    console.log('----- Account Information -----')

    // Passing the value to the variable account
    let account = req.body;

    // Inserting Account Information to the Database
    let registerQuery = `INSERT INTO accounts (strAccountUsername, strAccountPassword, strAccountFirstname, strAccountLastName, strAccountEmail) VALUES (?, ?, ?, ?, ?);`
    db.query(registerQuery, [account.username, account.password, account.firstName, account.lastName, account.email], (err, results, field) => {
        if(err){
            console.log(err);
            res.status(200).send({indicator: false});
            res.end();
        }
        else{
            res.status(200).send({indicator: true});
            res.end();            
        }
    })
})
.post('/login/email/availability', (req, res) => {//check if email is existing
			var emailQuery = `SELECT * FROM accounts WHERE strAccountEmail = ?`;
			db.query(emailQuery, [req.body.email], function (err, results, fields) {
				if (err) return console.log(err);
				console.log(results)
				if(results.length > 0){
					console.log('E-mail is Existing')
					res.send({"email": false });
				}
				else{
					console.log('E-mail is Available')
					res.send({"email": true });
				}
			})
		})


router.use(authMiddleware.hasAuth);
router.get('/', (req, res) => {
    console.log('/index directory');
    if (typeof process.env.ENABLE_DATABASE !== 'undefined' && process.env.ENABLE_DATABASE === 'false') {
        /**
         * If the database part is disabled, then pass a blank array to the
         * render function.
         */
        return render([]);
    }
    res.end();
});

exports.index = router;
exports.login = logInRouter;
