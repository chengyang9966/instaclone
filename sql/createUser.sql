CREATE TABLE IF NOT EXISTS users (
    id serial PRIMARY KEY,
    username varchar(30) UNIQUE NOT NULL,
    bio varchar(400) ,
    avatar varchar(200),
    phone varchar(25),
    email varchar(40) UNIQUE NOT NULL,
    password varchar(50) NOT NULL,
    status varchar(15),
    last_login TIMESTAMP,
    created_at TIMESTAMP default current_timestamp,
    updated_at TIMESTAMP default current_timestamp,
    role_id INT NOT null,

	  FOREIGN KEY (role_id)
      REFERENCES roles (id)
);

