const mongoose = require("mongoose");
const OTP = require("otp-generator");
const User = require("./models/user");
const Otp = require("./models/OTP");
const Bcrypt = require("bcrypt");

// User will SignUp
exports.signUp = async(req,res) => {
    // now in an order to validate the data we'll be having a try - catch block such that no exception occurs
    try{

        // extracting out the data from the res side
        const {
            userName,
            mailId,
            password,
            confirmPassword,
            dateOfRegistration,
            firstName,
            lastName,
            gender,
            contact,
            profilePic,
            otp,
            accountType,
        } = req.body;

        // now we'll validate that whatsoever we have received are in proper order
        if(!userName || !mailId || !password || !confirmPassword || ! dateOfRegistration || !firstName || !otp){
            return res.status(403).json({
                success : false,
                message : "Please provide all the details that are marked as required!!",
            });
        }

        // now check for the similarity of passwords
        if(password !== confirmPassword){
            return res.status(400).json({
                success : false,
                message : "Password and confirm-password does not match",
            });
        }

        // now we need to check whether the user exists already

        // checking with mailId
        const existingUserMailId = await User.findOne({mailId});
        if(existingUserMailId){
            return res.status(400).json({
                success : false,
                message : "User already existing with current mail Id",
            });
        }

        // checking with userName
        const existingUserName = await User.findOne({userName});
        if(existingUserName){
            return res.status(400).json({
                success : false,
                message : "User already exists with this userName",
            });
        }

        // now before creating the account, the otp provided by the user has to be validated as it is already store in the DB, before sending the mail to the user
        // so we are getting the most latest one, to verfiy
        const getUserOTP = await Otp.find({mailId}).sort({createdAt : -1}).limit(-1);

        // now we need to validate the OTP
        // if the length of the OTP is 0
        if(getUserOTP.length === 0){
            return res.status(400).json({
                success : false,
                message : "No OTP found in database",
            });
        }
        // if the otp enetered does not match with the OTP in database
        if(otp !== getUserOTP[0].otp){
            return res.status(400).json({
                success : false,
                message : "OTP doesn't match",
            });
        }

        // now since everything is validated
        // so we can create a new user account, 

        // but before creating the user account, we have to hash the user password so that no one can read it
        const salt = 9;
        const hashedPassword = await Bcrypt.hash(password,salt);

        // now looking onto the accountType
        
        if(accountType === null){
            accountType = 'user';
        }

        // now since this things are done
        // we'll save the data of user in DB

        // need to work from here
        const UserCreated = await User.create({
            userName,
            mailAddress : mailId,
            password : hashedPassword,
            dateOfRegistration,
            firstName,

        });


    }catch(error){

    }
}