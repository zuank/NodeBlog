var crypto = require("crypto");
var User = require("../models/user.js");
var Post = require("../models/post.js");
var multer = require('multer');
var upload = multer({ dest: './public/images' });

module.exports = function(app) {
    app.get('/', function(req, res) {
        var post = new Post();
        post.get(null, function(err, posts) {
            if (err) {
                posts = []
            }
            res.render('index', {
                title: '首页',
                user: req.session.user,
                posts: posts,
                success: req.flash("success").toString(),
                error: req.flash("error").toString()
            });
        });
    });
    app.get("/reg", checkNotLogin);
    app.get('/reg', function(req, res) {
        res.render('reg', {
            title: '注册',
            user: req.session.user,
            success: req.flash("success").toString(),
            error: req.flash("error").toString()
        });
    });
    app.post("/reg", checkNotLogin);
    app.post('/reg', function(req, res) {
        var name = req.body.name,
            password = req.body.password,
            passwordrepeat = req.body.passwordrepeat;

        if (password !== passwordrepeat) {
            req.flash("error", "两次输入密码不一致！");
            return res.redirect("/reg");
        }
        //生成MD5加密
        var md5 = crypto.createHash("md5");
        var password = md5.update(req.body.password).digest("hex");
        var newUser = new User({
            name: req.body.name,
            password: password,
            email: req.body.email
        });
        User.get(newUser.name, function(err, user) {
            if (err) {
                req.flash("error", err)
                return res.redirect("/");
            }
            if (user) {
                req.flash("error", "用户已存在")
                return res.redirect("/reg");
            }
            newUser.save(function(err, user) {
                if (err) {
                    req.flash("error", err);
                    return res.redirect("/reg");
                }
                req.session.user = user;
                req.flash("success", "注册成功!");
                res.redirect("/");
            })
        })
    });
    app.get("/login", checkNotLogin);
    app.get('/login', function(req, res, next) {
        res.render('login', {
            title: '登录',
            user: req.session.user,
            success: req.flash("success").toString(),
            error: req.flash("error").toString()
        });
    });
    app.post("/login", checkNotLogin);
    app.post('/login', function(req, res) {
        var md5 = crypto.createHash("md5");
        var password = md5.update(req.body.password).digest("hex");

        //检测用户是否存在
        User.get(req.body.name, function(err, user) {
            if (!user) {
                req.flash("error", "用户不存在");
                return res.redirect("/login");
            }

            if (user.password != password) {
                req.flash("error", "密码错误！");
                return res.redirect("/login");
            }

            req.session.user = user;
            req.flash("success", "登陆成功");
            return res.redirect("/");
        })
    });
    app.get('/post', function(req, res, next) {
        res.render('post', {
            title: '发表',
            user: req.session.user,
            success: req.flash("success").toString(),
            error: req.flash("error").toString()
        });
    });
    app.post("/post", checkLogin);
    app.post('/post', function(req, res, next) {
        var currentUser = req.session.user;
        var post = new Post(currentUser.name, req.body.title, req.body.post);
        post.save(function(err) {
            if (err) {
                req.flash("error", err);
            }
            req.flash("success", "发表成功");
            res.redirect("/");
        })
    });
    app.get("/logout", checkLogin);
    app.get('/logout', function(req, res, next) {
        req.session.user = null;
        req.flash("success", "登出成功");
        return res.redirect("/");
    });
    app.get("/upload", checkLogin);
    app.get("/upload", function(req, res) {
        res.render("upload", {
            title: "文件上传",
            user: req.session.user,
            success: req.flash("success").toString(),
            error: req.flash("error").toString(),
        })
    });
    app.post("/upload", checkLogin);
    app.post("/upload", upload.array('photos', 5), function(req, res) {
        console.log(req.files)
        req.flash("success", "文件上传成功");
        res.redirect("/upload");
    });
};

function checkLogin(req, res, next) {
    if (!req.session.user) {
        req.flash("error", "用户未登录！");
        res.redirect("/login");
    }
    next();
}

function checkNotLogin(req, res, next) {
    if (req.session.user) {
        req.flash("error", "用户已登录！");
        res.redirect("back");
    }
    next();
}