import AuthenticationServices
import Capacitor
import Foundation
import UIKit

/**
 * A JANELA DE LOGIN QUE DEVOLVE O RETORNO AO APP
 *
 * Por que isto existe: o `@capacitor/browser` no iOS é um
 * `SFSafariViewController`, e ele NÃO abre esquemas próprios de aplicativo —
 * restrição do iOS, não defeito do Capacitor. O provedor manda o navegador
 * para `lendasdoflu://entrar?...`, o navegador engole o redirecionamento em
 * silêncio (sem erro, sem log) e a pessoa fica presa fora do app. Foi o
 * defeito relatado na primeira build de teste do Lendas: "fiz o login e o
 * app continuou no navegador".
 *
 * `ASWebAuthenticationSession` é a API que a Apple fez para isto. O esquema
 * de retorno é PARÂMETRO dela: em vez de tentar navegar até
 * `lendasdoflu://entrar`, ela reconhece o endereço como o fim da conversa,
 * fecha a janela e devolve a URL a quem chamou.
 *
 * O QUE ESTE ARQUIVO NÃO FAZ: ele não sabe nada sobre OAuth, Supabase ou
 * Google. Recebe uma URL, abre, espera, devolve o que voltou. Quem monta a
 * URL e troca o retorno por sessão é o `src/lib/entrar-nativo.ts` — este
 * arquivo é uma janela, não uma regra.
 *
 * ANDROID NÃO PRECISA DISTO: o Custom Tabs segue redirecionamento para
 * esquema próprio e entrega a URL ao app, então lá o `@capacitor/browser`
 * serve. O `entrar-nativo.ts` escolhe um ou outro pela plataforma.
 */
@objc(LoginNativoPlugin)
public class LoginNativoPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "LoginNativoPlugin"
    public let jsName = "LoginNativo"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "abrir", returnType: CAPPluginReturnPromise)
    ]

    /*
     * A sessão TEM que ser guardada. `ASWebAuthenticationSession` não é retida
     * por quem a apresenta: uma sessão só local seria liberada ao fim deste
     * método e a janela fecharia sozinha antes de a pessoa tocar em nada.
     */
    private var sessao: ASWebAuthenticationSession?

    @objc func abrir(_ call: CAPPluginCall) {
        guard let endereco = call.getString("url"), let url = URL(string: endereco) else {
            call.reject("Falta a URL de login, ou ela não é uma URL.")
            return
        }
        guard let esquema = call.getString("esquema"), !esquema.isEmpty else {
            call.reject("Falta o esquema de retorno.")
            return
        }

        // A janela é interface: fora da thread principal o iOS não a desenha.
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }

            let sessao = ASWebAuthenticationSession(
                url: url,
                callbackURLScheme: esquema
            ) { [weak self] retorno, erro in
                // Solta a sessão antes de responder: responder primeiro deixaria
                // uma sessão morta guardada até o próximo login.
                self?.sessao = nil

                if let erro = erro {
                    /*
                     * Fechar a janela NÃO é erro. Quem desistiu de entrar
                     * desistiu; uma tela de "não deu para entrar" aqui seria o
                     * app culpando a pessoa por uma decisão dela.
                     */
                    if let falha = erro as? ASWebAuthenticationSessionError,
                        falha.code == .canceledLogin {
                        call.resolve(["cancelado": true])
                        return
                    }
                    call.reject(erro.localizedDescription)
                    return
                }

                guard let retorno = retorno else {
                    call.reject("A janela de login fechou sem devolver endereço.")
                    return
                }

                call.resolve(["url": retorno.absoluteString])
            }

            sessao.presentationContextProvider = self

            /*
             * `false` de propósito: a janela compartilha os cookies do Safari,
             * então quem já está logado no Google escolhe a conta e pronto.
             * `true` pediria e-mail e senha em TODA entrada — inclusive na do
             * revisor da App Store, que não tem a senha de ninguém.
             */
            sessao.prefersEphemeralWebBrowserSession = false

            self.sessao = sessao

            if !sessao.start() {
                self.sessao = nil
                call.reject("O iOS recusou abrir a janela de login.")
            }
        }
    }
}

extension LoginNativoPlugin: ASWebAuthenticationPresentationContextProviding {
    public func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        /*
         * A janela do app é a âncora. O `ASPresentationAnchor()` do final é o
         * caso que não deveria acontecer — se não há janela, não há app na
         * tela — e existe só porque a assinatura não admite devolver nada.
         */
        return self.bridge?.viewController?.view.window ?? ASPresentationAnchor()
    }
}
