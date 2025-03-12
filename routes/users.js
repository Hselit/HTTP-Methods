var express = require('express');
var router = express.Router();
const db = require('../mysql');

const app = express();
app.use(express.json());

//get method
router.get('/', function(req, res, next) {
  console.log("inside user route");
  db.query('select * from employee',(err,values)=>{
    if(err){
      res.status(500).send("Error Occured.."+err);
    } else{
      console.log(values);
      res.json(values);
    }
  })
});

//get by id
router.get('/:id',function(req,res,next){
  const userid = req.params.id;
  console.log(userid);

  db.query('select * from employee where id = ?',[userid],(err,value)=>{
    if(err){
      res.status(500).send("Error Occured :"+err);
    } else {
      if(value.length > 0){
        res.json(value[0]);
      } else{
        res.status(400).send("User Not Found..");
      }
    }
  });
});

//post method
router.post('/',function(req,res,next){
  console.log(req.body);
  const {name,age,role} = req.body;
  console.log(name);
  if(!name || !age || !role){
    return res.status(400).json({message:"All fields are required",type:"error"});
  }

  const sql = 'INSERT INTO employee (name,age,role) VALUES (?,?,?);';
  const value = [name,age,role];
  db.query(sql,value,(err,result)=>{
    if(err){
      res.status(500).send("Error Occured: "+err);
    }else{
      res.status(201).json({"message":"User Created","id":result.insertId});
    }
  });

});

//put method
router.put('/:id',function(req,res,next){
  const empid = req.params.id;
  const {name,age,role} = req.body;

  const sql = "update employee set name = ?, age = ?, role = ? where id = ?";
  const searchsql = "select id from employee where id = ?";
  db.query(searchsql,[empid],(err,value)=>{
     if(err){
      return res.status(400).json({message:"No Employee found with this Id :"+empid});
     } 
     if(value.length > 0){
      const v = [name,age,role,empid];
      db.query(sql,v,(err,result)=>{
        if(err){
          res.status(500).json({message:"error occured :"+err});
        }else if(result.affectedRows === 0){
          res.status(400).json({message:"Employee Not Found"});
        } else{
          res.status(200).json({message:"Employee Details Updated.."});
        }
      });
     }
     else{
      return res.status(400).json({message:"No Employee found with this Id :"+empid});
     }
    });
});

router.patch('/:id',function(req,res,next){
  const id = req.params.id;
  const {name,age,role} = req.body;

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
});


//delete method
router.delete('/:id',function(req,res,next){
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
});


module.exports = router;