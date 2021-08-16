const ResetPassword = require("../../../Models/ResetPassword");
const ResetPassObserver = require("../../../Observers/ResetPassObserver");
const User = require("../../../Models/User");
const Controller = require("../Controller");

class ResetPassController
{
    /**
     * Handling some operation before reset password 
     * 
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    static async preResetPassword (req, res)  
    {
        try {
            
            let user = await User.findByEmail(req.body.email)

            if (!isNaN(user[0])) return Controller.notFoundResource(res)
    
            let pincode = Math.floor(Math.random() * 999999) + 100000;
    
            ResetPassword.create({user_id : user[0][0].id, pincode})

            ResetPassObserver.index({user:user[0][0], pincode})

            return res.status(200).json({
                success : true,
                payload : "Check Your Email"
            })

        } catch (error) {
            return Controller.queryError(res, error)
        }
    }

    /**
     * Make sure pincode is correct 
     * 
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    static confirmPincode (req, res)
    {
        try {

            let resetpassRow = ResetPassword.findeByPincode(req.body.pincode)

            if (!isNaN(resetpassRow[0])) return Controller.notFoundResource(res)

            return res.status(200).json({
                success : true,
                payload : "Proceed to the next process"
            })

        } catch (error) {
            return Controller.queryError(res, error)
        }
    }

    /**
     * Reset Password 
     * Make sure pincode is correct and update password
     * 
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    static async resetPassword (req, res)
    {
        try {

            // Check Pincode 
            let resetpassRow = await ResetPassword.findeByPincode(req.body.pincode)

            if (!isNaN(resetpassRow[0])) return Controller.notFoundResource(res)

            // Change password 
            User.updatePassword(resetpassRow[0][0].user_id, req.body)

            return res.status(200).json({
                success : true,
            })

        } catch (error) {
            return Controller.queryError(res, error)
        }
    }
}

module.exports = ResetPassController