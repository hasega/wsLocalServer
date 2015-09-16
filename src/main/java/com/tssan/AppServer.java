package com.tssan;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.DefaultHandler;
import org.eclipse.jetty.server.handler.HandlerList;
import org.eclipse.jetty.server.handler.ResourceHandler;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.eclipse.jetty.websocket.jsr356.server.deploy.WebSocketServerContainerInitializer;
import org.ini4j.Wini;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;

import javax.websocket.server.ServerContainer;
import java.io.*;
import java.lang.reflect.Field;
import java.net.JarURLConnection;
import java.security.ProtectionDomain;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.concurrent.TimeUnit;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;

public class AppServer {

	public static void main(String[] args) throws Exception {

		try {
			String dir = getProperty("storageLocal");// System.getProperty("user.home");
			String arch = "Win" + System.getProperty("sun.arch.data.model");
			System.out.println("sun.arch.data.model " + arch);

			InputStream in = AppServer.class.getResourceAsStream("/dll/" + arch + "/RechargeRPC.dll");

			File jCliSiTefI = new File(dir + "/" + "RechargeRPC.dll");
			System.out.println("Writing dll to: " + jCliSiTefI.getAbsolutePath());
			OutputStream os = new FileOutputStream(jCliSiTefI);
			byte[] buffer = new byte[4096];
			int length;
			while ((length = in.read(buffer)) > 0) {
				os.write(buffer, 0, length);
			}
			os.close();
			in.close();
			System.load(jCliSiTefI.toString());

			in = AppServer.class.getResourceAsStream("/dll/" + arch + "/libemv.dll");
			jCliSiTefI = new File(dir + "/" + "libemv.dll");

			System.out.println("Writing dll to: " + jCliSiTefI.getAbsolutePath());
			os = new FileOutputStream(jCliSiTefI);
			buffer = new byte[4096];
			length = 0;
			while ((length = in.read(buffer)) > 0) {
				os.write(buffer, 0, length);
			}
			os.close();
			in.close();
			System.load(jCliSiTefI.toString());

			in = AppServer.class.getResourceAsStream("/dll/" + arch + "/libseppemv.dll");
			jCliSiTefI = new File(dir + "/" + "libseppemv.dll");
			System.out.println("Writing dll to: " + jCliSiTefI.getAbsolutePath());
			os = new FileOutputStream(jCliSiTefI);
			buffer = new byte[4096];
			length = 0;
			while ((length = in.read(buffer)) > 0) {
				os.write(buffer, 0, length);
			}
			os.close();
			in.close();
			System.load(jCliSiTefI.toString());

			in = AppServer.class.getResourceAsStream("/dll/CliSiTef.ini");
			jCliSiTefI = new File(dir + "/" + "CliSiTef.ini");
			System.out.println("Writing ini to: " + jCliSiTefI.getAbsolutePath());
			os = new FileOutputStream(jCliSiTefI);
			buffer = new byte[4096];
			length = 0;
			while ((length = in.read(buffer)) > 0) {
				os.write(buffer, 0, length);
			}
			os.close();
			in.close();

			Wini ini = new Wini(new File(dir + "/CliSiTef.ini"));

			ini.put("PinPadCompartilhado", "Porta", "04");
			ini.put("PinPad", "Mensagempadrao", getProperty("pinpad_label"));
			ini.put("Geral", "TransacoesHabilitadas", getProperty("sitef_operacoes"));
			ini.store();

			in = AppServer.class.getResourceAsStream("/dll/" + arch + "/CliSiTef32I.dll");
			jCliSiTefI = new File(dir + "/" + "CliSiTef32I.dll");

			System.out.println("Writing dll to: " + jCliSiTefI.getAbsolutePath());
			os = new FileOutputStream(jCliSiTefI);
			buffer = new byte[4096];
			length = 0;
			while ((length = in.read(buffer)) > 0) {
				os.write(buffer, 0, length);
			}
			os.close();
			in.close();
			System.load(jCliSiTefI.toString());

			in = AppServer.class.getResourceAsStream("/dll/" + arch + "/CliSiTef32.dll");
			jCliSiTefI = new File(dir + "/" + "CliSiTef32.dll");
			System.out.println("Writing dll to: " + jCliSiTefI.getAbsolutePath());
			os = new FileOutputStream(jCliSiTefI);
			buffer = new byte[4096];
			length = 0;
			while ((length = in.read(buffer)) > 0) {
				os.write(buffer, 0, length);
			}
			os.close();
			in.close();
			System.load(jCliSiTefI.toString());

			in = AppServer.class.getResourceAsStream("/dll/" + arch + "/jCliSiTefI.dll");
			jCliSiTefI = new File(dir + "/" + "jCliSiTefI.dll");
			System.out.println("Writing dll to: " + jCliSiTefI.getAbsolutePath());
			os = new FileOutputStream(jCliSiTefI);
			buffer = new byte[4096];
			length = 0;
			while ((length = in.read(buffer)) > 0) {
				os.write(buffer, 0, length);
			}
			os.close();
			in.close();

			System.load(jCliSiTefI.toString());

			addLibraryPath(dir);

			in = AppServer.class.getResourceAsStream("/dll/" + arch + "/zDriverAdapter.dll");
			jCliSiTefI = new File(dir + "/" + "zDriverAdapter.dll");
			System.out.println("Writing dll to: " + jCliSiTefI.getAbsolutePath());
			os = new FileOutputStream(jCliSiTefI);
			buffer = new byte[4096];
			length = 0;
			while ((length = in.read(buffer)) > 0) {
				os.write(buffer, 0, length);
			}
			os.close();
			in.close();

			System.load(jCliSiTefI.toString());

			addLibraryPath(dir);

			// in = AppServer.class.getResourceAsStream("/ini.exe");
			// jCliSiTefI = new File(dir + "/"
			// + "ini.exe");
			// System.out.println("Writing exe to: "
			// + jCliSiTefI.getAbsolutePath());
			// os = new FileOutputStream(jCliSiTefI);
			// buffer = new byte[4096];
			// length = 0;
			// while ((length = in.read(buffer)) > 0) {
			// os.write(buffer, 0, length);
			// }
			// os.close();
			// in.close();

			in = AppServer.class.getResourceAsStream("/LocalServer.jar");
			jCliSiTefI = new File(dir + "/" + "LocalServer.jar");
			System.out.println("Writing exe to: " + jCliSiTefI.getAbsolutePath());
			os = new FileOutputStream(jCliSiTefI);
			buffer = new byte[4096];
			length = 0;
			while ((length = in.read(buffer)) > 0) {
				os.write(buffer, 0, length);
			}
			os.close();
			in.close();

		} catch (Exception e) {
			e.printStackTrace();
		}

		ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
		context.setContextPath("/");

		// context.addServlet(SitefEventSocketServlet.class, "/events");

		// WebSocketHandler wsHandler = new WebSocketHandler() {
		// @Override
		// public void configure(WebSocketServletFactory factory) {
		// factory.register(SitefEventSocket.class);
		// }
		// };
		//
		// ContextHandler wscontext = new ContextHandler();
		// wscontext.setContextPath("/events");
		// wscontext.setHandler(wsHandler);
		// server.addHandler(context);

		Server jettyServer = new Server(Integer.parseInt(getProperty("localport")));
		// jettyServer.setHandler(context);

		// FilterHolder holder = new FilterHolder(CrossOriginFilter.class);
		// holder.setInitParameter(CrossOriginFilter.ALLOWED_ORIGINS_PARAM,
		// "*");
		// holder.setInitParameter("allowCredentials", "true");
		// holder.setInitParameter(
		// CrossOriginFilter.ACCESS_CONTROL_ALLOW_ORIGIN_HEADER, "*");
		// holder.setInitParameter(CrossOriginFilter.ALLOWED_METHODS_PARAM,
		// "GET,POST,HEAD");
		// holder.setInitParameter(CrossOriginFilter.ALLOWED_HEADERS_PARAM,
		// "X-Requested-With,Content-Type,Accept,Origin");
		// holder.setName("cross-origin");

		// context.addFilter(holder, fm);

		ResourceHandler resource_handler = new ResourceHandler();
		boolean servApp = true;
		// if (System.getProperty("noServApp") != null )
		// if (System.getProperty("noServApp").equalsIgnoreCase("true"))
		// servApp = false;
		if (servApp) {
			ProtectionDomain domain = AppServer.class.getProtectionDomain();
			String webDir = AppServer.class.getResource("/app").toExternalForm();
			System.out.println("Jetty WEB DIR >>>>" + webDir);
			resource_handler.setDirectoriesListed(true);
			resource_handler.setWelcomeFiles(new String[] { "index.html" });
			resource_handler.setResourceBase(webDir); //
			// "C:/git/tsAgenciaVirtual/www/");
			// resource_handler.setResourceBase("C:/git/tsAgenciaVirtual/www/");

			// copyJarResourceToFolder((JarURLConnection) AppServer.class
			// .getResource("/app").openConnection(), createTempDir("app"));

			// resource_handler.setResourceBase(System
			// .getProperty("java.io.tmpdir") + "/app");
		}

		ServletHolder jerseyServlet = context.addServlet(org.glassfish.jersey.servlet.ServletContainer.class,
				"/services/*");
		jerseyServlet.setInitOrder(0);

		jerseyServlet.setInitParameter("jersey.config.server.provider.classnames",
				ZebraServices.class.getCanonicalName() + "," + SitefServices.class.getCanonicalName());

		HandlerList handlers = new HandlerList();
		// context.addFilter(holder, "/*", EnumSet.of(DispatcherType.REQUEST));
		handlers.setHandlers(
				new Handler[] { resource_handler, context,

				// wscontext,
				new DefaultHandler() });
		jettyServer.setHandler(handlers);

		// para usar javax.websocket // ServerContainer wscontainer = //
		// WebSocketServerContainerInitializer.configureContext(context);

		// Add WebSocket endpoint to javax.websocket layer //
		// wscontainer.addEndpoint(SitefEventSocket.class);
		try {
			// Initialize javax.websocket layer
			ServerContainer wscontainer = WebSocketServerContainerInitializer.configureContext(context);
			wscontainer.setDefaultMaxSessionIdleTimeout(TimeUnit.HOURS.toMillis(1000));

			// Add WebSocket endpoint to javax.websocket layer
			wscontainer.addEndpoint(SitefEventSocket.class);

		} catch (Throwable t) {
			t.printStackTrace(System.err);
		}

		// try {
		jettyServer.start();
		jettyServer.dump(System.err);

		if (servApp) {
			try {
			Process process = new ProcessBuilder("C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
					"--kiosk", "--kiosk-printing", "--auto", "--disable-pinch", "--incognito",
					"--disable-session-crashed-bubble", "--overscroll-history-navigation=0", "http://localhost:"+getProperty("localport"))
							.start();
			//
			// Process process =
			// Runtime.getRuntime().exec(" -kiosk http://localhost:8080");
			InputStream is = process.getInputStream();
			InputStreamReader isr = new InputStreamReader(is);
			BufferedReader br = new BufferedReader(isr);
			String line;

			System.out.printf("Output of running %s is:", Arrays.toString(args));
			while ((line = br.readLine()) != null) {
				System.out.println(line);
			}
		}
		
		catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
		}
		}
		// } finally {
		// jettyServer.destroy();
		// }//}

		jettyServer.join();
	}

	/**
	 * Adds the specified path to the java library path
	 *
	 * @param pathToAdd
	 *            the path to add
	 * @throws Exception
	 */
	public static void addLibraryPath(String pathToAdd) throws Exception {
		final Field usrPathsField = ClassLoader.class.getDeclaredField("usr_paths");
		usrPathsField.setAccessible(true);

		// get array of paths
		final String[] paths = (String[]) usrPathsField.get(null);

		// check if the path to add is already present
		for (String path : paths) {
			if (path.equals(pathToAdd)) {
				return;
			}
		}

		// add the new path
		final String[] newPaths = Arrays.copyOf(paths, paths.length + 1);
		newPaths[newPaths.length - 1] = pathToAdd;
		usrPathsField.set(null, newPaths);
	}

	public static void copyJarResourceToFolder(JarURLConnection jarConnection, File destDir) {

		try {
			JarFile jarFile = jarConnection.getJarFile();

			/**
			 * Iterate all entries in the jar file.
			 */
			for (Enumeration<JarEntry> e = jarFile.entries(); e.hasMoreElements();) {

				JarEntry jarEntry = e.nextElement();
				String jarEntryName = jarEntry.getName();
				String jarConnectionEntryName = jarConnection.getEntryName();

				/**
				 * Extract files only if they match the path.
				 */
				if (jarEntryName.startsWith(jarConnectionEntryName)) {

					String filename = jarEntryName.startsWith(jarConnectionEntryName)
							? jarEntryName.substring(jarConnectionEntryName.length()) : jarEntryName;
					File currentFile = new File(destDir, filename);

					if (jarEntry.isDirectory()) {
						currentFile.mkdirs();
					} else {
						InputStream is = jarFile.getInputStream(jarEntry);
						OutputStream out = FileUtils.openOutputStream(currentFile);
						IOUtils.copy(is, out);
						is.close();
						out.close();
					}
				}
			}
		} catch (IOException e) {
			// TODO add logger
			e.printStackTrace();
		}

	}

	public static File createTempDir(String prefix) throws IOException {
		String tmpDirStr = System.getProperty("java.io.tmpdir");
		if (tmpDirStr == null) {
			throw new IOException("System property 'java.io.tmpdir' does not specify a tmp dir");
		}

		File tmpDir = new File(tmpDirStr);
		if (!tmpDir.exists()) {
			boolean created = tmpDir.mkdirs();
			if (!created) {
				throw new IOException("Unable to create tmp dir " + tmpDir);
			}
		}

		File resultDir = null;
		int suffix = (int) System.currentTimeMillis();
		int failureCount = 0;
		do {
			resultDir = new File(tmpDir, prefix + suffix % 10000);
			suffix++;
			failureCount++;
		} while (resultDir.exists() && failureCount < 50);

		if (resultDir.exists()) {
			throw new IOException(
					failureCount + " attempts to generate a non-existent directory name failed, giving up");
		}
		boolean created = resultDir.mkdir();
		if (!created) {
			throw new IOException("Failed to create tmp directory");
		}
		return resultDir;
	}

	public static String getProperty(String string) {
		// TODO Auto-generated method stub
		try {

			String s = System.getenv("TOTEM.CONFIG");

			org.json.simple.JSONObject json = (JSONObject) JSONValue.parse(s);

			return (String) json.get(string).toString();
		} catch (Exception e) {
			InputStream in = AppServer.class.getResourceAsStream("/app/js/properties.json");
			org.json.simple.JSONObject json = null;
			try {
				String s = convertStreamToString(in);
				json = (JSONObject) JSONValue.parse(s);
			} catch (Exception e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}

			return (String) json.get(string);
		}

	}

	static String convertStreamToString(java.io.InputStream is) {
		java.util.Scanner s = new java.util.Scanner(is).useDelimiter("\\A");
		return s.hasNext() ? s.next() : "";
	}
}