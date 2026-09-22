const mongoose = require('mongoose');
const Problem = require('./problem');
const Schema = mongoose.Schema;

const submissionSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ProblemId:{
         type:Schema.Types.ObjectId,
         ref: 'Problem',
         required: true
    },
    code: {
         type:String,
        required: true
    },
      language: {
         type:String,
        required: true,
        enum:['javascript','cpp','java']
    },
    language: {
         type:String,
        required: true,
        enum:['pending','accepted','wrong','error'],
        default: 'pending'
    },
    runtime:{
        type: Number, // miliseconds
        default: 0
    },
     memory:{
        type: Number, // kB
        default: 0
    },
     errorMessage:{
        type: String, // miliseconds
        default: ''
    },
     testCasesPassed:{
        type: Number,
        default: 0
    },
     testCasesTotal:{
        type: Number,
        default: 0
    }
}, {
    timestamps: true

});