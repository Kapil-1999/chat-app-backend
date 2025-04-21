import validator from "validator"
import userModel from "../model/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const register = async(req , res) => {
    try {
        const {name , email ,password} = req.body;
        if(!name || !email || !password) {
            return res.status(400).json({
                success : false,
                message : 'Something is missing'
            })
        };

        if(!validator.isEmail(email)) {
            return res.status(400).json({
                success : false,
                message : 'Please enter a valid email'
            })
        };
        let exist  = await userModel.findOne({email});
        if(exist) {
            return res.status(400).json({
                success : false,
                message : 'User Already exist'
            })
        }else {
            let salt = await bcrypt.genSalt(10);
            let hashpwd = await bcrypt.hash(password , salt);
            
          let newuser=   await new userModel({
                name : name,
                email : email,
                password : hashpwd
            });
            newuser.save()

            return res.status(200).json({
                success : true,
                message : "User Register successfully"
            })
        }

    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            success: false,
             message : "Intenal server error"
        })
    }
};

const Login = async(req , res) => {
    try  {
        const { email , password} = req.body;
        if(!validator.isEmail(email)) {
            return res.status(400).json({
                success : false,
                message : "Please enter valid email"
            })
        };

        let exist = await userModel.findOne({email});
        if(!exist) {
            return res.status(404).json ({
                 success : false,
                message : "User doen't exist"
            })
        }

        let checkPwd = await bcrypt.compare(password , exist.password);
        if(!checkPwd) {
            return res.status(400).json({
                message :'Password does not match',
                success : false
            }) 
        } 
        let token =  createToken(exist._id);
        return res.status(200).json({
            success : false,
            message : 'User Login Successfully',
            user : {
                name : exist.name,
                email : exist.email,
                token : token
            }
            
        });     


    } catch(err) {
        console.log(err);
        res.status(500).json({
            success : false,
            message : "Internal server error"
        })
        
    }
}

const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET)
}

export {register , Login}