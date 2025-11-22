import jwt from 'jsonwebtoken'
const TOKEN_KEY = process.env.TOKEN_KEY;

const verifyToken = async (req, res, next) => {

    if (!req.cookies.user_token) {
        return res.status(203).json({"message": "You are not logged in"});
    }
    try {
        const final_token = req.cookies.user_token;
        let token = null;
        if (typeof (final_token) == "string") {
            token = final_token
        } else {
            token = final_token.token
        }
        var verified_user_id = null;
        const verified = jwt.verify(token, TOKEN_KEY, async (err, decoded) => {
            if (err) {
                if (err.name == "TokenExpiredError") {
                    res.clearCookie("user_token");
                    return res.status(203).json({
                        success: 0,
                        error: "Your session was timeout. Please login again",
                    });
                }
            } else {
                if (decoded.token_last == true) {
                    return res.status(203).json({
                        success: 0,
                        message: "Internal Server Error"
                    });
                }

                verified_user_id = decoded.email;
                console.log("Verified User ID: ", verified_user_id, ".....", req.body.email);
                if(req.body.email&&(req.body.email!=verified_user_id)){
                    return res.status(203).json({
                        success: 0,
                        message: "Bad request made"
                    });
                }
            }
            console.log("Token Verification ended.....")
            next()
        });
    } catch (error) {
        console.log(error)
        return res.status(203).json({
            success: 0,
            error: "Invalid Token",
        });
    }
};

export default verifyToken;