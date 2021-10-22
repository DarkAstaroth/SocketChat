const { Usuarios } = require("../classes/usuarios");
const { io } = require("../server");
const { crearMensaje } = require("../utils/utilidades");

const usuarios = new Usuarios();

io.on("connection", (client) => {
  client.on("entrarChat", (data, callback) => {
    if (!data.nombre || !data.sala) {
      return callback({
        error: true,
        mensaje: "El nombre/sala es necesario",
      });
    }

    client.join(data.sala);
    let personas = usuarios.agregarPersona(client.id, data.nombre, data.sala);
    client.broadcast.emit("listaPersona", usuarios.getPersonas());
    return callback(personas);
  });

  client.on("crearMensaje", (data) => {
    let persona = usuarios.getPersonas(client.id);
    let mensaje = crearMensaje(persona.nombre, data.mensaje);
    client.broadcast.emit("crearMensaje", mensaje);
  });

  client.on("disconnect", () => {
    let personaBorrada = usuarios.borrarPersona(client.id);
    client.broadcast.emit(
      "crearMensaje",
      crearMensaje("Administrador", `${personaBorrada.nombre} salió`)
    );

    client.broadcast.emit("listaPersona", usuarios.getPersonas());
  });

  // Mensajes privados
  client.on("mensajePrivado", (data) => {
    let persona = usuarios.getPersona(client.id);
    client.broadcast
      .to(data.para)
      .emit("mensajePrivado", crearMensaje(persona.nombre, data.mensaje));
  });
});
