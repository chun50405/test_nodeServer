const sequelize_fixtures = require('sequelize-fixtures');
const models = require('./models');


// //from file
// sequelize_fixtures.loadFile('fixtures/test_data.json', models).then(function(){
//     doStuffAfterLoad();
// });
//
// //can use glob syntax to select multiple files
// sequelize_fixtures.loadFile('fixtures/*.json', models).then(function(){
//     doStuffAfterLoad();
// });
//
// //array of files
// sequelize_fixtures.loadFiles(['fixtures/users.json', 'fixtures/data*.json'], models).then(function(){
//     doStuffAfterLoad();
// });



const fixtures = [
  {model: 'user', data: {account: 'test1', password: 'test1'}},
  {model: 'user', data: {account: 'test2', password: 'test2'}},
  {model: 'user', data: {account: 'test3', password: 'test3'}},
]


sequelize_fixtures.loadFixtures(fixtures, models).then(function(){
    console.log('InitData Done!!');
});
