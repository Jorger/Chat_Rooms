var io = require("socket.io").listen(8083, {log: false});
var bd = require('./mongodatos');
bd.accionesUsuarioSala(0, 0, 0, 4, function(err)
{
	io.on("connection", function(socket)
	{
		socket.on("newUser", function(data)
		{
			var room = data.ic; //Es el id de la sala...
			//socket.emit('newUser', {id: sessionId, ic: dchat.idchat, iu: dchat.iduser, pn: dchat.pn, pa: dchat.pa, fo: dchat.fo});
			var UserChat = {iduser : data.iu, pn : data.pn, pa : data.pa, fo : data.fo};
			//console.log("Objeto user: " + UserChat);
			socket.join(room); //Une un usuario a la sala...
			//Guardar la información en Mongo...
			bd.accionesUsuarioSala(room, UserChat, data.id, 1, function(err, datos, guardado)
			{
				var participants = [];
				//console.log("Valor de guardado es: " + guardado);
				if(guardado)
				{
					for(var i = 0; i < datos.length; i++)
					{
						if(datos[i].iduser === data.iu)
						{
							//console.log("Numero sesiones: " + datos[i].session.length);
							datos[i].session.push(data.id);
						}					
					}
				}
				for(var i = 0; i < datos.length; i++)
				{
					if(datos[i].session.length != 0)
					{
						participants.push(datos[i]);
						console.log("	Usuario: " + datos[i].iduser + " solo datos");	
					}					
				}
				console.log("Debe emitir a la sala: " + room);
				io.sockets.in(room).emit("newConnection", {data: participants});			
			});
		});
		
		/*
		//Cuando se deseen traer los datos almacenados de la sesión...
		bd.accionesUsuarioSala(room, 0, 0, 3, function(err, datos, opciones)
		{
			
		});
		*/
		//Para transmitir los mensajes...
		socket.on("message", function(data)
		{			
			var room = data.room;
			var iduser = data.iduser;
			var session = data.session;
			var msg = data.msg;
			//Se debe buscar si el usuario existe en esa sala...
			bd.accionesUsuarioSala(room, 0, 0, 3, function(err, datos)
			{
				var existe = false;
				for(var i = 0; i < datos.length; i++)
				{
					if(datos[i].iduser === iduser)
					{
						for(var c = 0; c < datos[i].session.length; c++)
						{
							if(datos[i].session[c] === session)
							{
								existe = true;
								break;
							}
						}
					}
					if(existe)
					{
						break;
					}
				}
				if(existe)
				{
					//Como existe, se deberá emitir el mensaje...
					io.sockets.in(room).emit("incomingMessage", {iduser : iduser, msg: msg});
				}
			});
		});
		//Fin de tranmitir los mensajes...
		socket.on("disconnect", function()
		{
			var rooms = io.sockets.manager.roomClients[socket.id];
			//console.log("Usuairo desconecta");		
			for(var room in rooms)
			{
				if(room.length > 0)
				{
					room = room.substr(1);
					break;
				}
			}
			console.log("La sala es: " + room + " el soccket a cerrar es: " + socket.id);		
			bd.accionesUsuarioSala(room, 0, socket.id, 2, function(err, datos, idusuario)
			{
				console.log("Usuario se va: " + idusuario);
				//Buscar para saber cuantas sesiones tiene el usuario abiertasy si no le queda ninguna, se notificará...
				var numSession = 0;
				for(var i = 0; i < datos.length; i++)
				{
					if(datos[i].iduser === idusuario)
					{
						for(var c = 0; c < datos[i].session.length; c++)
						{
							if(datos[i].session[c] !== socket.id)
							{
								console.log("Abierta: " + datos[i].session[c]);
								numSession++;
							}
						}
						break;
					}				
				}
				console.log("Sesiones quedan: " + numSession);
				if(numSession <= 0)
				{
					console.log("Emite que se ha ido del todo el usuario: " + room);
					io.sockets.in(room).emit("userDisconnected", {id: idusuario, sender:"system"});
				}
			});
			//delete socket.id;			
		});
	});
});