package io.tempra;

import com.itextpdf.awt.geom.Rectangle;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Image;
import com.itextpdf.text.pdf.PdfReader;
import com.itextpdf.text.pdf.PdfSignatureAppearance;
import com.itextpdf.text.pdf.PdfStamper;
import com.itextpdf.text.pdf.security.*;
import com.itextpdf.text.pdf.security.MakeSignature.CryptoStandard;
import java.security.*;
import java.security.Certificate;
import java.security.cert.*;
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.logging.Level;
import javax.xml.parsers.*;
import javax.xml.transform.*;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import javax.xml.crypto.dsig.*;
import javax.xml.crypto.dsig.dom.DOMSignContext;
import javax.xml.crypto.dsig.keyinfo.*;
import javax.xml.crypto.dsig.spec.*;
import java.util.logging.Logger;
import javax.naming.ldap.LdapName;
import javax.naming.ldap.Rdn;
import javax.swing.JOptionPane;

import org.w3c.dom.Document;
import org.w3c.dom.NodeList;

/**
 *
 * @author onvaid@hotmail.com
 */
public class VerCert {

    private static final SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
    
    //Procedimento que retorna o Keystore
    public static KeyStore funcKeyStore(String strAliasTokenCert) throws NoSuchProviderException, IOException, NoSuchAlgorithmException, CertificateException, UnrecoverableEntryException {

        String strResult = "";
        KeyStore ks = null;

        try {
            ks = KeyStore.getInstance("Windows-MY", "SunMSCAPI");
            ks.load(null, null);

            Enumeration<String> aliasEnum = ks.aliases();

            while (aliasEnum.hasMoreElements()) {
                String aliasKey = (String) aliasEnum.nextElement();

                if (ks.isKeyEntry(aliasKey)) {
                    strResult = aliasKey;
                }

                if (ks.getCertificateAlias(ks.getCertificate(strResult)) == strAliasTokenCert) {
                    break;
                }
            }

        } catch (KeyStoreException ex) {
            System.out.println("ERROR " + ex.getMessage());
        }

        return ks;

    }

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    public String assinadorDigital_2()// throws Exception
	{
    	String retorno = "";
    	System.out.println("0");		
		try{
			PdfReader pdfReader = new PdfReader("C:\\vstGED_Doc\\Assinatura.pdf");
		
			KeyStore ks = KeyStore.getInstance("PKCS12");
			String senha = "Abcd1234";
		
			ks.load(new FileInputStream("C:\\Versatile\\certificado\\certificadoTiago.pfx"), senha.toCharArray());
			Enumeration aliasesEnum = ks.aliases();
			String alias = "";
			while (aliasesEnum.hasMoreElements()) {
				alias = (String) aliasesEnum.nextElement();
	
				if (ks.isKeyEntry(alias)) {
					break;
				}
			}
		
			PrivateKey keyEntry =  (PrivateKey) ks.getKey(alias, senha.toCharArray());		
			java.security.cert.Certificate[] chain = ks.getCertificateChain(alias);
	
			FileOutputStream output = new FileOutputStream("C:\\vstGED_Doc\\Teste_Assinado.pdf");
			
			PdfStamper stamper = PdfStamper.createSignature(pdfReader, output, '\0', null, true);
		
 	        PdfSignatureAppearance appearance = stamper .getSignatureAppearance();
	        appearance.setImage(Image.getInstance("C:\\Versatile\\logo\\logo_versatile.JPG"));
	        appearance.setReason("Versatile Soluções Tecnologicas S/A");
	        appearance.setLocation("Foobar");
	        appearance.setVisibleSignature(new com.itextpdf.text.Rectangle(5, 50, 100, 100), 1,"first");
	        // digital signature
	        Security.addProvider(new org.bouncycastle.jce.provider.BouncyCastleProvider());
	        ExternalSignature es = new PrivateKeySignature(keyEntry, "SHA-256","BC"); 
	        ExternalDigest digest = new BouncyCastleDigest();
	        MakeSignature.signDetached(appearance, digest, es, chain, null, null, null, 0, CryptoStandard.CMS);        

		}
		catch(IOException iow)
		{   iow.printStackTrace();
			retorno = iow.toString();
		}
		catch(DocumentException dcx)
		{   dcx.printStackTrace();
			retorno = dcx.toString();
		}
		catch(GeneralSecurityException gex)
		{   gex.printStackTrace();
			retorno = gex.toString();
		}		
		catch(Exception ex)
		{   ex.printStackTrace();
			retorno = ex.toString();
		}

		//if(retorno.trim().length() <=  0)
			retorno = "OK";
		
			return retorno;
	}    

    public String assinadorDigital(String certificado, String senha, String arquivo, String nomeArq) {
        
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
    	String retorno = "";
    	System.out.println("0");		
        String extensao = arquivo.substring(arquivo.lastIndexOf('.'));
        
            try{
                KeyStore ks = KeyStore.getInstance("Windows-MY", "SunMSCAPI");
                String alias = certificado; // Aqui é informado o Alias (Nome amigável do certificado digital)
                ks.load(null, null); //MODIFICADO

                X509Certificate cert = (X509Certificate) ks.getCertificate(alias);
                info("SubjectDN...........: " + cert.getSubjectDN().toString());
                info("Version.............: " + cert.getVersion());
                info("SerialNumber........: " + cert.getSerialNumber());
                info("SigAlgName..........: " + cert.getSigAlgName());
                info("Válido a partir de..: " + dateFormat.format(cert.getNotBefore()));
                info("Válido até..........: " + dateFormat.format(cert.getNotAfter()));
                
                try
                {
                    cert.checkValidity();

                    PrivateKey keyEntry =  (PrivateKey) ks.getKey(alias, senha.toCharArray());		
                    java.security.cert.Certificate[] chain = ks.getCertificateChain(alias);

                    PdfReader pdfReader = new PdfReader(arquivo);
                    //PdfReader pdfReader = new PdfReader("C:\\Assinatura.pdf");

                    FileOutputStream output = new FileOutputStream(arquivo.replace(extensao, "") + "_Assinado.pdf");

                    PdfStamper stamper = PdfStamper.createSignature(pdfReader, output, '\0', null, true);

                    PdfSignatureAppearance appearance = stamper .getSignatureAppearance();
                    appearance.setImage(null);
                    //appearance.setImage(Image.getInstance("C:\\Versatile\\logo\\logo_versatile.JPG"));
                    appearance.setReason("Versatile");
                    //appearance.setLocation("Foobar");
                    
                    appearance.setVisibleSignature(new com.itextpdf.text.Rectangle(5, 50, 100, 100), 1,"first");
                    // digital signature
                    Security.addProvider(new org.bouncycastle.jce.provider.BouncyCastleProvider());
                    ExternalSignature es = new PrivateKeySignature(keyEntry, "SHA-256",ks.getProvider().getName()); 
                    ExternalDigest digest = new BouncyCastleDigest();
                    MakeSignature.signDetached(appearance, digest, es, chain, null, null, null, 0, CryptoStandard.CMS);        
                
                    retorno = "OK";
                }
                catch(CertificateExpiredException e)
                {
                    JOptionPane.showMessageDialog(null, "Certificado Digital " + alias + " expirado desde " + sdf.format(cert.getNotAfter()));
                    retorno = e.toString();
                }

            }
            catch(IOException iow)
            {   iow.printStackTrace();
                    retorno = iow.toString();
            }
            catch(DocumentException dcx)
            {   dcx.printStackTrace();
                    retorno = dcx.toString();
            }
            catch(GeneralSecurityException gex)
            {   gex.printStackTrace();
                    retorno = gex.toString();
            }		
            catch(Exception ex)
            {   ex.printStackTrace();
                    retorno = ex.toString();
            }

            return retorno;
	}    
    
    
public void loadCertificates(String certificado, String senha,
            XMLSignatureFactory signatureFactory) 
            throws FileNotFoundException, KeyStoreException, IOException, 
            NoSuchAlgorithmException, CertificateException, 
            UnrecoverableEntryException, NoSuchProviderException 
    {
	KeyStore ks = KeyStore.getInstance("Windows-MY", "SunMSCAPI"); //MODIFICADO
        String alias = certificado; // Aqui é informado o Alias (Nome amigável do certificado digital)
        
        ks.load(null, null); //MODIFICADO
	
	KeyStore.PrivateKeyEntry pkEntry = null;
	Enumeration<String> aliasesEnum = ks.aliases();
	while (aliasesEnum.hasMoreElements()) 
        {
            if (ks.isKeyEntry(alias)) 
            {
                pkEntry = (KeyStore.PrivateKeyEntry) ks.getEntry(alias, new KeyStore.PasswordProtection(senha.toCharArray()));
                PrivateKey privateKey = pkEntry.getPrivateKey();
		break;
            }
	}
       
        /*
	X509Certificate cert = (X509Certificate) pkEntry.getCertificate();
	//System.out.println("SubjectDN: " + cert.getSubjectDN().toString());
	KeyInfoFactory keyInfoFactory = signatureFactory.getKeyInfoFactory();
	List<X509Certificate> x509Content = new ArrayList<X509Certificate>();
        
	x509Content.add(cert);
	X509Data x509Data = keyInfoFactory.newX509Data(x509Content);
        KeyInfo keyInfo = keyInfoFactory.newKeyInfo(Collections.singletonList(x509Data));
        */
}

public void DadosCertificado() {
    try {
            KeyStore keyStore = KeyStore.getInstance("Windows-MY", "SunMSCAPI");
            keyStore.load(null, null);

            Enumeration <String> al = keyStore.aliases();
            while (al.hasMoreElements()) {
                    String alias = al.nextElement();
                    info("--------------------------------------------------------");
                    if (keyStore.containsAlias(alias)) {
                            info("Emitido para........: " + alias);

                            X509Certificate cert = (X509Certificate) keyStore.getCertificate(alias);
                            info("SubjectDN...........: " + cert.getSubjectDN().toString());
                            info("Version.............: " + cert.getVersion());
                            info("SerialNumber........: " + cert.getSerialNumber());
                            info("SigAlgName..........: " + cert.getSigAlgName());
                            info("Válido a partir de..: " + dateFormat.format(cert.getNotBefore()));
                            info("Válido até..........: " + dateFormat.format(cert.getNotAfter()));
                            
                            
String dn = cert.getSubjectX500Principal().getName();
LdapName ldapDN = new LdapName(dn);
for(Rdn rdn: ldapDN.getRdns()) {
    System.out.println(rdn.getType() + " -> " + rdn.getValue());
}                            
                            

        if (cert instanceof X509Certificate) {
        X509Certificate x509cert = (X509Certificate) cert;

        Principal principal = x509cert.getSubjectDN();
        String subjectDn = principal.getName();
        System.out.println("wq" + subjectDn);

        // Get issuer
        principal = x509cert.getIssuerDN();
        String issuerDn = principal.getName();
        System.out.println("qw" + issuerDn);
        }
        
        

        
        
        
        
                    } else {
                            info("Alias doesn't exists : " + alias);
                    }
            }
    } catch (Exception e) {
            error(e.toString());
    }    
}
private static void info(String log) {
        System.out.println("INFO: " + log);
}

private static void error(String log) {
        System.out.println("ERROR: " + log);
}
    
    

































    
    
    
    
    
    
    //Procedimento de listagem dos certificados digitais
    public static String[] funcListaCertificados(boolean booCertValido) throws NoSuchProviderException, IOException, NoSuchAlgorithmException, CertificateException {

        //Estou setando a variavel para 20 dispositivos no maximo
        String strResult[] = new String[20];
        Integer intCnt = 0;

        try {
            KeyStore ks = KeyStore.getInstance("Windows-MY", "SunMSCAPI");
            ks.load(null, null);

            Enumeration<String> aliasEnum = ks.aliases();

            while (aliasEnum.hasMoreElements()) {
                String aliasKey = (String) aliasEnum.nextElement();

                if (booCertValido == false) {
                    strResult[intCnt] = aliasKey;
                } else if (ks.isKeyEntry(aliasKey)) {
                    strResult[intCnt] = aliasKey;
                }

                if (strResult[intCnt] != null) {
                    intCnt = intCnt + 1;

                }

            }

        } catch (KeyStoreException ex) {
            System.out.println("ERROR " + ex.getMessage());
        }

        return strResult;

    }

    //Procedimento que retorna a chave privada de um certificado Digital
    public static PrivateKey funcChavePrivada(String strAliasTokenCert, String strAliasCertificado, String strArquivoCertificado, String strSenhaCertificado) throws Exception {

        KeyStore ks = null;
        PrivateKey privateKey = null;

        if (strAliasTokenCert == null || strAliasTokenCert == "") {

            ks = KeyStore.getInstance("PKCS12");
            FileInputStream fis = new FileInputStream(strArquivoCertificado);
            //Efetua o load do keystore
            ks.load(fis, strSenhaCertificado.toCharArray());
            //captura a chave privada para a assinatura
            privateKey = (PrivateKey) ks.getKey(strAliasCertificado, strSenhaCertificado.toCharArray());

        } else {

            if (strSenhaCertificado == null || strSenhaCertificado == "") {
                strSenhaCertificado = "Senha";
            }

            //Procedimento para a captura da chave privada do token/cert
            privateKey = (PrivateKey) funcKeyStore(strAliasTokenCert).getKey(strAliasTokenCert, strSenhaCertificado.toCharArray());

        }

        return privateKey;

    }

    //Procedimento que retorna a chave publica de um certificado Digital
    public static PublicKey funcChavePublica(String strAliasTokenCert, String strAliasCertificado, String strArquivoCertificado, String strSenhaCertificado) throws Exception {

        KeyStore ks = null;
        PublicKey chavePublica = null;

        if (strAliasTokenCert == null || strAliasTokenCert == "") {

            ks = KeyStore.getInstance("PKCS12");
            FileInputStream fis = new FileInputStream(strArquivoCertificado);

            //InputStream entrada para o arquivo
            ks.load(fis, strSenhaCertificado.toCharArray());
            fis.close();
            Key chave = (Key) ks.getKey(strAliasCertificado, strSenhaCertificado.toCharArray());
            //O tipo de dado é declarado desse modo por haver ambigüidade (Classes assinadas com o mesmo nome "Certificate")
            java.security.Certificate cert = (java.security.Certificate) ks.getCertificate(strAliasCertificado);
            chavePublica = cert.getPublicKey();

        } else {

            if (strSenhaCertificado == null || strSenhaCertificado == "") {
                strSenhaCertificado = "Senha";
            }

            //Procedimento se for utilizar token para a captura de chave publica
            ks = funcKeyStore(strAliasTokenCert);
            Key key = ks.getKey(strAliasTokenCert, strSenhaCertificado.toCharArray());
            java.security.cert.Certificate crtCert = ks.getCertificate(strAliasTokenCert);
            chavePublica = crtCert.getPublicKey();

        }

        return chavePublica;

    }

    //Procedimento que verifica a assinatura
    public static boolean funcAssinaturaValida(PublicKey pbKey, byte[] bteBuffer, byte[] bteAssinado, String strAlgorithmAssinatura) throws Exception {

        if (strAlgorithmAssinatura == null) {
            strAlgorithmAssinatura = "MD5withRSA";
        }

        Signature isdAssinatura = Signature.getInstance(strAlgorithmAssinatura);
        isdAssinatura.initVerify(pbKey);
        isdAssinatura.update(bteBuffer, 0, bteBuffer.length);
        return isdAssinatura.verify(bteAssinado);

    }

    //Procedimento que gera a assinatura
    public static byte[] funcGeraAssinatura(PrivateKey pbKey, byte[] bteBuffer, String strAlgorithmAssinatura) throws Exception {

        if (strAlgorithmAssinatura == null) {
            strAlgorithmAssinatura = "MD5withRSA";
        }

        Signature isdAssinatura = Signature.getInstance(strAlgorithmAssinatura);
        isdAssinatura.initSign(pbKey);
        isdAssinatura.update(bteBuffer, 0, bteBuffer.length);
        return isdAssinatura.sign();

    }

    //Procedimento que retorna o status do certificado
    public static String funcStatusCertificado(X509Certificate crtCertificado) {

        try {
            crtCertificado.checkValidity();
            return "Certificado válido!";
        } catch (CertificateExpiredException E) {
            return "Certificado expirado!";
        } catch (CertificateNotYetValidException E) {
            return "Certificado inválido!";
        }

    }

    //Procedimento que retorna o certificado selecionado
    public static X509Certificate funcCertificadoSelecionado(String strAliasTokenCert, String strAliasCertificado, String strArquivoCertificado, String strSenhaCertificado) throws NoSuchProviderException, IOException, NoSuchAlgorithmException, CertificateException, UnrecoverableEntryException, KeyStoreException {

        X509Certificate crtCertificado = null;
        KeyStore crtRepositorio = null;

        if (strAliasTokenCert == null || strAliasTokenCert == "") {

            //Procedimento de captura do certificao arquivo passado como parametro
            InputStream dado = new FileInputStream(strArquivoCertificado);
            crtRepositorio = KeyStore.getInstance("PKCS12");
            crtRepositorio.load(dado, strSenhaCertificado.toCharArray());
            crtCertificado = (X509Certificate) crtRepositorio.getCertificate(strAliasCertificado);

        } else {

            if (strSenhaCertificado == null || strSenhaCertificado == "") {
                strSenhaCertificado = "Senha";
            }

            //Procedimento de captura do certificao token passado como parametro
            KeyStore.PrivateKeyEntry keyEntry;
            try {
                keyEntry = (KeyStore.PrivateKeyEntry) funcKeyStore(strAliasTokenCert).getEntry(strAliasTokenCert, new KeyStore.PasswordProtection(strSenhaCertificado.toCharArray()));

                crtCertificado = (X509Certificate) keyEntry.getCertificate();
            } catch (KeyStoreException ex) {
                //Logger.getLogger(CertEL.class.getName()).log(Level.SEVERE, null, ex);
                System.out.println("ERROR " + ex.getMessage());
            }
        }

        return crtCertificado;

    }

    //Procedimento de Parametros de assinatura
    public static class TAssinaXML {

        //MD2withRSA - MD5withRSA - SHA1withRSA - SHA224withRSA - SHA256withRSA - SHA1withDSA - DSA - RawDSA
        //public String strAlgorithmAssinatura = "MD5withRSA";
        public String strAliasTokenCert = null;
        public String strAliasCertificado = null;
        public String strArquivoCertificado = null;
        public String strSenhaCertificado = null;
        public String strArquivoXML = null;
        public String strArquivoSaveXML = null;
        public String C14N_TRANSFORM_METHOD = "http://www.w3.org/TR/2001/REC-xml-c14n-20010315";
        public boolean booNFS = true;
    }

    //Procedimento de assinar XML
    public static boolean funcAssinaXML(TAssinaXML tpAssinaXML) throws Exception {

        Signature sgi = null;
        
        XMLSignatureFactory sig = null;
        SignedInfo si = null;
        KeyInfo ki = null;
        String strTipoSign = "infNFe";
        String strID = "Id";

        if (tpAssinaXML.booNFS) {
            strTipoSign = "LoteRps";//"InfNfse";
            strID = "Id";
        }

        //Capturo o certificado
        X509Certificate cert = funcCertificadoSelecionado(tpAssinaXML.strAliasTokenCert, tpAssinaXML.strAliasCertificado, tpAssinaXML.strArquivoCertificado, tpAssinaXML.strSenhaCertificado);

        //Inicializo o arquivo/carrego
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        dbf.setNamespaceAware(true);
        Document doc = dbf.newDocumentBuilder().parse(new FileInputStream(tpAssinaXML.strArquivoXML));

        sig = XMLSignatureFactory.getInstance("DOM");


        ArrayList<Transform> transformList = new ArrayList<Transform>();
        Transform enveloped = sig.newTransform(Transform.ENVELOPED, (TransformParameterSpec) null);
        Transform c14n = sig.newTransform(tpAssinaXML.C14N_TRANSFORM_METHOD, (TransformParameterSpec) null);
        transformList.add(enveloped);
        transformList.add(c14n);

        NodeList elements = doc.getElementsByTagName(strTipoSign);
        org.w3c.dom.Element el = (org.w3c.dom.Element) elements.item(0);

        String id = el.getAttribute(strID);

        Reference r = sig.newReference("#".concat(id), sig.newDigestMethod(DigestMethod.SHA1, null),
                transformList,
                null, null);
        si = sig.newSignedInfo(
                sig.newCanonicalizationMethod(CanonicalizationMethod.INCLUSIVE,
                (C14NMethodParameterSpec) null),
                sig.newSignatureMethod(SignatureMethod.RSA_SHA1, null),
                Collections.singletonList(r));

        KeyInfoFactory kif = sig.getKeyInfoFactory();
        List x509Content = new ArrayList();
        x509Content.add(cert);
        X509Data xd = kif.newX509Data(x509Content);
        ki = kif.newKeyInfo(Collections.singletonList(xd));

        DOMSignContext dsc = new DOMSignContext(funcChavePrivada(tpAssinaXML.strAliasTokenCert, tpAssinaXML.strAliasCertificado, tpAssinaXML.strArquivoCertificado, tpAssinaXML.strSenhaCertificado), doc.getDocumentElement());
        XMLSignature signature = sig.newXMLSignature(si, ki);

        signature.sign(dsc);

        //Salvo o arquivo assinado
        OutputStream os = new FileOutputStream(tpAssinaXML.strArquivoSaveXML);
        TransformerFactory tf = TransformerFactory.newInstance();
        Transformer trans = tf.newTransformer();
        trans.transform(new DOMSource(doc), new StreamResult(os));

        return true;

    }
}
