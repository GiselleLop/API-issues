import mysql from 'mysql2/promise';
import { Connector } from '@google-cloud/cloud-sql-connector';
import dotenv from 'dotenv'

dotenv.config();

const connector = new Connector();
const clientOpts = await connector.getOptions({
    //nombre de la conexion a la instancia de google cloud sql
    instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME,
    ipType: 'PUBLIC',
});

// crea pool de conexiones, se conecta a la db
export const db = mysql.createPool({
    ...clientOpts,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});