// importing express package using require
const fs = require('fs');
const path = require('path');
const express = require('express');

const { animals} = require('./data/animals.json');

const PORT = process.env.PORT ||3001;
const app = express();

//  parse incoming sting or array data
app.use(express.urlencoded({ extended: true }));
// parse incoming JSON data
app.use(express.json());

// creating a function called filterByQuery() to handle different kinda query
//  we will start extracting data after ?
// This function will take in req.query as an argument and filter through animals array and create a new array.
function filterByQuery(query, animalsArray) {
  let personalityTraitsArray = [];
  // Note that we save the animalsArray as filteredResults here:
  let filteredResults = animalsArray;
  if (query.personalityTraits) {
    // Save personalityTraits as a dedicated array.
    // If personalityTraits is a string, place it into a new array and save.
    if (typeof query.personalityTraits === "string") {
      personalityTraitsArray = [query.personalityTraits];
    } else {
      personalityTraitsArray = query.personalityTraits;
    }
    // Loop through each trait in the personalityTraits array:
    personalityTraitsArray.forEach((trait) => {
      // Check the trait against each animal in the filteredResults array.
      // Remember, it is initially a copy of the animalsArray,
      // but here we're updating it for each trait in the .forEach() loop.
      // For each trait being targeted by the filter, the filteredResults
      // array will then contain only the entries that contain the trait,
      // so at the end we'll have an array of animals that have every one
      // of the traits when the .forEach() loop is finished.
      filteredResults = filteredResults.filter(
        (animal) => animal.personalityTraits.indexOf(trait) !== -1
      );
    });
  }
  if (query.diet) {
    filteredResults = filteredResults.filter(
      (animal) => animal.diet === query.diet
    );
  }
  if (query.species) {
    filteredResults = filteredResults.filter(
      (animal) => animal.species === query.species
    );
  }
  if (query.name) {
    filteredResults = filteredResults.filter(
      (animal) => animal.name === query.name
    );
  }
  // return the filtered results:
  return filteredResults;
}

// add route 
app.get('/api/animals',(req,res)=>{
    // add query property on the req object
    let results = animals;
    if(req.query){
        results = filterByQuery(req.query,results);
    }
    
    res.json(results);

});

// create another get route for animals
app.get('/api/animals/:id',(req,res)=>{
  const result =findById(req.params.id,animals);
  if(result){
     res.json(result);
  }else{
    res.json(404);
  }
  res.json(result);
});

function findById(id,animalsArray){
  const result = animalsArray.filter(animal => animal.id ===id)[0];
  return result;
}
// Adding post method to make this app interactive with user
// this will allow us to crate a route that listen to the post request

app.post("/api/animals", (req, res) => {
  // set id based on what the next index of the array will be
  req.body.id = animals.length.toString();

  // if any data in req.body is incorrect, send 400 error back
  if (!validateAnimal(req.body)) {
    res.status(400).send("The animal is not properly formatted.");
  } else {
    const animal = createNewAnimal(req.body, animals);
    res.json(animal);
  }
});
// creating a function to handle animal creation
function createNewAnimal(body, animalsArray){

const animal =body;
animalsArray.push(animal);

fs.writeFileSync(
  path.join(__dirname,'./data/animals.json'),
  JSON.stringify({animals:animalsArray},null,2)
);

return animal;

}
// Adding function for validation
function validateAnimal(animal) {
  if (!animal.name || typeof animal.name !== "string") {
    return false;
  }
  if (!animal.species || typeof animal.species !== "string") {
    return false;
  }
  if (!animal.diet || typeof animal.diet !== "string") {
    return false;
  }
  if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
    return false;
  }
  return true;
}





//Adding listen method to the server to listen request 
app.listen(PORT,()=>{
    console.log(`API server now on port ${PORT}`);
});

