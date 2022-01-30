const express = require('express');
const mysql = require('mysql2');
const table = require('console.table');
const inquirer = require('inquirer');


const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
  {
    host: 'localhost',
    // MySQL username,
    user: 'root',
    // TODO: Add MySQL password here
    password: 'JoshuaSamples00',
    database: 'Vandelay_db'
  },
  console.log(`Connected to the Vandelay_db database.`)
);
function vandelay(){
  inquirer.prompt([
    {
      type:'list',
      message:'what would you like to do?',
      name:'operation',
      choices:[
        'View departments',
        'View roles',
        'View employees',
        'Add department',
        'Add role',
        'Add employee',
        'Update employee role',
        'Quit'
      ]
    }
 ])
 .then(function(answers){
   if (answers.operation== 'Quit'){
     console.table('Quitting')
     process.exit()
   }
   else if (answers.operation == 'View departments') {
    db.query('SELECT * FROM department', function (err, results) {
      console.table(results);
    });
    vandelay()
  }
  else if (answers.operation=='View roles'){
    db.query(`SELECT role.id, role.title, department.name AS department, role.salary 
    FROM role 
    JOIN department 
    ON role.department_id = department.id;`, function (err, results) {
      console.table(results);
    })
    vandelay()
  }
  else if (answers.operation == 'View employees') {
    db.query(`SELECT employee.id, employee.first_name, employee.last_name, role.title AS title, role.salary AS salary, department.name AS department, CONCAT(manager.first_name,' ',manager.last_name) AS manager_name
    FROM employee
    JOIN role
    ON employee.role_id = role.id
    JOIN department
    ON role.department_id = department.id
    LEFT JOIN employee manager
    ON employee.manager_id = manager.id
    ;`
      , function (err, results) {
        console.table(results);
      })
    vandelay()
  }
  else if (answers.operation == 'Add department') {
    inquirer.prompt([{
      type: 'input',
      message: 'What is the department name?',
      name: 'departmentName'
    }]).then(function (answers) {
      db.query(`INSERT INTO department (name) VALUES ('${answers.departmentName}')`, function (err, results) {
      })
      vandelay()
 })
}
else if (answers.operation == 'Add role') {
  addRole()
}
else if (answers.operation == 'Add employee') {
  newEmployee()
}
else if (answers.operation == `Update employee's role`) {
  updateEmployee()
}
else {
  console.error(err)
}
})
};
vandelay();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const roleSelect = [];
const managerSelect = [];

function newEmployee() {
  db.query(`SELECT title AS name, id from role`, function (err, results) {
    let roles = results
    roles.map(role => {
      roleSelect.push(role)

    });
    db.query(`SELECT CONCAT(first_name,' ',last_name) AS name, id from employee`, function (err, results) {
      let managers = results
      managers.map(employee => {
        managerSelect.push(employee)

      });
      inquirer.prompt([{
        type: 'input',
        message: `Employee's first name?`,
        name: 'fName'
      },
      {
        type: 'input',
        message: `Employee's last name?`,
        name: 'lName'
      },
      {
        type: 'list',
        message: `Employee's role?`,
        name: 'role',
        choices: roleSelect
      },
      {
        type: 'list',
        message: `Employee's manager?`,
        name: 'manager',
        choices: managerSelect

      }

      ]).then(function (answers) {
        const selectedRole = roleSelect.find(element => element.name == answers.role)
        const selectedManager = managerSelect.find(element => element.name == answers.manager)
        db.query(`INSERT INTO employee (first_name,last_name,role_id,manager_id) VALUES 
        ('${answers.fName}','${answers.lName}',${selectedRole.id},${selectedManager.id})`, function (err, results) {
          console.table(results);
        })
        vandelay()
      })
    })
  })
}
const employeeSelect = [];

function updateEmployee() {
  db.query(`SELECT CONCAT(first_name,' ',last_name) AS name, id FROM employee`, function (err, results) {
    let employees = results
    employees.map(employee => {
      employeeSelect.push(employee)
    });
    db.query(`SELECT title AS name, id from role`, function (err, results) {
      let roles = results
      roles.map(role => {
        roleSelect.push(role)
      });
      inquirer.prompt([
        {
          type: 'list',
          message: `Which employee's role do you want to change?`,
          name: 'name',
          choices: employeeSelect
        },
        {
          type: 'list',
          message: `What do you want to change the employee's role to?`,
          name: 'role',
          choices: roleSelect
        }
      ])
        .then(function (answers) {
          const selectedRole = roleSelect.find(element => element.name == answers.role)
          const selectedEmployee = employeeSelect.find(element => element.name == answers.name)
          db.query(`UPDATE employee SET role_id = ${selectedRole.id} WHERE id = ${selectedEmployee.id}`, function (err, results) {
            console.log(results);
          })
          vandelay();
        })
    })
  });
  
};

const departmentSelect = [];

function addRole() {
  db.query(`SELECT name,id from department`, function (err, results) {
    let departments = results
    departments.map(department => {
      departmentSelect.push(department)

    });
    inquirer.prompt([
      {
        type: 'list',
        message: 'In what department does this role reside?',
        name: 'department',
        choices: departmentSelect
      },
      {
        type: 'text',
        message: 'What is the name of the new role?',
        name: 'role'
      },
      {
        type: 'text',
        message: 'What is the salary of the new role?',
        name: 'salary'
      }
    ])
      .then(function (answers) {
        const selectedDept = departmentSelect.find(element => element.name == answers.department)
        db.query(`INSERT INTO role (title, salary, department_id) VALUES 
         ('${answers.role}',${answers.salary},${selectedDept.id})`, function (err, results) {
        })
        vandelay();
      })
  });
}
