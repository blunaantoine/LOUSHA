import path from "path";

/**
 * Dossier où sont enregistrées les images envoyées depuis l'administration.
 *
 * - Si UPLOAD_DIR est défini, il est utilisé tel quel.
 * - Sinon : <racine du projet>/public/uploads.
 *
 * En production, le serveur Next.js « standalone » s'exécute depuis
 * `.next/standalone`, un dossier recréé à chaque compilation. On remonte donc
 * à la racine du projet pour que les images ne soient jamais effacées par un
 * nouveau déploiement.
 */
export function getUploadDir(): string {
  if (process.env.UPLOAD_DIR) return process.env.UPLOAD_DIR;
  return path.join(getProjectRoot(), "public", "uploads");
}

export function getProjectRoot(): string {
  const cwd = process.cwd();
  const marker = path.join(".next", "standalone");
  return cwd.endsWith(marker) ? path.resolve(cwd, "..", "..") : cwd;
}
