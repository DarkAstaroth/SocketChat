const { Usuarios } = require("../classes/usuarios");
const { io } = require("../server");
const usuarios = new Usuarios();

io.on("connection", (client) => {
  client.on("entrarChat", (data, callback) => {
    if (!data.nombre) {
      return callback({
        error: true,
        mensaje: "El nombre es necesario",
      });
    }
    let personas = usuarios.agregarPersona(client.id, data.nombre);
    return callback(personas);
  });
});
