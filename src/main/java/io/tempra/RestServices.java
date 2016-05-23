package io.tempra;

import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeoutException;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/certificate")
public class RestServices {

	static String defaultPrinter = null;

	static StringBuilder b = new StringBuilder();

	static long wait = 750;

	@GET
	@Path("status")
	@Produces(MediaType.TEXT_PLAIN)
	public boolean status() throws Exception {
		return true;

	}

	@GET
	@Path("restartPool")
	@Produces(MediaType.TEXT_PLAIN)
	public boolean restartPool() throws Exception {

		return false;
	}

	@GET
	@Path("statusFinish")
	@Produces(MediaType.TEXT_PLAIN)
	public boolean statusFinish() throws Exception {

		return false;

	}

	//
	@GET
	@Path("getCertificates")
	@Produces(MediaType.TEXT_PLAIN)
	public List initPrint() throws Exception {
		String[] a = VerCert.funcListaCertificados(true);
		ArrayList r = new ArrayList();
		for (int i = 0; i < a.length; i++) {
			Map<String, String> p = new HashMap<>();
			p.put(a[i], a[i]);
			r.add(p);
		}
		return r;

	}

	@GET
	@Path("append/{str}")
	@Produces(MediaType.TEXT_PLAIN)
	public void append(@PathParam("str") String str) {
		String s = (str + "\n");
		System.out.println(s);
		b.append(s);
	}

	@GET
	@Path("appendText/{str}")
	@Produces(MediaType.TEXT_PLAIN)
	public void appendText(@PathParam("str") String str) {
		String s = URLDecoder.decode(str);
		b.append(s);
	}

	@GET
	@Path("print")
	@Produces(MediaType.TEXT_PLAIN)
	public static boolean print() throws Exception {

		return false;
	}

	public abstract class TimeoutOperation {

		long timeOut = -1;
		String name = "Timeout Operation";

		public String getName() {
			return name;
		}

		public void setName(String name) {
			this.name = name;
		}

		public long getTimeOut() {
			return timeOut;
		}

		public void setTimeOut(long timeOut) {
			this.timeOut = timeOut;
		}

		public TimeoutOperation(String name, long timeout) {
			this.timeOut = timeout;
		}

		private Throwable throwable;
		private Object result;
		private long startTime;

		public Object run() throws TimeoutException, Exception {
			Thread operationThread = new Thread(getName()) {
				public void run() {
					try {
						result = doOperation();
					} catch (Exception ex) {
						throwable = ex;
					} catch (Throwable uncaught) {
						throwable = uncaught;
					}
					synchronized (TimeoutOperation.this) {
						TimeoutOperation.this.notifyAll();
					}
				}

				public synchronized void start() {
					super.start();
				}
			};
			operationThread.start();
			startTime = System.currentTimeMillis();
			synchronized (this) {
				while (operationThread.isAlive()
						&& (getTimeOut() == -1 || System.currentTimeMillis() < startTime + getTimeOut())) {
					try {
						wait(1000L);
					} catch (InterruptedException ex) {
					}
				}
			}
			if (throwable != null) {
				if (throwable instanceof Exception) {
					throw (Exception) throwable;
				} else if (throwable instanceof Error) {
					throw (Error) throwable;
				}
			}
			if (result != null) {
				return result;
			}
			if (System.currentTimeMillis() > startTime + getTimeOut()) {
				throw new TimeoutException("Operation '" + getName() + "' timed out after " + getTimeOut() + " ms");
			} else {
				throw new Exception("No result, no exception, and no timeout!");
			}
		}

		public abstract Object doOperation() throws Exception;
	}

}