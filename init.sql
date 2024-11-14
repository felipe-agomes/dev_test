USE test_db;

--TODO Crie a tabela de user;
CREATE TABLE user (
     id        INT AUTO_INCREMENT
    ,firstname VARCHAR(100) NOT NULL
    ,lastname  VARCHAR(100) NOT NULL
    ,email     VARCHAR(100) NOT NULL
    ,PRIMARY KEY (id)
);

--TODO Crie a tabela de posts;
CREATE TABLE post (
     id          INT AUTO_INCREMENT 
    ,title       VARCHAR(100) NOT NULL
    ,description VARCHAR(100) NOT NULL
    ,userid      INT          NOT NULL
    ,PRIMARY KEY (id)
    ,FOREIGN KEY (userId) REFERENCES user(id)
);


