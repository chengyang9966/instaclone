create table user_settings(
    id serial PRIMARY KEY,
    timezone varchar(20) NOT NULL,
    created_at TIMESTAMP default current_timestamp,
    updated_at TIMESTAMP default current_timestamp,
    user_id INT NOT null,
    FOREIGN KEY (user_id)
    REFERENCES users (id)
)