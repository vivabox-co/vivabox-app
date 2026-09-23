// URL publique de l'app bénéficiaire — sert à construire des liens absolus
// dans les emails transactionnels (un client mail n'a pas de notion
// d'origine, un lien relatif n'a aucun sens là-bas). NEXT_PUBLIC_APP_URL
// permet de pointer vers un déploiement preview en environnement de test.
export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.vivabox.com.co").replace(/\/$/, "")
