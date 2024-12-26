const express = require('express');
const jwt = require("jsonwebtoken");
const app = express();
const cors = require('cors');
const port = 3000;
const llaveSecreta = 'az_AZ'; 
const { agregarUsuario, verificarCredenciales, consultarUsuario } = require('./consultas.js');

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    try {
        res.status(200).json({success: true});
    } catch (error) {
        res.status(500).send(error.message) ;
    }
})

// Validar token recibido
const verificarToken = async (req, res, next) => {
    try {
        // 1. Extraer token desde la propiedad Authorization en la cabecera

        const Authorization = await req.get("Authorization");
        if (!Authorization) {
            return res.status(401).json({ message: "No se proporcionó el token de autorización" });
        }
        //console.log(Authorization);

        const token = Authorization.split("Bearer ")[1];
        //console.log(`VERIFICARTOKEN - VALOR TOKEN: ${token}`);
        
        if (!token) {
            return res.status(401).json({ message: "Formato de token inválido" });
        }

        // 2. Verificar validez del token usando la misma llave secreta de la firma
        const llave = jwt.verify(token, llaveSecreta);
        //console.log(`VERIFICARTOKEN - VALOR LLAVE CON jwt.verify: ${llave}`);

        // 3. Decodifique el token para obtener el email del usuario a buscar en su payload
        const { email } = jwt.decode(token);
        //console.log(`VERIFICARTOKEN - VALOR EMAIL CON jwt.decode: ${email}`);

        if (!email || !llave) {
            return res.status(401).json({ message: "Token proporcionado no es válido" });
        }
        next();
    } catch (error) {
        console.log(`Error en verificarToken: ${error}`);
        return res.status(500).json({ message: "Internal server error" });
    }
};


// SoftJobs - Registro de nuevos usuarios
app.post("/usuarios", async (req, res) => {
    try {
        console.log(`ACCESO: POST-USUARIOS`);
        const { email, password, rol, lenguage } = req.body;
        console.log(`POST-USUARIOS: LLAMADA A AGREGAR USUARIO CON ${email}, ${password}, ${rol}, ${lenguage}`);
        const { rows, rowCount } = await agregarUsuario(email, password, rol, lenguage);

        if (rowCount === 1) {
            res.status(201).json({success: true, msg: "Usuario creado con éxito"});
        } else {
            // 400 error de datos
            res.status(400).json({success: false, msg: "Error en la operación"});
        }
    } catch (error) {
        // 400 error de servidor
        res.status(500).send(error);
    }
})

// SoftJobs - Recibir credenciales y retorna Token generado con JWT
app.post("/login", async (req, res) => {
    try {
        console.log(`ACCESO: POST-LOGIN`);
        const { email, password } = req.body;
        console.log("email, password desde BODY: ");
        console.log(email, password);

        console.log(`POST-LOGIN: SOLICITAR ACCCESO A VERIFICAR CREDENCIALES`);
        const credencialValida = await verificarCredenciales(email, password);
        const  token  = jwt.sign({ email }, llaveSecreta);
        // const { token } = jwt.sign({ email }, llaveSecreta, { expiresIn: "30 days" });

        console.log("token despues de verificarCredenciales con JWT.SIGN: ");
        console.log({ token });
        res.send({ token });

    } catch (error) {
        console.log(`Error en POST-LOGIN: ${error}`);
        res.status(error.code || 500).send(error);
    }
})

// SoftJobs - Devolver datos de un usuario en caso que esté autenticado
app.get("/usuarios", async (req, res) => { 
    try {
        
        console.log(`ACCESO: GET-USUARIOS`);
        
        // 1. Extraer token desde la propiedad Authorization en la cabecera

        const Authorization =  req.get("Authorization");
        if (!Authorization) {
            return res.status(401).json({ message: "No se proporcionó el token de autorización" });
        }
        console.log(`1. GET-USUARIOS - Authorization: ${Authorization}`);

        const token = Authorization.split("Bearer ")[1];
        console.log(`GET-USUARIOS - VALOR TOKEN: ${token}`);
        
        if (!token) {
            return res.status(401).json({ message: "Formato de token inválido" });
        }

        // 2. Verificar validez del token usando la misma llave secreta de la firma
        const llave = jwt.verify(token, llaveSecreta);
        console.log(`2. GET-USUARIOS - VALOR LLAVE CON jwt.verify: ${llave}`);

        // 3. Decodifique el token para obtener el email del usuario a buscar en su payload
        const { email } = jwt.decode(token);
        console.log(`3. GET-USUARIOS - VALOR EMAIL CON jwt.decode: ${email}`);

        if (!email || !llave) {
            return res.status(401).json({ message: "Token proporcionado no es válido" });
        }
         const [usuario] = await consultarUsuario(email, "");
        
        console.log(`GET-USUARIOS - DATA:  ${[usuario]} `);

        if ([usuario].length === 1) {
            res.status(200).json([usuario]);
        } else {
            // 400 error de datos
            res.status(400).json({success: false, msg: "Error en la operación"});
        }
    } catch (error) {
        console.log(`Error en GET-USUARIOS: ${error}`);
        res.status(error.code || 500).send(error);
    }
})

app.listen(port, () => {
    console.log(`SERVER ON - http://localhost:${port}`);
})
