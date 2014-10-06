var MongoClient = require("mongodb").MongoClient;
/*
C:\mogodb\bin>mongod.exe
tipo
CRUD
Create
Read
Update
Delete
1 = Crear actualizar registro en Mongo...
2 = Eliminar una sesión...
3 = Enviar datos almacenados...
4 = Vaciar toda la base de datos...
*/
//bd.accionesUsuarioSala(room, 0, socket.id, 2, function(err, datos, idusuario)
exports.accionesUsuarioSala = function(sala, usuario, lasession, tipo, callback)
{
	MongoClient.connect("mongodb://localhost:27017/chatapp", function(err, db)
	{
		var p_pad = db.collection("salas");			
		if(tipo != 4)
		{
			var actualizaEliminaUser = function(guardado)
			{
				var cursor = p_pad.find({"idsala" : sala}, {"users" : true, "_id" : false});
				cursor.each(function(err, doc)
				{
					if(err)
					{
						throw err;
						callback(err, null, null);
					}
					if(!doc)
					{
						return false;
						callback(null, null, null);
					}
					var existe = false;
					//console.log("Valor de guardado es: " + guardado);
					if(!guardado && tipo != 3)
					{
						for(var i = 0; i < doc.users.length; i++)
						{
							if(tipo == 1) //Actualizando el campo...
							{
								if(usuario.iduser === doc.users[i].iduser)
								{
									existe = true;
									break;
								}
							}
							else
							{
								//Eliminando una sesión, por lo que se deberá encontrar...
								var idusuario = 0;
								for(c = 0; c < doc.users[i].session.length; c++)
								{
									if(doc.users[i].session[c] === lasession)
									{
										idusuario = doc.users[i].iduser;
										existe = true;
										break;
									}
								}
								if(existe)
								{
									break;
								}
							}
							/*
							if(usuario === doc.users[i].iduser)
							{
								if(tipo == 2)
								{
									//Buscar la sesión, sí existe podrá eliminarse...
									for(c = 0; c < doc.users[i].session.length; c++)
									{
										if(doc.users[i].session[c] === lasession)
										{
											existe = true;
											break;
										}
									}
								}
								else
								{
									existe = true;
								}
								break;
							}
							*/
						}
						if(existe)
						{
							//console.log("Existe: " + existe);
							var nombre = "users."+i+".session";
							var obj = {};
							var query = opc = "";
							obj[nombre] = lasession;
							query = {"idsala" : sala};						
							var almacena = true;
							if(tipo == 1)
							{								
								var baseCampos = "users."+i;
								var txtCampo = "";
								var objActualiza = {};
								if(doc.users[i].pn === usuario.pn && doc.users[i].pa === usuario.pa && doc.users[i].fo === usuario.fo)
								{
									opc = {$addToSet : obj};
									console.log("Adiciona sesion");
								}
								else
								{
									if(doc.users[i].pn !== usuario.pn)
									{
										txtCampo = baseCampos+".pn";
										objActualiza[txtCampo] = usuario.pn;									
									}
									if(doc.users[i].pa !== usuario.pa)
									{
										txtCampo = baseCampos+".pa";
										objActualiza[txtCampo] = usuario.pa;
									}
									if(doc.users[i].fo !== usuario.fo)
									{
										txtCampo = baseCampos+".fo";
										objActualiza[txtCampo] = usuario.fo;
									}
									console.log("Adiciona sesion Y ACTUALIZA DATOS");
									opc = {$addToSet : obj, $set : objActualiza};
								}							
								/*
								db.salas.update({idsala : "f563562b39fe0bb3ab79448e41d83b1bb572c927"}, {$set : {"users.1.pa" : "Vargas", "users.1.pn" : 'Mario', "users.1.fo" : 'nuevafoto.jpg'}, $addToSet : {"users.1.session" : "Prueba ver"}});
								*/								
							}
							else
							{
								opc = {$pull : obj};
								almacena = idusuario;
							}
							p_pad.update(query, opc, function(err, upsert)
							{
								if(err)
								{
									throw err;
								}
								//console.log("Se guarda/edita la nueva session: " + lasession + " para: " + usuario);					
								//callback(null, "termina");
								//console.log("Manda 2: " + doc.users)...
								//Saber si los datos de ese usuario han cambiado...
								callback(null, doc.users, almacena);
								return db.close();
							});
						}
						else
						{
							//console.log("No existe el elemento...");
							//console.log("Manda 3: " + doc.users)
							callback(null, doc.users, false);
							return db.close();
						}
					}
					else
					{
						//console.log("Manda 1: " + doc.users)
						callback(null, doc.users, false);
						return db.close();
					}
				});
			}
			//Crear un nuevo registro y/o actualizarlo...
			if(tipo == 1)
			{
				p_pad.findOne({"idsala": sala}, {"users" : {$elemMatch : {iduser : usuario.iduser}}}, function(err, doc)
				{
					if(err)
					{
						throw err;
					}
					if(!doc || doc.users == undefined)
					{
						//No hay registros, por lo tanto se deberá crear el registro...			
						var operador = 
						{
							$addToSet : {
											"users" : {
														"iduser"	: usuario.iduser, 
														"pn" 		: usuario.pn, 
														"pa" 		: usuario.pa, 
														"fo"		: usuario.fo, 
														"session" 	: [lasession]
													  }
										}
						};
						var opciones = {"upsert" : true};
						p_pad.update({"idsala" : sala}, operador, opciones, function(err, upsert)
						{
							if(err)
							{
								throw err;
							}
							//Se crea el proceso de creación de la sala sí es que no existey del usuario que no existe...								
							//console.log("Se ha creado el usuario y tal vez la sala");
							//console.log("Sala: " + sala);
							//console.log("Usuario: " + usuario);
							//console.log("Session: " + lasession);
							//guardado = true;
							actualizaEliminaUser(true);
							//callback(null, "termina");
							//return db.close();						
						});
					}
					else
					{
						actualizaEliminaUser(false);
					}
				});
			}
			else
			{
				actualizaEliminaUser(false);			
			}
		}
		else
		{
			//Limpiar la base de datos...
			p_pad.drop();
			callback(null, null, null);
		}
	});	
};