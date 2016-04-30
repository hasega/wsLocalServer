package io.tempra;

import java.util.Map;

import javax.websocket.ClientEndpoint;
import javax.websocket.CloseReason;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketError;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;

@ClientEndpoint
@ServerEndpoint(value = "/events/")
public class SitefEventSocket {

	public SitefEventSocket() {

	}

	private String mapToString(Map<Object, String> m) {
		String s = "{";
		for (Object key : m.keySet()) {
			s += key + ":'" + m.get(key) + "';";
		}

		return s + "}";
	}

	@OnWebSocketMessage
	@OnMessage
	public void onWebSocketText(String message, Session sess) {
		try {
			message = message.replaceAll("'", "\"");
			org.json.simple.JSONObject json = (JSONObject) JSONValue.parse(message);

			System.out.println("Received TEXT 'message': " + message);

			if (json.get("action").toString().equalsIgnoreCase("iniciar")) {

				// exemplo on recieve message
			}

		} catch (Exception e) {
		}

	}

	@OnWebSocketClose
	public void onWebSocketClose(Session session, int statusCode, String reason) {
		System.out.println("Socket Closed: " + reason);
	}

	@OnClose
	public void onWebSocketClose(CloseReason reason) {
		System.out.println("Socket Closed: " + reason);

	}

	@OnOpen
	public void onWebSocketConnect(final Session sess) {

	}

	@OnWebSocketError
	@OnError
	public void onWebSocketError(Throwable cause) {
		cause.printStackTrace(System.err);
	}

}