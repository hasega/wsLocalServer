package io.tempra.coders;

import javax.websocket.EncodeException;
import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;

import com.google.gson.Gson;

import io.tempra.files.ListFiles;

public class JsonEncoder implements Encoder.Text<ListFiles> {

	@Override
	public void init(EndpointConfig endpointConfig) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void destroy() {
		// TODO Auto-generated method stub
		
	}

	@Override
	public String encode(ListFiles files) throws EncodeException {
		Gson gson = new Gson();
		String result = gson.toJson(files.getFiles());
		return result;
	}

}
