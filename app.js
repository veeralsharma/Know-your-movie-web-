//  api key  8f2a7dff
// jshint esversion:6

const express=require('express');
const bodyParser=require('body-parser');
const request=require('request');
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
 const passport = require('passport');
 const passportLocalMongoose= require('passport-local-mongoose');

const app=express();
app.set('view engine', 'ejs');
app.use(express.static("public"));


app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
  secret: 'Our little secret',
  resave: false,
  saveUninitialized: false,
  //cookie: { secure: true }
}));

mongoose.connect("mongodb://localhost:27017/imdbuserDB", {useNewUrlParser:true});

const imdbuserSchema=new mongoose.Schema({
  email:String,
  password:String,
  secret:String,
  googleId:String
});


app.use(passport.initialize());
app.use(passport.session());

imdbuserSchema.plugin(passportLocalMongoose);


const Imdbuser = new mongoose.model("Imdbuser", imdbuserSchema);

passport.use(Imdbuser.createStrategy());

passport.serializeUser(function(imdbuser, done) {
  done(null, imdbuser.id);
});

passport.deserializeUser(function(id, done) {
  Imdbuser.findById(id, function(err, imdbuser) {
    done(err, imdbuser);
  });
});

app.get("/",function(req,res){
  res.render("home");
});
app.get("/register",function(req,res){
  res.render("register");
});
app.get("/login",function(req,res){
  res.render("login");
});

app.get("/use",function(req,res){
  if(req.isAuthenticated()){
    res.render("use");
  }else{
    res.redirect("/login");
  }
});

app.get("/movie",function(req,res){
  res.render("movie");
})


app.post("/use",function(req,res){
  const moviename = req.body.movie;
  console.log(req.user.id);
  var dataurl="http://www.omdbapi.com/?t="+moviename;
  var finalurl=dataurl+"&apikey=8f2a7dff";
  request(finalurl,function(error,response,body){
  var data=JSON.parse(body);
  var title=data.Title;
  var releasedate=data.Released;
  var genre=data.Genre;
  var director=data.Director;
  var rating=data.imdbRating
  var plot=data.Plot;
  var celebs=data.Actors;

res.render("movie",{
Title:title,
Releasedate:releasedate,
Genre:genre,
Director:director,
Rating:rating,
Plot:plot,
Celebs:celebs
});

});
});


app.post("/register",function(req,res){

  Imdbuser.register({username:req.body.username},req.body.password,function(err,imdbuser){
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/use");
      });
    }
  });

});

app.post("/login",function(req,res){

const imdbuser =new Imdbuser({
  username:req.body.username,
  password:req.body.password
});
req.login(imdbuser,function(err){
  if(err){
    console.log(err);
  }else{
    passport.authenticate("local")(req,res,function(){
      res.redirect("/use");
    });
  }
});

});






app.listen(3000,function(){
  console.log("server running at port 3000");
});
