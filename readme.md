Backend Salas de Chat Múltiples
=========


![alt tag](https://db.tt/xmYd6MEL)

Backend Sistema de Chat, el cual hace uso de Socket.io para el menejo de Sockets, así como MongoDB para el almacenamiento de sesiones, un usuario puede tener varias sesiones en un mismos chat.

Se ha creado el paqueto mongodatos que realiza los principales proceso de CRUD, sobre los datos.

En Mongo se ha crea una estructura la cual almacena los usuarios por sala, así como la relación de sesiones por cada usuario.

![alt tag](https://db.tt/sTCI8882)


Se hace uso de Auth para la autenticación de usaurios para redes sociales (trabajo en progreso)


Installation
--------------

```sh
npm install
```
Se requiere la instalación de [mongodb] por defecto el puerto de éste es 27017


Autor
-----------
Jorge Rubiano

[@ostjh]

License
----

MIT

[mongodb]:http://www.mongodb.org/
[@ostjh]:https://twitter.com/ostjh