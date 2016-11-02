module.exports = function (app) {
  app.get('/', function (req, res, next) {
    res.render('index', {
      title: '首页'
    });
  });
  app.get('/reg', function (req, res, next) {
    res.render('index', {
      title: '首页'
    });
  });
};