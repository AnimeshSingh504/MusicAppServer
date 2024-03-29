const mongoose = require("mongoose");
const OTP = require("otp-generator");
const User = require("./models/user");
const Otp = require("./models/OTP");
const Bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

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
        const hashedPassword = await Bcrypt.hash(password,process.env.SALT);

        // now looking onto the accountType
        
        if(accountType === null){
            accountType = 'user';
        }

        // checking for the user profile Picture
        if(profilePic === null){
            profilePic = `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}${lastName}`;
        }

        // now since this things are done
        // we'll save the data of user in DB

        // creating the user and saving the data in the DB
        const UserCreated = await User.create({
            userName,
            mailAddress : mailId,
            password : hashedPassword,
            dateOfRegistration,
            firstName,
            lastName,
            gender,
            contactNumber : contact,
            profilePicture : profilePic,
            accountType
        });

        // now we need to send the mail to the user to tell, about successful registration
        // TODO

        // now after the user is created, we return the response to the user
        return res.status(200).json({
            success : true,
            message : "User registered successfully",
            User,
        });

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message : "Something went wrong while registering the User",
        });
    }
}


// User will signin
exports.signIn = async(req,res) => {

    try{
        // here user can provide the userName or mailId for the login
        let {
            mailId,
            password
        } = req.body;

        // now we'll check for the the inavailabilty of the user credientials received
        if(!mailId || !password){
            return res.status(400).json({
                success : false,
                message : "Please provide the credientials",
            });
        }
        
        // now if the credientials are properly available

        // then we'll find out whether the user exists or not 

        const existingUser = await User.findOne({mailId});

        // if there is not user with the mail Id
        if(!existingUser){
            return res.status(401).json({
                success : false,
                message : "User with this mail ID doesn't exist",
            });
        }

        // if the user exists
        // then we'll compare the password, by again hashing it
        if(Bcrypt.compare(password, existingUser.password)){

            // now we are creating the payload, that we'll be sending over to the user over http at frontend
            const payload = {
                email : existingUser.mailId,
                accountType : existingUser.accountType,
                userId : existingUser._id,
            };

            // now we need to create the token, so we need jwt token
            const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
                expiresIn : '24h',
            });

            // now since we created the token, so we'll set the token into the user Schema
            existingUser.token = token;
            await existingUser.save();

            // creating the options for the cookie
            const options = {
                expiresIn : new Date(Date.now() + 3*24*60*60*1000),
                httpOnly : true,
            }

            // now we'll create the cookie, for the seamless authorization and returning it in respose
            res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                existingUser,
                message : "User Logged In Successfully",
            });
        }
        else{
            return res.status(401).json({
                success : false,
                message : "Password Incorrect",
            });
        }

    }catch(error){
        console.log(error);
        return res.status(501).json({
            success : false,
            message : "Something went wrong while sign in",
        });
    }
}

// change password

exports.changePassword = async(req,res) => {

    try{

        const userId = req.user.id;
        
        // fetch the password, old, new and confirm passwords

        const {
            oldPassword,
            newPassword,
            confirmNewPassword
        } = req.body;

        if(!oldPassword || !newPassword || !confirmPassword){
            return res.status(400).json({
                success : false,
                message : "Please provide all the details",
            });
        }

        // now making the DB call to fetch out the password
        const userDetails = await User.findById(userId);

        // now since we have got all the passwords, so we'll compare the old
        // password and the password that is saved in the DB

        const samePassword = await Bcrypt.compare(oldPassword, userDetails.password);

        if(!samePassword){
            return res.status(400).json({
                success : false,
                message : "Old Password is incorrect",
            });
        }

        // now since the data is successfully fetched and the old password is also correct

        // so now we'll check out the new and confirm new password

        if(newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success : false,
                message : "New Password and Confirm New Password doesn't match",
            });
        }

        // now since everything matches
        // so we'll make the hash out of the new password

        const hashedPassword = await Bcrypt.hash(newPassword,process.env.SALT);
        // now updated the userdetails

        const updatedUserDetails = await User.findByIdAndUpdate(req.user.id, {password : hashedPassword}, {new : true});
        
        // now we'll send the mail to the user, regarding successfull change of password
        // TODO

        return res.status(200).json({
            success : true,
            message : "Password Updated Successfully",
        });

    }catch(error){
        console.log(error);
        return res.status(402).json({
            success : false,
            message : "Something went wrong while changing password",
            error : error.message,
        });
    }

}

// send OTP controller

exports.sendOTP = async(req,res) => {

    try{

        // so we'll get the mailID from the req.body

        const {mailId} = req.body;

        if(!mailId){
            return res.status(400).json({
                success : false,
                message : "Please provide the mail ID",
            });
        }

        // now check whether the mail Id is already registered

        const existingUser = await User.findOne({mailAddress : mailId});

        if(existingUser){
            return res.status(403).json({
                success : false,
                message : "User already registred with this mail",
            });
        }

        // if everything is fine, no existing user, and perfect mail ID, then
        // proceed further to send OTP

        let otp = await OTP.generate(process.env.OTP_LENGTH, process.env.OTP_CONFIG);

        // now since OTP has been generated
        // we have to check out whether at that, current instance of OTP is it saved in the DB or not

        const otpExists = await Otp.findOne({otp : otp});

        // now we'll check and try to generate the otp if the current generated otp is 
        // already in the system

        while(otpExists){
            otp = await OTP.generate(process.env.OTP_LENGTH, process.env.OTP_CONFIG);

            otpExists = await  Otp.findOne({otp: otp});
        }

        // when at the particular instance the otp is unique, the set the otp and send it
        // to the user for the authentication from the user side

        const otpPayload = {mailId, otp};

        // now to save the otp into the Db to make it persist
        const newOtp = await OTP.create(otpPayload);

        // now we need to return the res to the user

        return res.status(200).json({
            success : true,
            message : "OTP sent successfully",
            otp,
        });

        // [TODO] :  We need to check about the sending of OTP
        
    }catch(error){
        return res.status(402).json({
            success : false,
            message : "Something went wrong while sending OTP",
            error : error.message,
        })
    }
}