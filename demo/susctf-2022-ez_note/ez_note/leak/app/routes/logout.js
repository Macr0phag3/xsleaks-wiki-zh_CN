const logout = (req,res) =>{
    req.session.user = undefined
    return res.redirect(302, "/signin") // 重定向到登录界面
}

module.exports = logout