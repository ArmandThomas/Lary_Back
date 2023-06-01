const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const {verifyJwtToken, generateJwtToken} = require('../../db/jwt/index');

const regexMotDePasse = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;

const User = require('../../db/models/User');

router.post('/login', async (req, res) => {

    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json({message: "Veuillez renseigner tous les champs"});
    }
    const hashPassword = crypto.createHash('sha256').update(password).digest('hex');

    User.findOne({email: email, password: hashPassword})
        .then(user => {
            const token = generateJwtToken(user._id);
            if (!token) {
                return res.status(400).json({message: "Erreur lors de la connexion"});
            }
            res.json({jwt : token});
        })
        .catch(err => res.status(400).json({message: "Erreur lors de la connexion"}));

});
router.post('/register', async (req, res) => {

    if (!req.body.email || !req.body.password || !req.body.confirmPassword) {
        return res.status(400).json({message: "Veuillez renseigner tous les champs"});
    }

    if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({message: "Les mots de passe ne correspondent pas"});
    }

    const user = await User.find({email: req.body.email});
    const regexMotDePasse = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;

    if (!regexMotDePasse.test(req.body.password)) {
        return res.status(400).json({message: "Your password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character"});
    }

    if (user.length > 0) {
        return res.status(400).json({message: "Email déjà utilisé"});
    }

    const hashPassword = crypto.createHash('sha256').update(req.body.password).digest('hex');
    delete req.body.confirmPassword;

    User.create({...req.body, password: hashPassword})
        .then(user => {
            const token = generateJwtToken(user._id);
            if (!token) {
                return res.status(400).json({message: "Erreur lors de la connexion"});
            }
            res.json({jwt : token});
        })
        .catch(err => {
            return res.status(400).json({message: "Erreur lors de l'ajout de l'utilisateur"});
        });


});

router.get('/me', async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = verifyJwtToken(token);
    if (!decodedToken) {
        return res.status(400).json({message: "Jwt invalide"});
    } else {
        User.findById(decodedToken.id, {password: 0})
            .then(user => {
                if (!user) {
                    return res.status(400).json({message: "Utilisateur introuvable"});
                }
                res.json(user);
            })
            .catch(err => res.status(400).json({message: "Utilisateur introuvable"}));
    }
})

module.exports = router;