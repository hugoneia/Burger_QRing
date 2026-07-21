### INTRODUCCIÓN  
La app pretende generar un QR válido para poder usarse en la maquina expendedora de refresco de la cadena BK.  

Cuando realizas una compra que incluye bebida ilimitada, en el ticket, aparece un QR que se valida en un lector situado en la máquina de refrescos.  

El QR está disponible para usarse durante 60 minutos y rellenar el vaso las veces que quieras.  

La idea es escanear el QR del ticket para mantener una copia del mismo por si se moja, estropea o pierde durante esos 60 minutos. Se podría intentar generar uno a partir de uno expirado poniendo la fecha/hora de tu compra. 

La cadena de texto que devuelve el QR escaneado es como los siguientes ejemplos:

Ejemplos:  
**Albacete**   
*19434,104550395,20260712202600,ada092e67430cc3b3d40c457d799e1d0*  

**Toledo**  
*25228,100670035,20250718132400,e22b37364afbf2cc569367f73cd20135*  



Y tiene la siguiente configuración:  


Bloque     | Valor
-------- | -----
XXXXX					  | código BK (arriba ticket)
XXXXXXYYY 			| ID venta + PEDIDO
XXXXXXXXXXXXXX  | fecha/hora
XafXafXafXaf    | Hash MD5  

  



### MODO DE USO  
Al abrir la app puedes escanear un QR o introducir la cadena manualmente (si eres un robot, claro).  

Una vez muestra el resultado puedes modificar la cadena manualmente si quieres modificar el 'código BK' (establecimiento), modificar fecha/hora con los selectores o pulsar botón para obtener la fecha/hora actual.  

Al pulsar el icono de 'info' se muestra la misma información de bloque/valor que se ha visto antes.  

El QR se actualiza automáticamente al introducir cambios y se puede recuperar el original pulsando 'restablecer'.  

### DISCLAIMER
App realizada como fines didacticos. No usar con otros fines que no sean el mantener una copia de tu ticket original.
