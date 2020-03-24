DROP DATABASE IF EXISTS employee_DB;
CREATE DATABASE employee_DB;

USE employee_DB;

CREATE TABLE department(
id int auto_increment not null,
dept_name varchar(30) not null,
primary key (id)
);

CREATE TABLE role(
id int auto_increment not null,
title varchar(30) not null,
salary int null,
dept_id int not null,
primary key (id)
);

CREATE TABLE employees(
id int auto_increment not null,
first_name varchar(30) null,
last_name varchar(30) null,
role_id int not null,
manager_id int null,
primary key (id)
);



insert into department (dept_name)
values ("Sales");
insert into department (dept_name)
values ("Engineering");
insert into department (dept_name)
values ("Legal");
insert into department (dept_name)
values ("Finance");

insert into role (title, salary, dept_id)
values ("Sales Member", 33000, 1);
insert into role (title, salary, dept_id)
values ("Sales Consultant", 45000, 1);
insert into role (title, salary, dept_id)
values ("Sales Professional", 55000, 1);
insert into role (title, salary, dept_id)
values ("CEO", 70000, 1);
insert into role (title, salary, dept_id)
values ("Engineering Assistant", 28000, 2);
insert into role (title, salary, dept_id)
values ("Senior Engineer", 58000, 2);
insert into role (title, salary, dept_id)
values ("Lead Engineer", 89000, 2);
insert into role (title, salary, dept_id)
values ("President", 70000, 2);

insert into employees (first_name, last_name, role_id, manager_id)
values ("Jake", "Fromm", 2, 4);
insert into employees (first_name, last_name, role_id, manager_id)
values ("Sandra", "Billsby", 1, 4);
insert into employees (first_name, last_name, role_id, manager_id)
values ("Blake", "Deadly", 3, 4);
insert into employees (first_name, last_name, role_id, manager_id)
values ("Julia", "Thompson", 4,NULL);
insert into employees (first_name, last_name, role_id, manager_id)
values ("Barry", "Sandals", 5, 8);
insert into employees (first_name, last_name, role_id, manager_id)
values ("Jodie", "Graham", 6, 8);
insert into employees (first_name, last_name, role_id, manager_id)
values ("Tara", "Grissom", 7, 8);
insert into employees (first_name, last_name, role_id, manager_id)
values ("Stoney", "Brooke", 8,NULL);


select employees.id, first_name, last_name, title, dept_id, salary, manager_id from employees INNER JOIN role ON role_id = role.id;

select * from role;
select * from employees;

select employees.id, first_name, last_name, title, dept_name, salary, manager_id from employees JOIN role ON role_id = role.id JOIN department ON dept_id = department.id;

select e.first_name, e.last_name, CONCAT_WS(" ",m.first_name,m.last_name) AS Manager FROM employees e LEFT JOIN employees m ON m.id = e.manager_id;

//manager working

select e.id, e.first_name, e.last_name,title, dept_name AS department, salary,  CONCAT_WS(" ",m.first_name,m.last_name) AS Manager FROM employees e LEFT JOIN employees m ON m.id = e.manager_id LEFT JOIN role ON e.role_id = role.id JOIN department ON dept_id = department.id;

//full table working

select DISTINCT title From role ORDER BY title;

select  SUM(salary)
FROM employees e LEFT JOIN employees m ON m.id = e.manager_id LEFT JOIN role ON e.role_id = role.id 
LEFT JOIN department ON dept_id = department.id WHERE dept_name = "Sales";




