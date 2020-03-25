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

