CREATE TABLE IF NOT EXISTS users (
    id serial PRIMARY KEY,
    username varchar(30) UNIQUE NOT NULL,
    bio varchar(400) ,
    avatar varchar(200),
    phone varchar(25),
    email varchar(40) UNIQUE NOT NULL,
    password varchar(1000) NOT NULL DEFAULT '3256b0c09535a98f376a83aa49c184ced549c9b89175f24ef4be1dc1d9a1283b54890c4dec5c62d9d06c246699cb6f372430e7131b86d15b883c7bec7a4bc341',
    status varchar(15),
    salt varchar(100) NOT NULL DEFAULT 'bdd15c5f129c0f4187d385a5a69cf564',
    last_login TIMESTAMP,
    created_at TIMESTAMP default current_timestamp,
    updated_at TIMESTAMP default current_timestamp,
    role_id INT NOT null,

	  FOREIGN KEY (role_id)
      REFERENCES roles (id)
);

