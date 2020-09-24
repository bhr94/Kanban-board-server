CREATE TABLE users (
    id serial PRIMARY key,
    username VARCHAR (100) NOT NULL ,
    email VARCHAR (100) NOT NULL
);




CREATE TABLE boards (
    boardid serial PRIMARY key,
    boardname VARCHAR (100) NOT NULL ,
    userid INT NOT NULL

);


CREATE TABLE lists (
    listid serial PRIMARY key,
    listtitle VARCHAR (200) NOT NULL ,
    boardid INT NOT NULL

);


CREATE TABLE cards (
    cardid serial PRIMARY key,
    cardcontent VARCHAR (200) NOT NULL ,
    listid INT NOT NULL

);