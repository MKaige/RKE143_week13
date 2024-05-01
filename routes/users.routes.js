const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const verifyToken = require('../utilities/vertification');
const { error } = require('console');
const router = express.Router();

router.get('/secret', (req, res)=> {
    jwt.verify(req.token, process.env.SECRET_KEY, (error, authData) =>{
        if(error) {
            res.sendStatus(403);
        } else {
            res.status(200).json({
                message: 'My secret',
                access: 'Access granted',
                authData: authData
            });
        }
    });
});

router.post('/signin', verifyToken, async (req, res) =>{
    const {username, password} = req.body;

    try {
        const data = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = data.rows;

        if(user.length === 0){
            res.status(400).json({error: 'Username not found. Please sign up first.'});
        } else{
            bcrypt.compare(password, user[0].password, (error, result) =>{
                if(error){
                    res.status(500).json({
                        error:'Server error.'
                    });
                } else if (result) {

                    const myUser = {
                        username: username
                    }

                    jwt.sign({user: myUser}, process.env.SECRET_KEY, (error, token) => {
                        if(error) {
                            res.send(500).json({error: 'Token failed.'});
                        } else {
                            res.status(200).json({
                                message: "User signed in.",
                                token: token
                            });
                        }
                    });
                    
                } else {
                    res.status(400).json({
                        error: "Signin failed."
                    })
                }
            });
        }

    } catch (error) {
        console.log(error);
    }
    

});

router.post('/signup', async (req, res) => {
    const {username, password} = req.body;
    
    const data = await db.query('SELECT * FROM users WHERE username = $1', [username]);

    if(data.rows.length != 0) {
        res.status(400).json({
            error: 'Username already taken.'
        });
    } else {
        bcrypt.hash(password, 10, (error, hash) =>{
            if(error) {
                res.status(error).json(
                    {error: 'Server error'}
                );
            } 

            const user = {
                username: username,
                password: hash
            };

            try{
                db.query('INSERT INTO users (username, password) VALUES ($1, $2)', [user.username, user.password]);
                res.status(200).json({message: 'User added to database.'});
            } catch(error) {
                res.status(500).json({
                    error: "Database error."
                });
            }
        });
    }

});


module.exports = router;