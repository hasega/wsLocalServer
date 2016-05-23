package io.tempra;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.lang.reflect.Field;
import java.net.JarURLConnection;
import java.security.ProtectionDomain;
import java.util.Arrays;
import java.util.Enumeration;
/**
 * helper class to check the operating system this Java VM runs in
 *
 * please keep the notes below as a pseudo-license
 *
 * http://stackoverflow.com/questions/228477/how-do-i-programmatically-determine-operating-system-in-java
 * compare to http://svn.terracotta.org/svn/tc/dso/tags/2.6.4/code/base/common/src/com/tc/util/runtime/Os.java
 * http://www.docjar.com/html/api/org/apache/commons/lang/SystemUtils.java.html
 */
import java.util.Locale;
import java.util.concurrent.TimeUnit;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;

import javax.websocket.server.ServerContainer;

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
import org.glassfish.jersey.servlet.ServletContainer;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
public  class AppServer {
  /**
   * types of Operating Systems
   */
  public enum OSType {
    Windows, MacOS, Linux, Other
  };

  // cached result of OS detection
  protected static OSType detectedOS;

  /**
   * detect the operating system from the os.name System property and cache
   * the result
   * 
   * @returns - the operating system detected
   */
  public static OSType getOperatingSystemType() {
    if (detectedOS == null) {
      String OS = System.getProperty("os.name", "generic").toLowerCase(Locale.ENGLISH);
      if ((OS.indexOf("mac") >= 0) || (OS.indexOf("darwin") >= 0)) {
        detectedOS = OSType.MacOS;
      } else if (OS.indexOf("win") >= 0) {
        detectedOS = OSType.Windows;
      } else if (OS.indexOf("nux") >= 0) {
        detectedOS = OSType.Linux;
      } else {
        detectedOS = OSType.Other;
      }
    }
    return detectedOS;
  }

	public static void main(String[] args) throws Exception {

		try {
			// String dir = getProperty("storageLocal");//
			// System.getProperty("user.home");
			String arch = "Win" + System.getProperty("sun.arch.data.model");
			System.out.println("sun.arch.data.model " + arch);

			// Sample to force java load dll or so on a filesystem
			// InputStream in = AppServer.class.getResourceAsStream("/dll/" +
			// arch + "/RechargeRPC.dll");
			//
			// File jCliSiTefI = new File(dir + "/" + "RechargeRPC.dll");
			// System.out.println("Writing dll to: " +
			// jCliSiTefI.getAbsolutePath());
			// OutputStream os = new FileOutputStream(jCliSiTefI);
			// byte[] buffer = new byte[4096];
			// int length;
			// while ((length = in.read(buffer)) > 0) {
			// os.write(buffer, 0, length);
			// }
			// os.close();
			// in.close();
			// System.load(jCliSiTefI.toString());
			// addLibraryPath(dir);

		} catch (Exception e) {
			e.printStackTrace();
		}

		ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
		context.setContextPath("/");

		Server jettyServer = new Server(Integer.parseInt(getProperty("localport")));
		// security configuration
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

		// add application on embedded server
		boolean servApp = true;
		boolean quioskMode = false;

		// if (System.getProperty("noServApp") != null )
		// if (System.getProperty("noServApp").equalsIgnoreCase("true"))
		// servApp = false;
		if (servApp) {
			ProtectionDomain domain = AppServer.class.getProtectionDomain();
			String webDir = AppServer.class.getResource("/webapp").toExternalForm();
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
		// sample to add rest services on container
		ServletHolder jerseyServlet = context.addServlet(ServletContainer.class, "/services/*");
		jerseyServlet.setInitOrder(0);

		jerseyServlet.setInitParameter("jersey.config.server.provider.classnames",
				RestServices.class.getCanonicalName() + "," + RestServices.class.getCanonicalName());

		HandlerList handlers = new HandlerList();
		// context.addFilter(holder, "/*", EnumSet.of(DispatcherType.REQUEST));
		handlers.setHandlers(new Handler[] { resource_handler, context,

				// wscontext,
				new DefaultHandler() });
		jettyServer.setHandler(handlers);
		try {
			// Initialize javax.websocket layer
			ServerContainer wscontainer = WebSocketServerContainerInitializer.configureContext(context);
			wscontainer.setDefaultMaxSessionIdleTimeout(TimeUnit.HOURS.toMillis(1000));

			// Add WebSocket endpoint to javax.websocket layer
			wscontainer.addEndpoint(FileUpload.class);

		} catch (Throwable t) {
			t.printStackTrace(System.err);
		}

		// try {
		jettyServer.start();
		jettyServer.dump(System.err);

		if (servApp && quioskMode) {
			try {
				Process process = new ProcessBuilder("C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
						"--kiosk", "--kiosk-printing", "--auto", "--disable-pinch", "--incognito",
						"--disable-session-crashed-bubble", "--overscroll-history-navigation=0",
						"http://localhost:" + getProperty("localport")).start();
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
			// sample to handle params on a json string on a system properties
			String s = System.getenv("VERSATILE.CONFIG");
			org.json.simple.JSONObject json = (JSONObject) JSONValue.parse(s);

			return (String) json.get(string).toString();
		} catch (Exception e) {
			InputStream in = AppServer.class.getResourceAsStream("/properties.json");
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