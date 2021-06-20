//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
const _= require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-jugal:jugal369@cluster0.nwkim.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const itemsSchema= new mongoose.Schema({
  name:{
    type: String,
    required: true
  }
});
const Item= mongoose.model("Item", itemsSchema);

const item1= new Item({
  name: "Welcome to your todo list!"
});
const item2= new Item({
  name: "Hit the + button to add a new item"
});
const item3= new Item({
  name: "<- Hit this to delete an item"
});

const defaultItems= [item1,item2,item3];

const listSchema= new mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  items: [itemsSchema]
});

const List= mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({},function(err, foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("item(s) added successfully");
        }
      });
     res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});


app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.newList;

  const item4= new Item({
    name: itemName
  });

   if(listName==="Today"){
    item4.save();
    res.redirect("/");
    console.log("item(s) added successfully");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item4);
      foundList.save();
      res.redirect("/"+listName);
      console.log("item(s) added successfully");
    });
  }

});


app.get("/:customListName", function(req,res){
  const customListName= _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
   if(!err){
    if(!foundList){
      const list2= new List({
        name: customListName,
        items: defaultItems
        });
       list2.save();
       res.redirect("/"+customListName);
     }else{
     res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
     }
   }else{
     console.log(err);
   }
  });

});








app.post("/delete", function(req,res){
  const checkedItemsId= req.body.checkbox;
  const listNameCustom= req.body.listName;

 if(listNameCustom==="Today"){
   Item.findByIdAndRemove(checkedItemsId,function(err){
     if(err){
       console.log(err);
     }else{
       console.log("item(s) deleted successfully");
       res.redirect("/");
     }
   });
 } else {
   List.findOneAndUpdate({name: listNameCustom},{$pull: {items: {_id: checkedItemsId}}}, function(err, foundlist){
     if(err){
       console.log(err);
     } else {
       console.log("item(s) deleted successfully");
       res.redirect("/"+listNameCustom);
     }
   })
 }


});






app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
