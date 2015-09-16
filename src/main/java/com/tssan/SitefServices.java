package com.tssan;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import br.com.softwareexpress.sitef.JCliSiTefI;

@Path("/sitef")
public class SitefServices {

	@GET
	@Path("getCupon")
	@Produces(MediaType.TEXT_PLAIN)
	public String getCupon() {
		try {

			String rand = String.valueOf(System.currentTimeMillis());

			SitefEventSocket.getDB().getHashMap("sitef").put("cupon", rand);

			return rand;

		} catch (Exception e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}

		return null;

	}

	@GET
	@Path("setItem/{k}/{v}")
	@Produces(MediaType.TEXT_PLAIN)
	public Object setItem(@PathParam("k") String k, @PathParam("v") String v) {
		Object a = SitefEventSocket.getDB().getHashMap("sitef").put(k, v);
		SitefEventSocket.getDB().commit();
		return a;

	}

	@GET
	@Path("getItem/{k}")
	@Produces(MediaType.TEXT_PLAIN)
	public Object getItem(@PathParam("k") String k) {
		Object a = SitefEventSocket.getDB().getHashMap("sitef").get(k);
		SitefEventSocket.getDB().commit();
		return a;

	}

	@GET
	@Path("removeItem/{k}")
	@Produces(MediaType.TEXT_PLAIN)
	public Object removeItem(@PathParam("k") String k) {
		Object a = SitefEventSocket.getDB().getHashMap("sitef").remove(k);
		SitefEventSocket.getDB().commit();
		return a;

	}

	@GET
	@Path("pinpad_test")
	@Produces(MediaType.TEXT_PLAIN)
	public boolean test() {
		try {

			try {

				int result = new JCliSiTefI().verificaPresencaPinPad();
				String message = null;
				if (result == 0) {
					message = "Não existe um PinPad conectado ao micro.";
				} else if (result == -1) {
					message = "Biblioteca de acesso ao PinPad não encontrada.";
				}

				return result == 1;

			} catch (Exception e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}

			return false;

		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}

	}

}