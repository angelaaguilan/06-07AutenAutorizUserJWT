// funciones que interactuan con la BD
const pool = require("./bd/conexion.js");
const bcrypt = require("bcryptjs");

const agregarUsuario = async (email, password, rol, lenguage) => {
  try {
    // método hashSync: encripta la contraseña
    const passwordEncriptada = bcrypt.hashSync(password);
    password = passwordEncriptada;
    const values = [email, passwordEncriptada, rol, lenguage];
    const consulta = `INSERT INTO usuarios (id, email, password, rol, lenguage) VALUES (DEFAULT, $1, $2, $3, $4)`;
    const insert = await pool.query(consulta, values);
    return insert;
  } catch (error) {
    throw new Error("Error al agregar usuario: " + error.message);
  }
};

const verificarCredenciales = async (email, password) => {
  try {
   
    console.log(`ACCESO: VERIFICARCREDENCIALES`);
    const values = [email];
    const consulta = "SELECT * FROM usuarios WHERE email = $1";
    const {
      rows: [usuario],
      rowCount,
    } = await pool.query(consulta, values);
    console.log("usuario en verificar credenciales: ");
    console.log(usuario);
   
    const { password: passwordEncriptada } = usuario;
   
    // método compareSync comparación entre una contraseña encriptada y su supuesta contraseña original - boolean
    const passwordEsCorrecta = bcrypt.compareSync(password, passwordEncriptada);
    console.log(`VERIFICARCREDENCIALES: compara psw con bcrypt.compareSync ${passwordEsCorrecta}`);
    if (!passwordEsCorrecta || !rowCount)
      throw { code: 401, message: "Email o contraseña incorrecta" };
    return passwordEsCorrecta; 
 } catch (error) {
    console.log(`Error en VerificarCredenciales: ${error}`);
    throw new Error("Error al verificar credenciales: " + error.message);
 }
};

const consultarUsuario = async (email, password) => {
  try {

    console.log(`CONSULTAR USUARIOS: ACCESO A consultarUsuario: `);
    const consulta = `SELECT * FROM usuarios WHERE email = $1;`;
    const values = [email];    
    console.log(consulta);
    console.log(values);

   const { rows: [usuario], rowCount} = await pool.query(consulta, values);
   //const { rows, rowCount } = await pool.query(consulta, values);
    //console.log("rows: ");
    //console.log(rows[0]);
    console.log("CONSULTAR USUARIO: VALORES rows[0]: ");

    console.log("[usuario]: ");
    console.log([usuario]);

    console.log(`Valores: [usuario]`);
    console.log([usuario]);
    return ([usuario]);
  } catch (error) {
      console.log(`Error en Consultar Usuario: ${error}`);
    throw new Error("Error al Consultar Usuario: " + error.message);
  }
};


module.exports = {
  agregarUsuario,
  verificarCredenciales,
  consultarUsuario,
};
