const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require('express-session');


app.use('/styles', express.static('styles'));
app.use('/resources',express.static('resources'));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
mongoose
  .connect(
    'mongodb+srv://sharulhn43:Sharulhn43@cluster0.13wiqxv.mongodb.net/hospital?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then((x) => {
    console.log('connected to mongodb:',x.connections[0].name);
  }).catch((err)=>{
    console.log("error conecting to mongo",err);
  });

  const booking_schema = new mongoose.Schema({
    fname : String,
    lname : String,
    contact : String,
    app_date : String,
    department : String,
    email : String,
    time_slot : String,
    branch : String,
})
  
const sign_up_schema = new mongoose.Schema({
    firname : String,
    lasname: String,
    email : String,
    password : String,
})

const login_schema = new mongoose.Schema({
    email : String,
    password : String,
})

const review_schema = new mongoose.Schema({
    name : String,
    email : String,
    number : String,
    feedback : String,
})


  
  const booking = mongoose.model("booking", booking_schema);
  const user = mongoose.model("user", login_schema);
  const signup = mongoose.model("signup",sign_up_schema);
  const review = mongoose.model("review",review_schema);

  
  
  app.use(express.urlencoded({ extended: true }));
  
  app.get("/", function (req, res) {
    res.sendFile(__dirname + "/home.html");
  });
  
  app.get("/index",function(req,res){
    res.sendFile(__dirname + "/index.html");
  });

  app.get("/book",function(req,res){
    if(req.session.user){
      res.sendFile(__dirname + "/book.html");
    }
    else{
      res.redirect("/login");
    }
  });


  
  app.get("/login",function(req,res){
    if(req.session.user){
      res.redirect("/book");
    }
    else{
      res.sendFile(__dirname + "/index.html");
    }
  });

  app.post("/login",(req,res)=>{
    const email=req.body.email;
    const password=req.body.password;
    console.log(email);
    signup.findOne({email:`${email}`,password:`${password}`})
      .then((usr)=>{
        if(usr){
          console.log(usr.email);
          let new_user = new user({
            email:email,
            password:password
          });
        
          new_user.save();
          req.session.user=usr.email;
          res.redirect("/book");
        }
        else{
          res.redirect("/book");
        }
      })
      .catch((err)=>{
        console.log(err);
      });

        
        
  });
  
  app.get("/book", function (req, res) {
    res.sendFile(__dirname + "/book.html");
  });

  app.get("/home", function (req, res) {
    res.sendFile(__dirname + "/home.html");
  });

  app.post("/book",(req,res)=>{
    let new_booking = new booking({
      fname:req.body.fname,
      lname:req.body.lname,
      contact:req.body.contact,
      app_date:req.body.appointment_date,
      department:req.body.department,
      email:req.body.email,
      time_slot:req.body.time,
      branch:req.body.branch
    });
  
    new_booking.save();
    res.write("<h1>booking successfull</h1>")
  });

  app.post("/signup",(req,res)=>{
    let new_signup = new signup({
      username:req.body.name,
      email:req.body.email,
      password:req.body.password,
    });
  
    new_signup.save();
        console.log("User saved successfully!");
        req.session.user=req.body.email;
        res.redirect("/book");
  });


  async function getItems(user) {
    if(user){
    const Items = await booking.find({email:user});
    return Items;}
    else{
      const Items = await booking.find({});
    return Items;
    }
  }

  async function getReview(user) {
    if(user){
    const Items = await review.find({email:user});
    return Items;}
    else{
      const Items = await review.find({});
    return Items;
    }
  }

  app.post("/fetchDetails", function (req, res) {
    console.log("working");
    res.write("<h1> bookings of : "+req.session.user+"</h1>");
    getItems(req.session.user).then(function (FoundItems) {
      for (const ele of FoundItems) {
        res.write('<html>'+'<head> <style>'+'body{background-color: gainsboro;font-size:1.5rem;display: flex;align-items: center;flex-flow: column nowrap;}.card{border: 3px solid black;border-radius: 1rem;width:50%;padding:2rem;margin:1rem;text-align:center;}'+'</style></head>'+'<body>'+'<section class="card">'+'<span>User name : </span>'+ele.fname+'<br>'+'<span>Department name : </span>'+ele.department+'<br>'+'<span>Branch : </span>'+ele.branch+'<br>'+'<span>Date : '+ele.app_date+'<br>'+'<span>Time-slot : </span>'+ele.time_slot+'<br>'+'</section>'+'</body>'+'</html>');
              }
              res.send();
            });
            
  });

  app.post("/enterFeedback",(req,res)=>{
    let new_feedback = new review({
      name:req.body.name,
      email:req.body.email,
      number:req.body.number,
      feedback:req.body.message
    });
  
    new_feedback.save();
    res.write("<h1>feedback successfully saved</h1>")
  });

  app.get("/delete",(req,res)=>{
        booking.deleteOne({_id:req.query.id})
          .then(()=>{
            console.log('deleted');
            res.send('deleted');
          })
          .catch((err)=>{
            console.log(err);
          })
    });

    app.post("/review", function (req, res) {
      console.log("working");
      res.write("<h1> review of user </h1>");
      getReview().then(function (FoundItems) {
        for (const ele of FoundItems) {
                    res.write("<h1>Review </h1>");
                    res.write("<h4> id: " + ele._id + "</h4>");
                    res.write("<h4> name: " + ele.name + "</h4>");
                    res.write("<h4> review: " + ele.review + "</h4>");
                }
                res.send();
              });
              
    });

  app.listen(3002, function () {
    console.log("Server is running on port:", 3002);
  });
