package com.tssan;

import java.io.File;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.Security;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;
import java.util.Map;

import javax.websocket.ClientEndpoint;
import javax.websocket.CloseReason;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Invocation.Builder;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status.Family;

import org.apache.commons.codec.binary.Base64;
import org.bouncycastle.util.encoders.Hex;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketError;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import org.mapdb.DB;
import org.mapdb.DBMaker;

import com.tssan.tef.cons.ReturnContinuaFuncaoSiTefInterativo;
import com.tssan.tef.cons.ReturnIniciaFuncaoSiTefInterativo;
import com.tssan.tef.cons.TiposCamposTEFConstant;
import com.tssan.tef.cons.TiposColetaDadosTEFConstant;
import com.tssan.tef.cons.TiposComandosTEFConstant;
import com.tssan.tef.cons.TiposConfirmacaoTEFConstant;

import br.com.softwareexpress.sitef.JCliSiTefI;

@ClientEndpoint
@ServerEndpoint(value = "/events/")
public class SitefEventSocket {

	public SitefEventSocket() {

	}

	private static JCliSiTefI tef;

	private Boolean transacaoConfirmada = false;

	private static Boolean debugMode = true;
	private Boolean lockThread = false;
	private Thread threadTransacao;

	// private String dataTransacao = "";

	private int ultimoRet = -1;

	public int codigoTransacaoPagamento = 0;
	public int codigoTransacaoCancelamento = 110;
	public int codigoTransacaoReimpressao = 110;
	public int codigoTransacaoContingencia = 110;

	private boolean finalizavel = false;

	private static DB db = null;

	public void reset() {
		try {
			getDB().createHashMap("sitef").make().clear();
		} catch (Exception e) {
		}
		transacaoConfirmada = false;
		lockThread = false;
		ultimoRet = -1;
		finalizavel = false;
	}

	static DB getDB() {
		// TODO Auto-generated method stub
		if (db == null)
			db = DBMaker.newFileDB(new File(AppServer.getProperty("storageLocal") + "/sitefDatabase.db"))
					.closeOnJvmShutdown().encryptionEnable("12344321").make();
		return db;

	}

	private void addDadosRecebidos(Object c, String v) {
		if (getDadosRecebidos().containsKey(c)) {
			getDadosRecebidos().remove(c);
		}
		getDadosRecebidos().put(c, v);
	}

	// private void iniciarTransacaoTEF() {
	// int idEntidade = getFatura();
	// if (idEntidade <= -1) {
	// idEntidade = getGuia();
	// }
	// // getJSContext().call("iniciarTransacaoTEF", new
	// // Object[]{idTransacaoTEF, idTransacaoTEFOriginal, idTipoTransacaoTEF,
	// // idEntidade});
	// }

	private void atualizarDadosTransacaoTEF(Session sess) {
		// getJSContext().call("atualizarDadosTransacaoTEF", new
		// Object[]{ultimoRet, mapToString(getDadosRecebidos())});

		try {
			sess.getBasicRemote().sendText("-5" + "§" + mapToString(getDadosRecebidos()) + "§" + getTEF().getTipoCampo()
					+ "§" + getTEF().getTamanhoMinimo() + "§" + getTEF().getTamanhoMaximo());
		} catch (Exception e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
	}

	private static void trace(String t) {
		if (isDebugMode()) {
			System.out.println(t);
		}
	}

	private static void error(String t) {
		if (isDebugMode()) {
			// getJSContext().call("error", new Object[]{t});
		}
	}

	private static void gerarException(String m) {
		error(m);
		// getJSContext().call("gerarException", new Object[]{m});
	}

	private void emitirComprovanteCliente(Session sess) {
		String viaCliente = getDadosRecebidos().get(TiposCamposTEFConstant.BUFFER_VIA_CLIENTE);
		try {
			sess.getBasicRemote().sendText("-3" + "§" + viaCliente + "§" + 0 + "§" + 0 + "§" + 0);
		} catch (Exception e) {
			e.printStackTrace();
		}

		// getJSContext().call("emitirComprovanteCliente", new
		// Object[]{viaCliente});
	}

	private void emitirComprovanteCompleto(Session sess) {
		String viaCaixa = getDadosRecebidos().get(TiposCamposTEFConstant.BUFFER_VIA_CAIXA);
		String viaCliente = getDadosRecebidos().get(TiposCamposTEFConstant.BUFFER_VIA_CLIENTE);
		try {
			sess.getBasicRemote().sendText("-3" + "§" + viaCliente + "§" + viaCaixa + "§" + 0 + "§" + 0);
		} catch (Exception e) {
			e.printStackTrace();
		}

	}

	public static synchronized void configureTEF() {
		try {
			String ipServidor = AppServer.getProperty("ipServidor");
			String codigoLoja = AppServer.getProperty("codigoLoja");
			String numeroTerminal = AppServer.getProperty("numeroTerminal");

			trace("configureTEF -> ipServidor: " + ipServidor + " codigoLoja: " + codigoLoja + " numeroTerminal: "
					+ numeroTerminal);

			if (getTEF() != null) {
				getTEF().setEnderecoSiTef(ipServidor);
				getTEF().setCodigoLoja(codigoLoja);
				getTEF().setNumeroTerminal(numeroTerminal);
				getTEF().setConfiguraResultado(0);
				getTEF().setParametrosAdicionais("[VersaoAutomacaoCielo=ODEBRECH10]");

				getTEF().configuraIntSiTefInterativo();

				trace("configureTEF -> realizado com sucesso");
			}

		} catch (Exception e) {
			e.printStackTrace();
			gerarException(e.getMessage());
		}

	}

	public void iniciarTransacaoTEFPagamento(Session WSSession, String valor, String numeroCupomFiscal,
			String dataFiscal, String horaFiscal, String operador, String produtos) {
		if (getTEF().obtemQuantidadeTransacoesPendentes() > 0) {
			getTEF().setConfirma(TiposConfirmacaoTEFConstant.TRANSACAO_CANCELADA);
			getTEF().finalizaTransacaoSiTefInterativo();
		}

		try {
			if (getTEF() != null) {
				reset();
				getTEF().setModalidade(codigoTransacaoPagamento);

				getTEF().setValor(valor);

				getTEF().setNumeroCuponFiscal(numeroCupomFiscal);
				getTEF().setDataFiscal(dataFiscal);
				try {
					WSSession.getBasicRemote()
							.sendText(98 + "§sitef.data:" + dataFiscal + "§" + "" + "§" + "" + "§" + "");
				} catch (Exception e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				}
				getTEF().setHorario(horaFiscal);
				try {
					WSSession.getBasicRemote()
							.sendText(98 + "§sitef.hora:" + horaFiscal + "§" + "" + "§" + "" + "§" + "");
				} catch (Exception e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				}
				getTEF().setOperador(operador);
				getTEF().setRestricoes("");
				getTEF().setProdutos(produtos);
				// getTEF().setParametrosAdicionais("{TipoTratamento=4}");

				getTEF().setBuffer("");
				getTEF().setContinuaNavegacao(TiposColetaDadosTEFConstant.NORMAL);

				// idTransacaoTEF = Integer.parseInt(numeroCupomFiscal);
				ultimoRet = getTEF().iniciaFuncaoAASiTefInterativo();

				trace("iniciarTransacaoTEFPagamento -> modalidade: " + codigoTransacaoPagamento + " valor: " + valor
						+ " numeroCumpoFiscal: " + numeroCupomFiscal + " dataFiscal: " + dataFiscal + " horaFiscal: "
						+ horaFiscal + " operador:" + operador + " retorno: " + ultimoRet);

				if (ultimoRet == ReturnIniciaFuncaoSiTefInterativo.SEM_ERRO) {
					// iniciarTransacaoTEF();
					continuarTransacaoTEF(WSSession);
				} else {
					trace("Erro ao iniciar nova transação TEF: " + ultimoRet);
					reset();
					iniciarTransacaoTEFPagamento(WSSession, valor, numeroCupomFiscal, dataFiscal, horaFiscal, operador,
							produtos);
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			gerarException(e.getMessage());
		}
	}

	public void iniciarTransacaoTEFReimpressao(Session WSSession, String numeroCupomFiscal,
			String numeroCupomFiscalOriginal, String codigoNSU, String dataTransacao) {
		try {
			if (getTEF() != null) {
				reset();

				getTEF().setModalidade(codigoTransacaoReimpressao);

				getTEF().setValor("");
				getTEF().setNumeroCuponFiscal("");
				getTEF().setDataFiscal("");
				getTEF().setHorario("");
				getTEF().setOperador("");
				getTEF().setRestricoes("");

				getTEF().setParametrosAdicionais("{TipoTratamento=4}");

				getTEF().setBuffer("");
				getTEF().setContinuaNavegacao(TiposColetaDadosTEFConstant.NORMAL);

				// idTransacaoTEF = Integer.parseInt(numeroCupomFiscal);
				// idTransacaoTEFOriginal = Integer
				// .parseInt(numeroCupomFiscalOriginal);
				ultimoRet = getTEF().iniciaFuncaoSiTefInterativo();

				trace("iniciarTransacaoTEFReimpressao ->   modalidade: " + codigoTransacaoReimpressao + " codigoNSU: "
						+ codigoNSU + " dataTransacao: " + dataTransacao + " retorno: " + ultimoRet);

				if (ultimoRet == ReturnIniciaFuncaoSiTefInterativo.SEM_ERRO) {
					// iniciarTransacaoTEF();
					continuarTransacaoTEF(WSSession);
				} else {
					throw new Exception("Erro ao iniciar nova transação TEF: " + ultimoRet);
				}
			}
		} catch (Exception e) {
			gerarException(e.getMessage());
		}
	}

	public String getVersaoTEF() {
		try {
			if (getTEF() != null) {
				// return "getTEF(): " + getTEF().getver() + " getTEF()I: " +
				// getTEF().getVersaogetTEF()I() + " Version: " +
				// getTEF().getVersion();
			}

		} catch (Exception e) {
			gerarException(e.getMessage());
		}
		return "INDEFINIDA";
	}

	public void iniciarTransacaoTEFCancelamento(Session WSSession, String numeroCupomFiscal,
			String numeroCupomFiscalOriginal, String valorTransacao, String codigoNSU, String dataTransacao) {
		try {
			if (getTEF() != null) {
				reset();
				// this.valorTransacao = valorTransacao;
				// this.codigoNSU = codigoNSU;
				// // this.dataTransacao = dataTransacao;
				//
				// idTipoTransacaoTEF = TiposTransacaoTEFConstant.CANCELAMENTO;
				getTEF().setModalidade(codigoTransacaoCancelamento);

				getTEF().setValor("");
				getTEF().setNumeroCuponFiscal("");
				getTEF().setDataFiscal("");
				getTEF().setHorario("");
				getTEF().setOperador("");
				getTEF().setRestricoes("");

				getTEF().setParametrosAdicionais("{TipoTratamento=4}");

				getTEF().setBuffer("");
				getTEF().setContinuaNavegacao(TiposColetaDadosTEFConstant.NORMAL);

				// idTransacaoTEF = Integer.parseInt(numeroCupomFiscal);
				// idTransacaoTEFOriginal = Integer
				// .parseInt(numeroCupomFiscalOriginal);

				ultimoRet = getTEF().iniciaFuncaoSiTefInterativo();

				trace("iniciarTransacaoTEFCancelamento ->" + " modalidade: " + codigoTransacaoReimpressao
						+ " codigoNSU: " + codigoNSU + " dataTransacao: " + dataTransacao + " valorTransacao: "
						+ valorTransacao + " retorno: " + ultimoRet);

				if (ultimoRet == ReturnIniciaFuncaoSiTefInterativo.SEM_ERRO) {
					// iniciarTransacaoTEF();
					continuarTransacaoTEF(WSSession);
				} else {
					throw new Exception("Erro ao iniciar nova transacao TEF: " + ultimoRet);
				}
			}
		} catch (Exception e) {
			gerarException(e.getMessage());
		}
	}

	private void continuarTransacaoTEF(final Session sess) {

		threadTransacao = new Thread(new Runnable() {

			public void run() {
				try {
					getTEF().setBuffer("");

					getTEF().setContinuaNavegacao(TiposColetaDadosTEFConstant.NORMAL);

					while ((ultimoRet = getTEF()
							.continuaFuncaoSiTefInterativo()) == ReturnContinuaFuncaoSiTefInterativo.SEM_ERRO) {
						traceStep();

						String ret = getTEF().getBuffer().replaceAll("(\r\n|\n)", "<br />");
						int proximoComando = getTEF().getProximoComando();
						if (proximoComando == TiposComandosTEFConstant.ARMAZENAR_VALOR) {
							addDadosRecebidos(getTEF().getTipoCampo(), getTEF().getBuffer());
						} else if (proximoComando >= 20 && proximoComando != 23 && proximoComando != 22) {
							send(sess);
							lockThread = true;

						} else {
							send(sess);

						}
						int sec = 0;
						while (lockThread) {
							sec++;
							threadTransacao.sleep(1000);

							if (sec == 60) {

								trace("timeout 60 ->  " + " proximoComando: " + getTEF().getProximoComando()
										+ " retorno: " + ultimoRet + " tipoCampo: " + getTEF().getTipoCampo()
										+ " buffer: " + getTEF().getBuffer());
								break;
							} else
								trace("aguardado ->  " + " proximoComando: " + getTEF().getProximoComando()
										+ " retorno: " + ultimoRet + " tipoCampo: " + getTEF().getTipoCampo()
										+ " buffer: " + getTEF().getBuffer());
						}

					}
					finalizavel = true;
					if (ultimoRet == ReturnContinuaFuncaoSiTefInterativo.TRANSACAO_CONCLUIDA_SEM_ERRO) {
						atualizarDadosTransacaoTEF(sess);
						emitirComprovantes(sess);
					}
					try {
						sess.getBasicRemote().sendText(100 + "§" + ultimoRet + "§" + "" + "§" + "" + "§" + "");
					} catch (Exception e1) {
						// TODO Auto-generated catch block
						e1.printStackTrace();
					}

				} catch (Exception e) {
					gerarException(e.getMessage());
				}
			}

			private void send(final Session sess) {
				try {
					sess.getBasicRemote()
							.sendText(getTEF().getProximoComando() + "§" + getTEF().getBuffer() + "§"
									+ getTEF().getTipoCampo() + "§" + getTEF().getTamanhoMinimo() + "§"
									+ getTEF().getTamanhoMaximo());
				} catch (Exception e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				}
			}

			private void traceStep() {
				trace("continuarTransacaoTEF -> " + " proximoComando: " + getTEF().getProximoComando() + " retorno: "
						+ ultimoRet + " tipoCampo: " + getTEF().getTipoCampo() + " buffer: " + getTEF().getBuffer());
			}
		});

		threadTransacao.start();

	}

	private void emitirComprovantes(Session sess) {
		// if (getPerfilTEF().emitirComprovanteCaixa.equals("S")) {
		// emitirComprovanteCompleto(sess);
		// } else {
		emitirComprovanteCliente(sess);
		// }

	}

	public static void obterQtdPendenteTransacoesTEF(String numeroCupomOriginal, int idTipoTransacaoTEFOriginal,
			String dataFiscal, String horaFiscal, boolean finalizavel) {
		try {

			if (getTEF() != null) {
				getTEF().setNumeroCuponFiscal(numeroCupomOriginal);
				getTEF().setDataFiscal(dataFiscal);
				getTEF().setHorario(horaFiscal);
				int qtd = getTEF().obtemQuantidadeTransacoesPendentes();
				trace("obterQtdPendenteTransacoesTEF -> numeroCupomOriginal: " + numeroCupomOriginal
						+ " idTipoTransacaoTEFOriginal: " + idTipoTransacaoTEFOriginal + " dataFiscal: " + dataFiscal
						+ " horaFiscal: " + horaFiscal + " qtdPendente: " + qtd);
				if (qtd > 0) {
					if (finalizavel) {
						confirmarTransacao(numeroCupomOriginal, idTipoTransacaoTEFOriginal);
						// gerarPopUpConfirmacaoTransacao(numeroCupomOriginal,
						// idTipoTransacaoTEFOriginal);
					} else {
						cancelarConfirmarTransacao(numeroCupomOriginal, idTipoTransacaoTEFOriginal);
						// gerarPopUpConfirmacaoCancelamento(numeroCupomOriginal,
						// idTipoTransacaoTEFOriginal);
					}
				}
			}

		} catch (Exception e) {
			gerarException(e.getMessage());
		}

	}

	private static String readNumeroTerminal() throws Exception {

		return AppServer.getProperty("numeroTerminal");

	}

	public void cancelarConfirmarTransacao() {
		cancelarConfirmarTransacao(null, -1);
	}

	public static void cancelarConfirmarTransacao(String numeroCupomOriginal, int idTipoTransacaoTEFOriginal) {
		try {
			if (getTEF() != null) {
				getTEF().setConfirma(TiposConfirmacaoTEFConstant.TRANSACAO_CANCELADA);
				getTEF().finalizaTransacaoSiTefInterativo();
				cancelarbaixaTSOne();
				trace("cancelarConfirmarTransacao");
			}
		} catch (Exception e) {
			gerarException(e.getMessage());
		}
	}

	public static void confirmarTransacao() {
		confirmarTransacao(null, -1);
	}

	public static String sign(String fileToSign) throws Exception {
		Security.addProvider(new org.bouncycastle.jce.provider.BouncyCastleProvider());

		Security.addProvider(new com.sun.net.ssl.internal.ssl.Provider());

		Signature signature = Signature.getInstance("SHA256withRSA");
		signature.initSign(getPrivate("TOTEM"));
		signature.update(fileToSign.getBytes());
		return Hex.toHexString(signature.sign());
	}

	//

	public static PrivateKey getPrivate(String sig) throws Exception {

		String privKeyPEM = AppServer.convertStreamToString(AppServer.class.getResourceAsStream("/app/js/TOTEM.pem"))
				.replace("-----BEGIN RSA PRIVATE KEY-----\n", "");
		privKeyPEM = privKeyPEM.replace("-----END RSA PRIVATE KEY-----", "");
		byte[] encoded = Base64.decodeBase64(privKeyPEM);
		PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(encoded);
		KeyFactory kf = KeyFactory.getInstance("RSA");
		return kf.generatePrivate(spec);
	}

	public static void confirmarTransacao(String numeroCupomOriginal, int idTipoTransacaoTEFOriginal) {
		try {
			if (getTEF() != null) {
				getTEF().setConfirma(TiposConfirmacaoTEFConstant.TRANSACAO_CONFIRMADA);
				getTEF().finalizaTransacaoSiTefInterativo();

			}
		} catch (Exception e) {
			gerarException(e.getMessage());
		}
	}

	public static boolean baixarTSOne() throws Exception {
		Client client = ClientBuilder.newClient();

		String server = AppServer.getProperty("server"); // "app.odebrechtambiental.com";
		String port = AppServer.getProperty("port"); // "8443";
		String serviceBase = AppServer.getProperty("serviceBase"); // "tsOneServices/rest/avServices";
		String urlMaster = serviceBase;
		urlMaster = urlMaster + "/pagamentoTEF/" + getDadosRecebidos().get("sitef.idCidade");

		urlMaster = urlMaster + "/" + getDadosRecebidos().get("sitef.cupon");

		urlMaster = urlMaster + "/" + getDadosRecebidos().get("sitef.faturas");
		urlMaster = urlMaster + "/" + AppServer.getProperty("numeroTerminal");
		urlMaster = urlMaster + "/" + getDadosRecebidos().get(TiposCamposTEFConstant.NSU).toString();
		urlMaster = urlMaster + "/" + getDadosRecebidos().get(TiposCamposTEFConstant.NSU_HOST).toString();
		urlMaster = urlMaster + "/" + getDadosRecebidos().get(TiposCamposTEFConstant.CODIGO_AUTORIZACAO);
		urlMaster = urlMaster + "/" + getDadosRecebidos().get(TiposCamposTEFConstant.TIPO_COMPROVANTES).toString();
		urlMaster = urlMaster + "/" + getDadosRecebidos().get(TiposCamposTEFConstant.MODALIDADE_PAGAMENTO).toString();
		urlMaster = urlMaster + "/"
				+ getDadosRecebidos().get(TiposCamposTEFConstant.MODALIDADE_PAGAMENTO_DESCRITIVO).toString();
		urlMaster = urlMaster + "/"
				+ getDadosRecebidos().get(TiposCamposTEFConstant.NOME_INSTITUICAO_RESPONSAVEL_TRANSACAO).toString();
		urlMaster = urlMaster + "/"
				+ getDadosRecebidos().get(TiposCamposTEFConstant.CODIGO_INSTITUICAO_RESPONSAVEL_TRANSACAO).toString();

		String sign = sign(urlMaster);

		urlMaster = AppServer.getProperty("protocol") + "://" + server + ':' + port + "/" + urlMaster;
		String k = AppServer.getProperty("presentation").toUpperCase();
		urlMaster = urlMaster + "?" + "apikey=" + k + "&signature=" + sign + "&timestamp=" + new Date().getTime();
		WebTarget resource = client.target(urlMaster);
		Builder request = resource.request();
		request.accept(MediaType.APPLICATION_JSON);

		Response response = request.get();

		if (response.getStatusInfo().getFamily() == Family.SUCCESSFUL) {
			trace("Success! " + response.getStatus());

			trace("confirmarTransacao >>> CONFIRMADA!!!!");
			trace(response.getEntity().toString());
			return true;

		} else {
			trace("confirmarTransacao >>> CANCELADA!!!!");
			trace("ERROR! " + response.getStatus());
			trace(response.getEntity().toString());
			return false;
		}

	}

	public static boolean cancelarbaixaTSOne() throws Exception {
		Client client = ClientBuilder.newClient();

		String server = AppServer.getProperty("server"); // "app.odebrechtambiental.com";
		String port = AppServer.getProperty("port"); // "8443";
		String serviceBase = AppServer.getProperty("serviceBase"); // "tsOneServices/rest/avServices";
		String urlMaster = serviceBase;
		urlMaster = urlMaster + "/cencelaTEF/" + getDadosRecebidos().get("sitef.idCidade");

		urlMaster = urlMaster + "/" + getDadosRecebidos().get("sitef.cupon");

		urlMaster = urlMaster + "/" + AppServer.getProperty("numeroTerminal");
		urlMaster = urlMaster + "/" + getDadosRecebidos().get(TiposCamposTEFConstant.NSU).toString();
		urlMaster = urlMaster + "/" + getDadosRecebidos().get(TiposCamposTEFConstant.NSU_HOST).toString();
		urlMaster = urlMaster + "/" + getDadosRecebidos().get(TiposCamposTEFConstant.CODIGO_AUTORIZACAO);
		urlMaster = urlMaster + "/" + getDadosRecebidos().get(TiposCamposTEFConstant.TIPO_COMPROVANTES).toString();
		urlMaster = urlMaster + "/"
				+ getDadosRecebidos().get(TiposCamposTEFConstant.NOME_INSTITUICAO_RESPONSAVEL_TRANSACAO).toString();
		urlMaster = urlMaster + "/"
				+ getDadosRecebidos().get(TiposCamposTEFConstant.CODIGO_INSTITUICAO_RESPONSAVEL_TRANSACAO).toString();

		String sign = sign(urlMaster);

		urlMaster = AppServer.getProperty("protocol") + "://" + server + ':' + port + "/" + urlMaster;
		String k = AppServer.getProperty("presentation").toUpperCase();
		urlMaster = urlMaster + "?" + "apikey=" + k + "&signature=" + sign + "&timestamp=" + new Date().getTime();
		WebTarget resource = client.target(urlMaster);
		Builder request = resource.request();
		request.accept(MediaType.APPLICATION_JSON);

		Response response = request.get();

		if (response.getStatusInfo().getFamily() == Family.SUCCESSFUL) {
			trace("Success! " + response.getStatus());

			trace("cancelarTransacao >>> CONFIRMADA!!!!");
			trace(response.getEntity().toString());
			return true;

		} else {
			trace("cancelarTransacao >>> CANCELADA!!!!");
			trace("ERROR! " + response.getStatus());
			trace(response.getEntity().toString());
			return false;
		}

	}

	public void verificarPinPad() {
		try {
			if (getTEF() != null) {
				int result = getTEF().verificaPresencaPinPad();
				if (result == 0) {
					throw new Exception("pinPadNaoConectado");
				} else if (result == -1) {
					throw new Exception("bibliotecaPinPadNaoEncontrada");
				}
				trace("verificarPinPad -> " + result);
			}
		} catch (Exception e) {
			gerarException(e.getMessage());
		}
	}

	public synchronized void cancelarTransacao(Session WSSession) {

		lockThread = false;
		getTEF().setBuffer("-1");
		getTEF().setContinuaNavegacao(TiposColetaDadosTEFConstant.CANCELAR_TRANSACAO_ATUAL);
		if (finalizavel) {
			getTEF().finalizaTransacaoSiTefInterativo();
			reset();

			if (WSSession == null)
				return;
			try {
				WSSession.getBasicRemote().sendText(98 + "§sitef.data:§" + "" + "§" + "" + "§" + "");
			} catch (Exception e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
			try {
				WSSession.getBasicRemote().sendText(98 + "§sitef.hora:§" + "" + "§" + "" + "§" + "");
			} catch (Exception e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
			try {
				WSSession.getBasicRemote().sendText(98 + "§sitef.cupon:§" + "" + "§" + "" + "§" + "");
			} catch (Exception e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
		}
	}

	public synchronized Boolean getComprovanteEmitido() {
		return transacaoConfirmada;
	}

	public synchronized void setComprovanteEmitido(Boolean comprovanteEmitido) {
		this.transacaoConfirmada = comprovanteEmitido;
	}

	public static Map<Object, String> getDadosRecebidos() {
		return getDB().getHashMap("sitef");
	}

	public static Boolean isDebugMode() {
		return debugMode;
	}

	public void setDebugMode(Boolean debugMode) {
		this.debugMode = debugMode;
	}

	public static synchronized JCliSiTefI getTEF() {
		if (tef == null) {
			try {
				tef = new JCliSiTefI();
				configureTEF();

			} catch (Throwable e) {
				gerarException(e.getMessage());
			}
		}
		return tef;
	}

	public void exibirDadosRecebidos() {
		String m = "";
		m += getVersaoTEF() + "\n";
		for (Object cod : getDadosRecebidos().keySet()) {
			m += cod + " -> \"" + getDadosRecebidos().get(cod) + "\"\n";
		}
		trace(m);

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
				addDadosRecebidos("sitef.faturas", json.get("valor2").toString());
				addDadosRecebidos("sitef.idCidade", json.get("valor3").toString());

				iniciarTransacaoTEFPagamento(sess, json.get("valor").toString(), json.get("cupon").toString(),
						getDataFiscal(), getHoraFiscal(), json.get("operador").toString(),
						json.get("produtos").toString());
				// iniciarPagamento(session, json.get("valor").toString(),
				// json.get("cupon").toString(), json.get("operador")
				// .toString(), json.get("produtos")
				// .toString());
				//
				// threadTransacao.start();

			}

			if (json.get("action").toString().equalsIgnoreCase("voltar")) {
				voltarTransacao();
			}

			if (json.get("action").toString().equalsIgnoreCase("cancel")) {
				cancelarTransacao(sess);
			}

			if (json.get("action").toString().equalsIgnoreCase("finish")) {
				// confirmarTransacao();
			}
			if (json.get("action").toString().equalsIgnoreCase("verify")) {

				getTEF().setNumeroCuponFiscal(json.get("tipo").toString());
				getTEF().setDataFiscal(json.get("valor").toString());
				getTEF().setHorario(json.get("valor2").toString());

				if (getTEF().obtemQuantidadeTransacoesPendentes() > 0) {

					Client client = ClientBuilder.newClient();

					String server = AppServer.getProperty("server"); // "app.odebrechtambiental.com";
					String port = AppServer.getProperty("port"); // "8443";
					String serviceBase = AppServer.getProperty("serviceBase"); // "tsOneServices/rest/avServices";
					String urlMaster = AppServer.getProperty("protocol") + "://" + server + ':' + port + "/"
							+ serviceBase;
					urlMaster = urlMaster + "/pagamentoTEF/" + getDadosRecebidos().get("sitef.idCidade");

					urlMaster = urlMaster + "/" + getDadosRecebidos().get("sitef.cupon");
					urlMaster = urlMaster + "/" + AppServer.getProperty("numeroTerminal");
					urlMaster = urlMaster + "/" + getDadosRecebidos().get(TiposCamposTEFConstant.NSU).toString();
					urlMaster = urlMaster + "/" + getDadosRecebidos().get(TiposCamposTEFConstant.NSU_HOST).toString();
					urlMaster = urlMaster + "/" + getDadosRecebidos().get(TiposCamposTEFConstant.CODIGO_AUTORIZACAO);
					urlMaster = urlMaster + "/"
							+ getDadosRecebidos().get(TiposCamposTEFConstant.TIPO_COMPROVANTES).toString();
					urlMaster = urlMaster + "/" + getDadosRecebidos()
							.get(TiposCamposTEFConstant.NOME_INSTITUICAO_RESPONSAVEL_TRANSACAO).toString();
					urlMaster = urlMaster + "/" + getDadosRecebidos()
							.get(TiposCamposTEFConstant.CODIGO_INSTITUICAO_RESPONSAVEL_TRANSACAO).toString();

					WebTarget resource = client.target(urlMaster);
					Builder request = resource.request();
					request.accept(MediaType.APPLICATION_JSON);

					Response response = request.get();

					if (response.getStatusInfo().getFamily() == Family.SUCCESSFUL) {
						trace("Success! " + response.getStatus());
						getTEF().setConfirma(TiposConfirmacaoTEFConstant.TRANSACAO_CANCELADA);
						getTEF().finalizaTransacaoSiTefInterativo();
						cancelarTransacao(sess);
						trace("cancelarTransacao >>> CONFIRMADA!!!!");
						trace(response.getEntity().toString());
						try {
							sess.getBasicRemote().sendText(99 + "§cancelou§" + "" + "§" + "" + "§" + "");
						} catch (Exception e) {
						}
					} else {
						trace("cancelarTransacao >>> ERRO!!!!");
						trace("ERROR! " + response.getStatus());
						trace(response.getEntity().toString());
					}

				}

			}

			if (json.get("action").toString().equalsIgnoreCase("response")) {

				try {
					String r = json.get("valor").toString().trim();
					getTEF().setContinuaNavegacao(TiposColetaDadosTEFConstant.NORMAL);
					if (r.startsWith("sitef-sim")) {
						r = "0";
						getTEF().setBuffer(r);

					} else if (r.startsWith("sitef-nao")) {
						r = "1";

						getTEF().setBuffer(r);

					} else {

						getTEF().setBuffer(r);
					}

				} catch (Exception e) {
				}

				// Integer.parseInt(json.get("tipo").toString()),
				// new BigDecimal(json.get("valor").toString()), 1,
				// Calendar.getInstance().getTime(), "",
				// "[Fatura 1;1;1;100,00];[Fatura 2;2;1;120,00]"
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		lockThread = false;
	}

	private void voltarTransacao() {
		// TODO Auto-generated method stub
		getTEF().setBuffer("-1");
		getTEF().setContinuaNavegacao(TiposColetaDadosTEFConstant.RETORNAR_PARA_ULTIMA_COLETA);
	}

	private String getDataFiscal() {
		SimpleDateFormat sdf1 = new SimpleDateFormat("yyyyMMdd", Locale.getDefault());

		Date dateHour = Calendar.getInstance().getTime();
		return sdf1.format(dateHour);
	}

	private String getHoraFiscal() {

		SimpleDateFormat sdf2 = new SimpleDateFormat("HHmmss", Locale.getDefault());
		Date dateHour = Calendar.getInstance().getTime();
		return sdf2.format(dateHour);
	}

	@OnWebSocketClose
	public void onWebSocketClose(Session session, int statusCode, String reason) {
		System.out.println("Socket Closed: " + reason);
		cancelarTransacao(null);
	}

	@OnClose
	public void onWebSocketClose(CloseReason reason) {
		System.out.println("Socket Closed: " + reason);
		cancelarTransacao(null);

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