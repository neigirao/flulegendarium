import Capacitor
import UIKit

/**
 * O ÚNICO LUGAR ONDE UM PLUGIN DO PRÓPRIO APP PODE SE APRESENTAR
 *
 * Sem o `registerPluginInstance` abaixo, o `LoginNativoPlugin` compila, entra
 * no binário, e o JavaScript nunca o encontra — o botão de entrar trava sem
 * erro nenhum na tela. O `registerPlugins()` do CapacitorBridge monta a lista
 * lendo `packageClassList` do `capacitor.config.json`, que é GERADO pelo
 * `npx cap sync` a partir dos pacotes npm: um plugin escrito aqui dentro
 * nunca entra nele. Só por código, e só aqui.
 *
 * `capacitorDidLoad()` roda logo depois de o bridge ser criado e antes de
 * qualquer JavaScript poder chamar o plugin. `registerPluginInstance` e não
 * `registerPluginType`: o segundo não faz nada com `autoRegisterPlugins`
 * ligado (o padrão) — e não avisa.
 *
 * QUEM INSTANCIA ESTA CLASSE: `SceneDelegate.swift`, em código — a janela é
 * criada no `scene(_:willConnectTo:)`, e a do storyboard é descartada. A
 * referência à classe na `Main.storyboard` é só segunda linha de defesa.
 */
class ViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(LoginNativoPlugin())
    }
}
