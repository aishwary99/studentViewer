const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = 5000;
const mysql = require("mysql2");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var connection = null;
connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "admin",
  database: "studentsdb",
});
connection.connect(function (error) {
  if (error) throw error;
  console.log("Connection established with mysql");
});
app.listen(port, (error) => {
  if (error) throw error;
  console.log("Server is listening on port : " + port);
});
class PlacementTimeline {
  constructor(date, studentsCount) {
    this.date = date;
    this.studentsCount = studentsCount;
  }
  getDate() {
    return this.date;
  }
  getStudentsCount() {
    return this.studentsCount;
  }
}
class Student {
  constructor(code, name, company, joiningDate, img) {
    this.code = code;
    this.name = name;
    this.company = company;
    this.joiningDate = joiningDate;
    this.img = img;
  }
  getCode() {
    return this.code;
  }
  getName() {
    return this.name;
  }
  getCompany() {
    return this.company;
  }
  getJoiningDate() {
    return this.joiningDate;
  }
  getImage() {
    return this.img;
  }
}
app.get("/getPlacementTimelines", (request, response) => {
  var sqlQuery = `select count(*) as studentsCount , DATE_FORMAT(joining_date,"%M %Y") as joiningDate from placementsTwo group by(joiningDate) order by joiningDate;`;
  var responseJSON = {};
  connection.query(sqlQuery, (error, resultSet) => {
    if (error) {
      responseJSON.success = false;
      responseJSON.exception = error;
      response.send(responseJSON);
      return;
    }
    const timelines = [];
    resultSet.forEach((timeline) => {
      timelines.push(
        new PlacementTimeline(timeline.joiningDate, timeline.studentsCount)
      );
    });
    responseJSON.success = true;
    responseJSON.timelines = timelines;
    response.send(responseJSON);
  });
});
app.get("/getStudents", (request, response) => {
  var datePattern = request.query.date;
  if (datePattern.length == 0) return;
  var sqlQuery = `select *,DATE_FORMAT(joining_date,"%M %Y") as joiningDate from placementsTwo where DATE_FORMAT(joining_date,"%M %Y")="${datePattern}";`;
  var responseJSON = {};
  connection.query(sqlQuery, (error, resultSet) => {
    if (error) {
      responseJSON.success = false;
      responseJSON.exception = error;
      response.send(responseJSON);
      return;
    }
    var students = [];
    resultSet.forEach((student) => {
      students.push(
        new Student(
          student.code,
          student.name,
          student.company,
          student.joiningDate,
          student.img
        )
      );
    });
    responseJSON.success = true;
    responseJSON.students = students;
    response.send(responseJSON);
  });
});
