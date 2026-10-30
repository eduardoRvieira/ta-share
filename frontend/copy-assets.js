const fs = require('fs');
const path = require('path');

// Caminho de origem (onde o Angular gera o build)
const source = path.join(__dirname, 'dist', 'frontend', 'browser');
// Caminho de destino (a pasta static do seu Spring Boot)
const destination = path.join(__dirname, '..', 'src', 'main', 'resources', 'static');

// Função recursiva para copiar pastas e arquivos
function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  // Limpa o conteúdo antigo da pasta static antes de colocar o novo build
  if (fs.existsSync(destination)) {
    fs.rmSync(destination, { recursive: true, force: true });
  }

  // Copia os novos arquivos
  copyRecursiveSync(source, destination);
  console.log('Sucesso! Arquivos do Angular copiados para o Spring Boot.');
} catch (error) {
  console.error('Erro ao copiar os arquivos:', error);
}
