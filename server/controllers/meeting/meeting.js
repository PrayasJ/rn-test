const MeetingHistory = require('../../model/schema/meeting')
const mongoose = require('mongoose');

const add = async (req, res) => {
    
    try {
        req.body.timestamp = new Date();
        const meeting = new MeetingHistory(req.body);
        await meeting.save();
        res.status(201).json(meeting);
    } catch (err) {
        console.error('Error creating meeting:', err);
        res.status(400).json({ error: 'Failed to create meeting' });
    }
}

const index = async (req, res) => {

    try {
        const query = { ...req.query, deleted: false };

        const meetings = await MeetingHistory.find(query)
            .populate({
                path: 'createBy',
                select: 'firstName lastName',
                model: 'User'
            })
            .populate({
                path: 'attendes',
                select: 'firstName lastName',
                model: 'Contacts'
            })
            .populate({
                path: 'attendesLead',
                select: 'leadName',
                model: 'Leads'
            })
            .exec();

        res.status(200).json(meetings);
    } catch (err) {
        console.error('Error fetching meetings:', err.message || err);
        res.status(500).json({ error: 'Failed to fetch meetings', details: err.message });
    }
}

const view = async (req, res) => {

    try {
        const meeting = await MeetingHistory.findOne({ _id: req.params.id })
        .populate({
            path: 'createBy',
            select: 'firstName lastName',
            model: 'User'
        })
        .populate({
            path: 'attendes',
            select: 'firstName lastName',
            model: 'Contacts'
        })
        .populate({
            path: 'attendesLead',
            select: 'leadName',
            model: 'Leads'
        })
            .exec();

        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        res.status(200).json(meeting);
    } catch (err) {
        console.error('Error fetching meeting details:', err);
        res.status(500).json({ error: 'Failed to fetch meeting details' });
    }
}

const deleteData = async (req, res) => {
    
    try {
        const meeting = await MeetingHistory.findByIdAndUpdate(req.params.id, { deleted: true }, { new: true });
        res.status(200).json({ message: 'Meeting deleted successfully', meeting });
    } catch (err) {
        console.error('Error deleting meeting:', err);
        res.status(500).json({ error: 'Failed to delete meeting' });
    }
}

const deleteMany = async (req, res) => {

    try {
        const result = await MeetingHistory.updateMany({ _id: { $in: req.body } }, { $set: { deleted: true } });
        res.status(200).json({ message: 'Meetings deleted successfully', result });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete meetings' });
    }
}

module.exports = { add, index, view, deleteData, deleteMany }