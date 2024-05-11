import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";

const app = express();
const port = 3000;
env.config();

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
})
db.connect();

app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended : true}))
app.set('view engine', 'ejs');

let myBooks = [];

app.get('/', async (req, res) => {
  try{
    const result = await db.query("SELECT * FROM booknotes");
    myBooks = result.rows
    console.log(result.rows) 
    res.render("index.ejs", {
      books: myBooks
    })
  }catch (err) {
    console.log(err)
  }
})

app.get('/search', async (req, res) => {
  try {
    const options = {
      method: 'GET',
      url: 'https://book-finder1.p.rapidapi.com/api/search',
      params: {
        series: req.query.bookSearch,
        results_per_page: '51',
        page: '1'
      },
      headers: {
        'X-RapidAPI-Key': process.env.API_KEY,
        'X-RapidAPI-Host': 'book-finder1.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    
    res.render('search.ejs', {
      searchBooks: response.data.results
    });
  } catch (error) {
    console.error(error);
  }
});

app.post('/add', async (req, res) => {
  try {
    const { name, year, src } = req.body;
    console.log(name, year, src)
    await db.query(
      "INSERT INTO booknotes (name, year, src) VALUES ($1, $2, $3)",
      [name, year, src]
    );
    res.redirect('/')
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding book to database');
  }
});

app.post('/delete', async (req, res) => {
  const id = req.body.deleteItemId;
  try {
    await db.query(
      "DELETE FROM booknotes where id=$1", [id]
    );
    res.redirect('/')
  } catch(err) {
    console.log(err)
  }
});

app.get('/note', async (req, res) => {
  const id = req.query.noteId;
  const result = await db.query("SELECT * FROM booknotes where id=$1", [id])
  const name = result.rows[0].name
  const note = result.rows[0].note
  const src = result.rows[0].src
  
  console.log(result)
  console.log(id)
  res.render('notes.ejs', {
    name: name,
    note: note,
    id: id,
    src: src
  })
});

app.get("/editNote", (req, res) => {
  const id = req.query.editNote;
  const name = req.query.noteName;
  res.render("editnote.ejs", {
    id: id,
    name: name
  })
})

app.post('/addNote', async (req, res) => {
  const note = req.body.bookNote;
  const id = req.body.saveButton;
  console.log(note,id)
  try {
    await db.query(
      "UPDATE booknotes SET note=$1 WHERE id=$2", [note, id]
    );
    res.redirect('/')
  } catch(err) {
    console.log(err)
  }
});


app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
