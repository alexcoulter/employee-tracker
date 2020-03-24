const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require('console.table');
var rolesArray, employeesArray, deptArray, manager, id;


const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "newpass",
  database: "employee_DB"
});

connection.connect((err) => {
  if (err) throw err;
  console.log(`connected as id ${connection.threadId}\n`);
  updateRolesArray();
});


// Makes a call to the server and pulls information for employee roles and adds them to the 'RolesArray'
function updateRolesArray() {
  rolesArray = [];
  var query = `SELECT DISTINCT title FROM role ORDER BY title`;
  connection.query(query, function (err, res) {
    if (err) throw err;

    res.forEach(element => {
      rolesArray.push(element.title);
    });
    updateEmployeesArray();
  });
}

// Makes a call to the server and pulls the names of all employees and adds them to the 'EmployeesArray'
function updateEmployeesArray() {
  employeesArray = ["None"];
  var query = `select  CONCAT_WS(" ",first_name,last_name) AS Employee FROM employees;`;
  connection.query(query, function (err, res) {
    if (err) throw err;

    res.forEach(element => {

      employeesArray.push(element.Employee);
    });
    updateDeptArray();
  });
}

function updateDeptArray() {
  deptArray = [];
  var query = `select dept_name FROM department`;
  connection.query(query, function (err, res) {
    if (err) throw err;

    res.forEach(element => {

      deptArray.push(element.dept_name);

    });
    start();
  });
}



//Main menu for asking the user how they want to use their Employee Tracker
function start() {

  inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to do?",
        choices: ["View All Employees", "View All Employees By Department", "View All Employees By Manager", "Add Employee", "Remove Employee", "Update Employee Role", "Update Employee Manager", "View All Roles", "Add Role", "Remove Role", "View the total utilized budget of a department", "Exit"],
        name: "action",
      }
    ])
    .then(function (res) {
      switch (res.action) {
        case "View All Employees":
          viewEmployees("ORDER BY e.id");
          break;

        case "View All Employees By Department":
          viewEmployees("ORDER BY dept_name");
          break;

        case "View All Employees By Manager":
          viewEmployees("ORDER BY Manager");
          break;

        case "Add Employee":
          addEmployee();
          break;

        case "Remove Employee":
          removeEmployee();
          break;

        case "Update Employee Role":
          updateRole();
          break;

        case "Update Employee Manager":
          updateManager();
          break;

        case "View All Roles":
          viewRoles();
          break;

        case "Add Role":
          addRole();
          break;

        case "Remove Role":
          removeRole();
          break;

        case "View the total utilized budget of a department":
          budget();
          break;

        case "Exit":
          connection.end();
          break;
      }
    });
}

//makes a call to the server and prints a table of employees in the order that the user selected
function viewEmployees(orderBy) {
  var query = `select e.id, e.first_name, e.last_name,title, dept_name AS department, salary,  CONCAT_WS(" ",m.first_name,m.last_name) AS Manager FROM employees e LEFT JOIN employees m ON m.id = e.manager_id LEFT JOIN role ON e.role_id = role.id LEFT JOIN department ON dept_id = department.id ${orderBy}`;
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
    start();
  });
}

//makes a call to the server and prints a table of all the employee roles
function viewRoles() {
  var query = `SELECT DISTINCT title AS Role FROM role ORDER BY title`;
  connection.query(query, function (err, res) {
    if (err) throw err;

    console.table(res);
    start();
  });
}

//creates a new role value in the database and associates it with a certain salary and department that are specified by the user
function addRole() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What role would you like to add?",
        name: "role",
      },
      {
        type: "input",
        message: "What is the salary for this role?",
        name: "salary",
      },
      {
        type: "list",
        message: "What department is this role in?",
        name: "dept",
        choices: deptArray,
      }

    ])
    .then(function (res) {

      const promise1 = new Promise(function (resolve, reject) {

        var query = `select id from department where dept_name = ?`;
        connection.query(query, [res.dept], function (err, resp) {
          console.log(resp[0].id + "ID");
          department_id = resp[0].id;

          resolve();
        });
      });
      promise1.then(function () {

        var query = `INSERT INTO role (title, salary, dept_id)
      values ("${res.role}", ${res.salary}, ${department_id});`;
        connection.query(query, function (err, data) {
          if (err) throw err;
          console.log(`-----------------------------------------`);
          console.log(`${res.role} added as a new role!`);
          console.log(`-----------------------------------------`);
          updateRolesArray();

        });

      });
    });
}


//adds a new employee to the 'employees' table and inserts values for first and last name, role, and manager 
async function addEmployee() {
  try {

    inquirer
      .prompt([
        {
          type: "input",
          message: "What is the new employee's first name?",
          name: "firstName",
        },
        {
          type: "input",
          message: "What is the new employee's last name?",
          name: "lastName",
        },
        {
          type: "list",
          message: "What is this employee's role?",
          name: "role_name",
          choices: rolesArray,
        },
        {
          type: "list",
          message: "Who is this employee's manager?",
          name: "manager_name",
          choices: employeesArray,
        }
      ])
      .then(async function (res) {

        role = res.role_name;
        firstName = res.firstName;
        lastName = res.lastName;

        // console.log(res.manager_name);
        if (res.manager_name === "None") {
          manager = 0;
          sql = 0;
        }

        else {
          const splitName = res.manager_name.split(" ");
          first = splitName[0];
          last = splitName[1];

          var query = `select id from employees where first_name = ? and last_name = ?`;
          sql = await connection.query(query, [first, last], function (err, results) {
            if (err) throw err;
            // console.log(results[0].id + "manager ID");
            manager = results[0].id;
          });
        }

        var query = `select id from role WHERE role.title = ?`;
        const sql2 = await connection.query(query, [role], function (err, data) {
          if (err) throw err;
          // console.log(data[0].id + "RoleID");
          id = data[0].id;
          InsertEmployee(sql, sql2);
        });
      });
  }
  catch (err) {
    console.log(err);
  }
}

//waits to get database values and adds new employee
function InsertEmployee(a, b) {
  var query = `insert into employees (first_name, last_name, role_id, manager_id)
              values ("${firstName}", "${lastName}", ${id}, ${manager})`;

  connection.query(query, function (err) {
    if (err) throw err;
    console.log(`-----------------------------------------`);
    console.log(`${firstName} ${lastName} added as a new employee!`);
    console.log(`-----------------------------------------`);
    updateRolesArray();
  });
}


//Removes a specified role from the 'roles' table
function removeRole() {
  inquirer
    .prompt([

      {
        type: "list",
        message: "Which Role do you want to remove?",
        name: "delete_Role",
        choices: rolesArray,
      }

    ])
    .then(function (res) {
      var query = `delete from role where title = ?`;
      connection.query(query, [res.delete_Role], function (err, results) {
        console.log("-----------------------------------------------");
        console.log(`deleted ${res.delete_Role} from roles!`);
        console.log("-----------------------------------------------");
        updateRolesArray();
      });
    });
}

//Removes a specified employee from the 'employees' table
function removeEmployee() {
  inquirer
    .prompt([

      {
        type: "list",
        message: "Which Employee do you want to remove?",
        name: "delete_Emp",
        choices: employeesArray,
      }

    ])
    .then(function (res) {

      // console.log(res.delete_Emp);
      const splitName = res.delete_Emp.split(" ");
      const first = splitName[0];
      const last = splitName[1];

      var query = `delete from employees where  first_name = ? and last_name = ?`;
      connection.query(query, [first, last], function (err, results) {
        console.log("-----------------------------------------------");
        console.log(`deleted ${res.delete_Emp} from employees!`);
        console.log("-----------------------------------------------");
        updateRolesArray();
      });

    });
}


//Updates an employee's role to a new value
function updateRole() {
  employeesArray.shift();
  var first, last, id;

  inquirer
    .prompt([
      {
        type: "list",
        message: "What employee's information do you want to update?",
        name: "employee_name",
        choices: employeesArray,
      },
      {
        type: "list",
        message: "What is this employee's new role?",
        name: "role_name",
        choices: rolesArray,
      },
    ])
    .then(function (res) {

      const promise1 = new Promise(function (resolve, reject) {
        var query = `select id from role WHERE role.title = ?`;
        connection.query(query, [res.role_name], function (err, data) {
          if (err) throw err;

          const splitName = res.employee_name.split(" ");
          first = splitName[0];
          last = splitName[1];
          id = data[0].id;

          resolve();
        });
      });

      promise1.then(function () {

        var query = `UPDATE employees SET role_id = ? WHERE first_name = ? AND last_name = ?`;
        connection.query(query, [id, first, last], function (err, data) {
          if (err) throw err;
          console.log("---------------------------------------------------------------------")
          console.log(`${first} ${last}'s role has been updated to: ${res.role_name}`);
          console.log("---------------------------------------------------------------------")
          updateRolesArray();
        });
      });
    });
}


//Updates an employee's manager to a new person
function updateManager() {
  employeesArray.shift();
  var first, last, managerId;

  inquirer
    .prompt([
      {
        type: "list",
        message: "What employee's information do you want to update?",
        name: "employee_name",
        choices: employeesArray,
      },
      {
        type: "list",
        message: "Who is this employee's new manager?",
        name: "manager_name",
        choices: employeesArray,
      }
    ])
    .then(function (res) {
      console.log(res.employee_name + res.manager_name);

      const promise1 = new Promise(function (resolve, reject) {
        const splitManager = res.manager_name.split(" ");
        const splitEmployee = res.employee_name.split(" ");
        first = splitEmployee[0];
        last = splitEmployee[1];

        var query = `select id from employees WHERE first_name = ? AND last_name = ?`;
        connection.query(query, [splitManager[0], splitManager[1]], function (err, data) {
          if (err) throw err;
          managerId = data[0].id;
          // console.log(managerId);
          resolve();
        });
      });

      promise1.then(function () {

        var query = `UPDATE employees SET manager_id = ? WHERE first_name = ? AND last_name = ?`;
        connection.query(query, [managerId, first, last], function (err, data) {
          if (err) throw err;
          console.log("---------------------------------------------------------------------")
          console.log(`${first} ${last}'s  Manager been updated to: ${res.manager_name}`);
          console.log("---------------------------------------------------------------------")
          updateRolesArray();
        });
      });
    });
}


function budget() {
  inquirer
  .prompt([
    {
      type: "list",
      message: "What Department do you want the utilized budget for?",
      name: "dept",
      choices: deptArray,
    },
  ])
    .then(function(res) {
      console.log(res.dept);
  var query = `select  SUM(salary) AS budget
  FROM employees e LEFT JOIN employees m ON m.id = e.manager_id LEFT JOIN role ON e.role_id = role.id 
  LEFT JOIN department ON dept_id = department.id WHERE dept_name = ?`;
        connection.query(query, [res.dept], function (err, data) {
          if (err) throw err;
          console.log("---------------------------------------------------------------------")
          console.log(`The total utilized budget of the ${res.dept} department is ${data[0].budget}`);
          console.log("---------------------------------------------------------------------")
          updateRolesArray();
        });
      });
}

//Clean up add functions using promises
// functionality to add a department

// * You may wish to have a separate file containing functions for performing specific SQL queries you'll need to use. Could a constructor function or a class be helpful for organizing these?

