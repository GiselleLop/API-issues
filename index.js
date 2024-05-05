import express from 'express';
import cors from 'cors'; 
import dotenv from 'dotenv'
import { db } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
// Start server

app.use(cors()); 
app.use(express.json());

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

//get all isues
app.get('/issues', async (req, res) => {
    const conn = await db.getConnection()
    const [result] = await conn.query(`
    SELECT 
issue.id,
issue.location_id, 
issue.issue_type_id, 
issue.title, 
issue.description, 
issue.status, 
issue.date,
location.name as location_name,
issue_type.name as issue_type_name
FROM issue
JOIN location
ON issue.location_id = location.id
JOIN issue_type
ON issue.issue_type_id = issue_type.id
    `);
    conn.release() 
    res.json(result)

});

//get all issue types
app.get('/issue_types', async (req, res) => {
    const conn = await db.getConnection()
    const [result] = await conn.query(`SELECT * FROM issue_type`);
    conn.release() 
    res.json(result)
});

//get all locations
app.get('/locations', async (req, res) => {
    const conn = await db.getConnection()
    const [result] = await conn.query(`SELECT * FROM location`);
    conn.release()
    res.json(result)
});

app.get('/issue_type/:id', async (req, res) => {
    const id = req.params.id;
    const conn = await db.getConnection()
    const [result] = await conn.query(`SELECT * FROM issue_type WHERE issue_type_id = ?`, [id]);
    conn.release()

    res.json(result)
});

// Ruta para agregar una nueva incidencia (POST)
app.post('/issues', async (req, res) => {
    try {
        const {issue_type_id, location_id,  title, description, date } = req.body;

        if ( !issue_type_id || !location_id || !title || !description || !date) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        // Insertar la nueva incidencia en la base de datos...
        const conn = await db.getConnection();
        await conn.query('INSERT INTO issue (issue_type_id, location_id, title, description, date) VALUES (?, ?, ?, ?, ?)', [ issue_type_id, location_id,  title, description, date]);
        conn.release(); // Liberar la conexión

        // Devolver una respuesta indicando éxito
        res.status(201).json({ message: 'Incidencia creada exitosamente' });
   
    } catch (error) {
        console.error('Error al crear incidencia:', error);
        res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud' });
    }
});

//update status
app.put('/issues', async (req, res) => {
try{
    const id = req.body.id;
    const status = req.body.status;

    const conn = await db.getConnection()
    await conn.query(`UPDATE issue SET status = ? WHERE id = ?;`, [status, id]);
    conn.release()
    res.status(201).json({ message: 'Incidencia actualizada exitosamente' });
  
}
catch {

    console.error('Error al actualizar incidencia:', error);
}
  
});