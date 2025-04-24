const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Group = require('../models/group.model');
const mongoose = require('mongoose');

exports.getAllGroups = async (req, res) => {
  try {
    const Groups = await Group.find();
    res.json(Groups);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getGroupsByUserId = async (req, res) => {
  const { userId } = req.params;
  console.log('User ID:', userId);
  

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const groups = await Group.find({ members: userId }); // ✅ ไม่ต้องแปลง ObjectId

    if (!groups.length) {
      return res.status(404).json({ message: 'No groups found for this user' });
    }

    return res.status(200).json(groups);
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};



exports.getGroupMembers = async (req, res) => {
  const { groupId } = req.params;
  console.log('Group ID:', groupId);

  if (!groupId) {
    return res.status(400).json({ message: 'Group ID is required' });
  }

  try {
    const group = await Group.findById(groupId).populate('members'); // <== make sure 'members' is ref: 'User'
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    return res.status(200).json(group.members);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

exports.addMembersToGroup = async (req, res) => {
  const { groupId } = req.params;
  const { members } = req.body;

  if (!groupId || !Array.isArray(members)) {
    return res.status(400).json({ message: 'Group ID and members array required' });
  }

  try {
    const updated = await Group.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: { $each: members } } }, // ✅ เพิ่มไม่ซ้ำ
      { new: true }
    ).populate('members');

    if (!updated) {
      return res.status(404).json({ message: 'Group not found' });
    }

    return res.status(200).json({
      message: 'Members added successfully',
      group: updated
    });
  } catch (err) {
    console.error('Error adding members:', err.message);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.removeMemberFromGroup = async (req, res) => {
  const { groupId, memberId } = req.params;

  if (!groupId || !memberId) {
    return res.status(400).json({ message: 'Group ID and Member ID are required' });
  }

  try {
    const group = await Group.findByIdAndUpdate(
      groupId,
      { $pull: { members: memberId } },
      { new: true }
    ).populate('members');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    return res.status(200).json({
      message: 'Member removed successfully',
      group,
    });
  } catch (err) {
    console.error('Error removing member:', err.message);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};



exports.clearNotifyCount = async (req, res) => {
  const { userId, groupId } = req.params;

  try {
    const updated = await Group.updateOne(
      { _id: groupId },
      { $set: { [`notifyPerUser.${userId}`]: 0 } }
    );

    return res.status(200).json({
      message: 'Notify count cleared for user in specific group',
      result: updated,
    });
  } catch (err) {
    console.error('❌ Error during notify clear:', err.message);
    return res.status(500).json({
      message: 'Error clearing notify count',
      error: err.message,
    });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const body = JSON.parse(JSON.stringify(req.body)); // fix prototype issue
    const { name, company } = body;
    const members = body.members;

    console.log('📦 Body:', body);

    if (!name || !company || !members) {
      return res.status(400).json({ message: 'Name, company, and members are required' });
    }

    const memberIdsRaw = JSON.parse(members);
    const memberIds = memberIdsRaw.map(id => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`❌ Invalid ObjectId: ${id}`);
      }
      return new mongoose.Types.ObjectId(id);
    });

    const imagePath = req.file ? `/uploads/${req.uploadFolder}/${req.file.filename}` : '';

    const newGroup = new Group({
      name,
      company,
      members: [...memberIds, req.userId], // ✅ ใส่ผู้สร้างลงท้าย
      image: imagePath,
      createdBy: req.userId || null,
    });

    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (err) {
    console.error('🔥 Error creating group:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
