create table messages(
    id serial PRIMARY KEY,
    text varchar(255) NOT NULL,
    created_at TIMESTAMP default current_timestamp,
    updated_at TIMESTAMP default current_timestamp,
    is_view boolean default false,
    user_id INT NOT null,
    FOREIGN KEY (user_id)
    REFERENCES users (id)
)