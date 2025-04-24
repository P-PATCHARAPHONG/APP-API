const mongoose = require('mongoose');
const User = require('../models/users.model');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getUserFriends = async (req, res) => {
    const userId = req.params.userId;
    try {

        const user = await User.findById(userId).populate('friendList');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.friendList);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getUserProfile = async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await User.findById(userId); // 

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


exports.getAllUsersExceptSelf = async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await User.find({ _id: { $ne: userId } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

exports.getuserByQr = async (req, res) => {
    const userId = req.params.userId;
    const source = req.query.source;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // ✅ ถ้ามาจากภายนอก ให้ redirect ไป Google Drive
        if (source === 'external') {
            return res.redirect('https://drive.google.com/drive/folders/1on42xS4T798GjX9dIwYqEng3jusznthK');
        }

        // ✅ ถ้ามาจากแอป (ไม่ใส่ source หรือ source !== external)
        res.json({
            _id: user._id,
            username: user.username,
            friendname: user.friendname,
            lastname: user.lastname,
            email: user.email,
            phone: user.phone,
            gender: user.gender,
            profileImage: user.profileImage,
            friendList: user.friendList,
        });

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};



exports.addFriend = async (req, res) => {
    const userId = req.params.userId;
    const friendId = req.body.friendId;

    try {
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({ message: 'User not found' });
        }

        //  เพิ่มเพื่อนให้ทั้งสองฝ่าย
        if (!user.friendList.includes(friendId) && !friend.friendList.includes(userId)) {
            user.friendList.push(friendId);
            friend.friendList.push(userId);

            await user.save();
            await friend.save();

            res.status(200).json({ message: 'Added friend successfully' });
        } else {
            return res.status(400).json({ message: 'You have already added this friend.' });
        }

    } catch (err) {
        res.status(500).json({
            message: 'Server error',
            error: err.message,
        });
    }
};
