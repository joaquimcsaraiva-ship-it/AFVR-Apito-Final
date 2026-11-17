# Backup
Copy-Item public\index.html public\index.repair-backup.html -Force

$content = Get-Content public\index.html -Raw

# Corrigir "..stat"
$content = $content -replace '\.\.stat\s*\{', '.stat {'

# Remover CSS injectado fora do <style>
$content = $content -replace '(?s)</style>\s*\.user\s*\{.*?#themeToggle\s*\{.*?\}\s*', '</style>'

# Corrigir bloco user corrompido
$content = $content -replace '(?s)<div class="user">.*?</div>\s*</header>', @"
<div class="user">
  <div class="avatar">A</div>

  <span id="authUserText">
    Consulta pública
  </span>

  <button
    class="button button-quiet"
    id="themeToggle"
    type="button">
    🌙
  </button>

  <button
    class="button button-quiet"
    id="loginButton"
    type="button">
    Entrar na gestão
  </button>

  <button
    class="button button-quiet"
    id="logoutButton"
    type="button"
    hidden>
    Sair
  </button>
</div>
</header>
"@

Set-Content public\index.html $content

Write-Host "index.html reparado"