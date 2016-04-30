package io.tempra;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URLDecoder;
import java.util.concurrent.TimeoutException;

import javax.print.PrintServiceLookup;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import com.zebra.sdk.comm.ConnectionException;
import com.zebra.sdk.printer.PrinterStatus;
import com.zebra.sdk.printer.ZebraPrinterFactory;

@Path("/zebra-print")
public class ZebraServices {

	static String defaultPrinter = null;

	static StringBuilder b = new StringBuilder();

	static long wait = 750;

	@GET
	@Path("status")
	@Produces(MediaType.TEXT_PLAIN)
	public boolean status() throws ConnectionException {
		com.zebra.sdk.comm.Connection myconnection = null;
		com.zebra.sdk.printer.ZebraPrinter myprinter = null;
		try {

			if (defaultPrinter == null) {
				defaultPrinter = PrintServiceLookup.lookupDefaultPrintService().getName();

			}
			myconnection = new com.zebra.sdk.comm.DriverPrinterConnection(defaultPrinter);
			myconnection.open();
			// UsbDiscoverer.getZebraDriverPrinters()

			myprinter = ZebraPrinterFactory.getInstance(myconnection);
			// myprinter.
			// myprinter.reset();
			PrinterStatus printerStatus = myprinter.getCurrentStatus();

			if (printerStatus.isReadyToPrint) {
				return true;
			} else if (printerStatus.isPaused) {
				return false;
			} else if (printerStatus.isHeadOpen) {
				return false;
			} else if (printerStatus.isPaperOut) {
				return false;
			} else {
				return false;
			}
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		} finally {
			// myconnection.close();

			myconnection.close();

		}

	}

	@GET
	@Path("restartPool")
	@Produces(MediaType.TEXT_PLAIN)
	public boolean restartPool() throws ConnectionException {

		String[] command = { "cmd.exe", "/c", "net", "stop", "Spooler" };
		try {
			Process process = new ProcessBuilder(command).start();
			InputStream inputStream = process.getInputStream();
			InputStreamReader inputStreamReader = new InputStreamReader(inputStream);
			BufferedReader bufferedReader = new BufferedReader(inputStreamReader);
			String line;
			while ((line = bufferedReader.readLine()) != null) {
				System.out.println(line);
			}

			String[] command2 = { "cmd.exe", "/c", "net", "start", "Spooler" };
			process = new ProcessBuilder(command2).start();
			inputStream = process.getInputStream();
			inputStreamReader = new InputStreamReader(inputStream);
			bufferedReader = new BufferedReader(inputStreamReader);
			while ((line = bufferedReader.readLine()) != null) {
				System.out.println(line);
			}
		} catch (Exception ex) {
			System.out.println("Exception : " + ex);
		}
		return false;
	}

	@GET
	@Path("statusFinish")
	@Produces(MediaType.TEXT_PLAIN)
	public boolean statusFinish() throws Exception {
		try {
			Object o = new TimeoutOperation("Test timeout", 40000) {
				public Object doOperation() throws Exception {
					com.zebra.sdk.comm.Connection myconnection = null;
					com.zebra.sdk.printer.ZebraPrinter myprinter = null;
					try {

						if (defaultPrinter == null) {
							defaultPrinter = PrintServiceLookup.lookupDefaultPrintService().getName();

						}
						myconnection = new com.zebra.sdk.comm.DriverPrinterConnection(defaultPrinter);
						myconnection.open();
						// UsbDiscoverer.getZebraDriverPrinters()

						myprinter = ZebraPrinterFactory.getInstance(myconnection);

						// myprinter.reset();
						PrinterStatus printerStatus = myprinter.getCurrentStatus();
						if (printerStatus.isReadyToPrint) {
							String v = AppServer.getProperty("waitPrint");

							myprinter.sendCommand(b.toString());
							if (v != null)
								Thread.currentThread().sleep(Long.valueOf(v));
							if (myprinter.getCurrentStatus().isReadyToPrint) {

								return true;
							} else {
								return false;
							}

						} else if (printerStatus.isPaused) {
							return false;
						} else if (printerStatus.isHeadOpen) {
							return false;
						} else if (printerStatus.isPaperOut) {
							return false;
						} else {
							return false;
						}
					} catch (Exception ex) {
						ex.printStackTrace();
					} finally {
						// myconnection.close();

						myconnection.close();

					}
					return false;
				}
			}.run();

			if (Boolean.valueOf(o.toString())) {

				return true;

			}
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
		return false;

	}

	//
	@GET
	@Path("initPrint")
	@Produces(MediaType.TEXT_PLAIN)
	public boolean initPrint() throws ConnectionException {

		try {
			b.delete(0, b.length());
			// b.append("^I8,A,003");

			return true;

		} catch (Exception e) {

			return false;
		}

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
		com.zebra.sdk.comm.Connection myconnection = null;
		com.zebra.sdk.printer.ZebraPrinter myprinter = null;
		if (defaultPrinter == null) {
			defaultPrinter = PrintServiceLookup.lookupDefaultPrintService().getName();

		}
		try {
			myconnection = new com.zebra.sdk.comm.DriverPrinterConnection(defaultPrinter);

			myconnection.open();
			// UsbDiscoverer.getZebraDriverPrinters()

			myprinter = ZebraPrinterFactory.getInstance(myconnection);
			// myprinter.
			// myprinter.reset();
			PrinterStatus printerStatus = myprinter.getCurrentStatus();

			if (printerStatus.isReadyToPrint) {
				myprinter.sendCommand(b.toString());
				return true;
			}
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} finally {
			// myconnection.close();

			myconnection.close();

		}
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