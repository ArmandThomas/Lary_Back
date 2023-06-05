const express = require('express');
const router = express.Router();

const {requiredUserPrivileges} = require("../middlewares");

const Home = require('../../db/models/Home');
const User = require('../../db/models/User');

router.get('/', requiredUserPrivileges, async (req, res) => {

    const home = await Home.findOne({ users: res.locals.user._id }).exec();

    if (home) {
        const userIds = home.users;// Récupère les ID des utilisateurs du foyer
        const waitingListIds = home.waitingList;

        const users = await User.find({ _id: { $in: userIds } }).exec();
        const waitingsUsers = await User.find({ _id: { $in: waitingListIds } }).exec();

        const userEmails = users.map(user => ({ email: user.email, _id: user._id, me : user._id.toString() === res.locals.user._id.toString() }));
        const waitingEmails = waitingsUsers.map(user => ({ email: user.email, _id: user._id }));

        const homeWithUserEmails = {
            ...home.toObject(),
            users: userEmails,
            waitingList: waitingEmails,
            // Ajoutez ici d'autres propriétés de l'objet home que vous souhaitez inclure
        };

        return res.status(200).json(homeWithUserEmails);
    } else {
        return res.status(404).json({ message: 'Aucun foyer trouvé' });
    }

});

router.get("/waiting", requiredUserPrivileges, async (req, res) => {

    const home = await Home.find({waitingList: res.locals.user._id});
    return res.status(200).json(home);

});

router.post('/:id/waiting' , requiredUserPrivileges, async (req, res) => {

    const {accept} = req.body;

    const home = await Home.findById(req.params.id);

    if (!accept) {
        await Home.findByIdAndUpdate(req.params.id, {
            $pull: {waitingList: res.locals.user._id}
        });
        return res.status(200).json({message: "User removed from waiting list"});
    }

    if (!home) {
        return res.status(400).json({message: "Unable to find home"});
    }

    const userInHome = await Home.findOne({users: req.body.user});
    if (userInHome) {
        return res.status(400).json({message: "User already in a home"});
    }

    if (home.users.includes(req.body.user)) {
        return res.status(400).json({message: "User already in home"});
    }

    const listUser = [...home.users, res.locals.user._id.toString()];
    const waitingList = home.waitingList.filter(user => user !== res.locals.user._id.toString());

    await Home.findByIdAndUpdate(req.params.id, {
        users : listUser,
        waitingList : waitingList
    });

    return res.status(200).json({message: "User added to group"})

});

router.post('/', requiredUserPrivileges, async (req, res) => {

    if (!req.body.name) {
        return res.status(400).json({message: "Name is required"});
    }

    const home = await Home.findOne({users: res.locals.user._id});

    if (home) {
        return res.status(400).json({message: "User already has a home"});
    }

    const homeData = {
        name: req.body.name,
        users : [res.locals.user._id],
    }

    await Home.create(homeData);
    return res.status(200).json({message: "Home created"});

});

router.put('/:id', requiredUserPrivileges, async (req, res) => {

    const home = await Home.findById(req.params.id);

    if (!home) {
        return res.status(400).json({message: "Unable to find home"});
    }

    if (!home.users.includes(res.locals.user._id)) {
        return res.status(401).json({message: "Unauthorized"});
    }

    const getUserId = await User.findOne({email: req.body.user});

    if (!getUserId) {
        return res.status(400).json({message: "Unable to find user"});
    }

    const userInHome = await Home.findOne({users: getUserId._id});

    if (userInHome) {
        return res.status(400).json({message: "User already in a home"});
    }

    if (home.users.includes(getUserId._id)) {
        return res.status(400).json({message: "User already in home"});
    }

    await Home.findByIdAndUpdate(req.params.id, {
        name : req.body.name || home.name,
        waitingList : getUserId._id ? [...home.waitingList, getUserId._id] : home.waitingList
    });

    return res.status(200).json({message: "Home updated"});

});

router.post('/:idHome/leave', requiredUserPrivileges, async (req, res) => {

    const home = await Home.findById(req.params.idHome);
    if (!home.users.includes(res.locals.user._id)) {
        return res.status(401).json({message: "Unauthorized"});
    }

    const listUsers = home.users.filter(user => user.toString() !== res.locals.user._id.toString());
    if (listUsers.length === 0) {
        await Home.findByIdAndDelete(req.params.idHome);
        return res.status(200).json({message: "Home deleted"});
    }

    await Home.findByIdAndUpdate(req.params.idHome, {users: listUsers});
    return res.status(200).json({message: "User deleted from home"});

});

router.delete('/:idHome/waiting/:idUser', requiredUserPrivileges, async (req, res) => {

    const home = await Home.findById(req.params.idHome);

    if (!home) {
        return res.status(400).json({message: "Unable to find home"});
    }

    if (!home.users.includes(res.locals.user._id)) {
        return res.status(401).json({message: "Unauthorized"});
    }

    const listUsers = home.waitingList.filter(user => user.toString() !== req.params.idUser.toString());

    await Home.findByIdAndUpdate(req.params.idHome, {waitingList: listUsers});
    return res.status(200).json({message: "User deleted from waiting list"});

});

router.delete('/:idHome/user/:idUser', requiredUserPrivileges, async (req, res) => {

    const home = await Home.findById(req.params.idHome);

    if (!home) {
        return res.status(400).json({message: "Unable to find home"});
    }

    if (!home.users.includes(res.locals.user._id)) {
        return res.status(401).json({message: "Unauthorized"});
    }

    const listUsers = home.users.filter(user => user.toString() !== req.params.idUser.toString());

    if (listUsers.length === 0) {
        await Home.findByIdAndDelete(req.params.idHome);
        return res.status(200).json({message: "Home deleted"});
    }

    await Home.findByIdAndUpdate(req.params.idHome, {users: listUsers});
    return res.status(200).json({message: "User deleted from home"});

});

router.delete('/:id', requiredUserPrivileges, async (req, res) => {

    await Home.findByIdAndDelete(req.params.id);
    return res.status(200).json({message: "Home deleted"});

});

module.exports = router;