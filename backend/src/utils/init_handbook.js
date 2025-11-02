import fs from "fs";
import { pool } from "../config/mysql.js";

async function main() {
    const connection = await pool.getConnection();
    
    const data = JSON.parse(fs.readFileSync("./luatlaodong_chunk.json", "utf8"));

    // random chuoi
    

    const values = data.map((item) => [
    `${item.id}_${item.chunk_index}_${Date.now().toString(36)}` , 
    item.law_name,
    item.chapter,
    item.article_number + " " + item.law_name,
    "luat lao dong",
    item.article_title,
    item.chunk_index,
    item.content,
  ]);

  await connection.query(
    `INSERT INTO Handbook_Section 
    (section_id , law_name, chapter, law_reference,category, article_title, chunk_index, content)
    VALUES ?`,
    [values]
  );

  console.log("✅ Insert hoàn tất!");
  await connection.end();


}

export default main;