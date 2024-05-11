create table booknotes (
	id serial primary key,
	name varchar(255),
	year integer,
	src text,
	note text
);

insert into booknotes (name, year, src, note)
values ('The Dark Secret', 2013, 'https://s3.amazonaws.com/mm-static-media/books/cover-art/9780545349215.jpeg', 'very good')