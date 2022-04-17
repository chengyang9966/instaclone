CREATE TABLE IF NOT EXISTS users (
    id serial PRIMARY KEY,
    username varchar(30) UNIQUE NOT NULL,
    bio varchar(400) ,
    avatar varchar(200),
    phone varchar(25),
    email varchar(40) UNIQUE NOT NULL,
    password varchar(1000) NOT NULL DEFAULT '8503e708157832e73bb2be770c01ec6c02747ed4aa25811af6503a89843d94ba6bf16808677cfe685d1a533e79f0a79085dba657920abfae7d8c7f8ecc3350ed',
    status user_status NOT NULL default 'pending',
    salt varchar(100) NOT NULL DEFAULT '2f763dbbd9c51a77d0de2b7e18950af9',
    last_login TIMESTAMP,
    created_at TIMESTAMP default current_timestamp,
    updated_at TIMESTAMP default current_timestamp,
    role_id INT NOT null,

	  FOREIGN KEY (role_id)
      REFERENCES roles (id)
);