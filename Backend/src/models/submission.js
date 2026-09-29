const mongoose = require('mongoose');
const Problem = require('./problem');
const Schema = mongoose.Schema;

const submissionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index:true,
    },
    problemId: {
        type: Schema.Types.ObjectId,
        ref: 'problem',
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true,
        enum: ['javascript', 'c++', 'java']
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'accepted', 'wrong', 'error'],
        default: 'pending'
    },
    runtime: {
        type: Number, // milliseconds
        default: 0
    },
    memory: {
        type: Number, // kB
        default: 0
    },
    errorMessage: {
        type: String,
        default: ''
    },
    testCasesPassed: {
        type: Number,
        default: 0
    },
    testCasesTotal: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// we made a compound index 
// userId aur problemId ko humne ascending order m arrange kr diya 
// aur agr humne inhe -1 se asign kra to descending order m arrange krdega
submissionSchema.index({userId:1, problemId:1});

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;