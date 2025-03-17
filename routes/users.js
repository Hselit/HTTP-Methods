var express = require('express');
var router = express.Router();
const db = require('../config/mysql');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

//get method
router.get('/', function(req, res) {
  try{
    db.query('select * from employee',(err,values)=>{
      if(err){
        res.status(500).send("Error Occured.."+err);
      } else{
        console.log(values);
        res.json(values);
      }
    });  
  }
  catch(error){
    res.status(500).json({"message":"Internal Server Error "+error});
  }
});


//get by id
router.get('/:id',function(req,res){
  try{
    const userid = req.params.id;
  console.log(userid);
  debugger;

  db.query('select * from employee where id = ?',[userid],(err,value)=>{
    if(err){
      res.status(500).send("Error Occured :"+err);
    } else {
      if(value.length > 0){
        return res.json(value[0]);
      } 
      return res.status(400).send("User Not Found..");
      
    }
  });
  }
  catch(error){
    res.status(500).json({"message":"Error Occured "+error});
  }
  
});


//post method
router.post('/',async function(req,res){
  try{
    const {name,age,role,password} = req.body;

  if(!name || !age || !role || !password){
    return res.status(400).json({message:"All fields are required",type:"error"});
  }
  let salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password,salt);

  const sql = 'INSERT INTO employee (name,age,role,password) VALUES (?,?,?,?);';
  const value = [name,age,role,hashedPassword];
  db.query(sql,value,(err,result)=>{
    if(err){
      res.status(500).send("Error Occured: "+err);
    }else{
      res.status(201).json({"message":"User Created","id":result.insertId});
    }
  });
  }
  catch(error){
    res.status(500).json({"message":"Error Occured "+error})
  }
});


//put method
router.put('/:id',function(req,res){
  try{
    const empid = req.params.id;
  const {name,age,role,password} = req.body;

  if(!name && !age && !role && !password){
    return res.status(400).json({message:"Atleast one field required.."});
  }

  const sql = "update employee set name = ?, age = ?, role = ?,password = ? where id = ?";
  const searchsql = "select id from employee where id = ?";
  db.query(searchsql,[empid],async (err,value)=>{
     if(err){
      return res.status(400).json({message:"No Employee found with this Id :"+empid});
     } 
     if(value.length > 0){
      let salt = await bcrypt.genSalt(10);
      let hashedpass = await bcrypt.hash(salt,password);
      const v = [name,age,role,hashedpass,empid];
      db.query(sql,v,(err,result)=>{
        if(err){
          res.status(500).json({message:"error occured :"+err});
        }else if(result.affectedRows === 0){
          res.status(400).json({"message":"Employee Not Found"});
        } else{
          res.status(200).json({"message":"Employee Details Updated.."});
        }
      });
     }
     else{
      return res.status(400).json({"message":"No Employee found with this Id :"+empid});
     }
    });
  }
  catch(error){
    res.status(500).json({"message":"Error Occured "+error});
  }
});


//patch method
router.patch('/:id',function(req,res){
  try{
    const id = req.params.id;
  const {name,age,role,password} = req.body;

  if(!name && !age && !role){
    return res.status(400).json({message:"Atleast one field required.."});
  }

  const sqlq = [],values = [];
  if(name){
    sqlq.push("name = ?");
    values.push(name);
  }
  if(age){
    sqlq.push("age = ?");
    values.push(age);
  }
  if(role){
    sqlq.push("role = ?");
    values.push(role);
  }

  values.push(id);
  const sql = `update employee set ${sqlq.join(", ")} where id = ?`;
  db.query(sql,values,(err,result)=>{
    if(err){
      res.status(500).json({message:"Error Occured "+err});
    } else if(result.affectedRows === 0){
      res.status(400).json({message:"Employee Not Found"});
    } else {
      res.status(200).json({message:"Data Updated.."});
    }
  });
  }
  catch(error){
    res.status(500).json({"message":"Error Occured:"+error});
  }
  
});


//delete method
router.delete('/:id',function(req,res){
  try{
    const empid = req.params.id;
  const sql = "delete from employee where id = ?"

  db.query(sql,[empid],(err,result)=>{
    if(err){
      res.status(500).json({message:"Error Occured : "+err});
    } else if(result.affectedRows === 0){
      res.status(404).json({message:"No Employee found with this Id : "+empid});
    } else {
      res.status(200).json({message:"Details Deleted"});
    }
  });
  }
  catch(error){
    res.status(500).json({"message":"Error Occured"+error});
  }
  
});


module.exports = router;