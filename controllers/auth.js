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
        const salt = 9;
        const hashedPassword = await Bcrypt.hash(password,salt);

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