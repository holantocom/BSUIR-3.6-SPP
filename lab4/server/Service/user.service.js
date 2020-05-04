const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const User = mongoose.model("User");

class UserService {
    constructor()
    {
        this._passwordSalt = 8;
    }

    async getUser(login, password) {
        let user = await User.findOne({ login: login });
        if (user) {
            let passwordIsValid = bcrypt.compareSync(password, user.password);
            if (!passwordIsValid) {
                return undefined;
            }

            return {
                _id: user.id,
                login: user.login,
                password: user.password
            };
        }

        return undefined;
    }

    async getUserById(userId) {
        return await User.findById(userId);
    }

    async addUser(user) {
        let matchUser = await User.findOne({ login: user.login });
        if (!matchUser) {
            user.password = bcrypt.hashSync(user.password, this._passwordSalt);
            user._id = new mongoose.Types.ObjectId();
            const newUser = new User(user);
            await newUser.save();
            return {
                _id: newUser.id,
                login: newUser.login,
                password: newUser.password
            };
        }

        return undefined;
    }
}

module.exports = UserService;