import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        /*
         * `ViewController`, e NÃO `CAPBridgeViewController` — que é o que o
         * template do Capacitor escreve aqui. A subclasse existe por um
         * método só: registrar o plugin do login nativo (ver
         * `ViewController.swift`). Quem desenha a tela é este método, em
         * código — a janela da storyboard é descartada antes de aparecer —
         * então é AQUI que a classe tem que estar. Voltar esta linha para a
         * classe base compila, sobe na App Store, e o "Entrar com Google"
         * trava sem erro nenhum no build.
         */
        window?.rootViewController = ViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
