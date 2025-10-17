# Script para aplicar traduções em public/_locales/*/messages.json
# Atualiza extName, extDesc, settingsTitle e outras chaves (message + description)
# Faça commit/backup antes de executar.

$root = "c:\Users\marcelo.silva\Documents\MY\ext-Jira-Expand-Workspace\public\_locales"

# Map: locale -> key -> @{ message = "..."; description = "..." }
$map = @{}

# Exemplo: en / en_US
$map["en"] = @{
  "extName" = @{ message = "Jira Optimizer"; description = "Extension name" }
  "extDesc" = @{ message = "Jira. Adds buttons to Collapse Right Panel, Expand Create Modal, Expand Images, and View Linked Tickets."; description = "Extension description" }
  "settingsTitle" = @{ message = "Jira Optimizer - Settings"; description = "Main settings popup title" }
  "reloadRequired" = @{ message = "Reload required!"; description = "Warning message when reload is required" }
  "globalSettings" = @{ message = "Global Settings"; description = "Global settings section" }
  "enableFeatures" = @{ message = "Enable Features"; description = "Label for toggle to enable all features" }
  "features" = @{ message = "Features"; description = "Individual features section" }
  "collapseRightPanel" = @{ message = "Collapse Right Panel"; description = "Feature to collapse right panel" }
  "expandCreateModal" = @{ message = "Expand Create Modal"; description = "Feature to expand create modal" }
  "viewLinkedTickets" = @{ message = "View Linked Tickets"; description = "Feature to view linked tickets" }
  "expandImages" = @{ message = "Expand Images"; description = "Feature to expand images" }
  "collapseRightPaneTitle" = @{ message = "Collapse right pane ]"; description = "Title for collapse right pane button" }
  "openRightPaneTitle" = @{ message = "Open right pane ]"; description = "Title when right pane is collapsed" }
  "collapseModalTitle" = @{ message = "Collapse modal ]"; description = "Title for collapse modal button" }
  "expandModalTitle" = @{ message = "Expand modal ]"; description = "Title when modal is collapsed" }
  "expandImagesTitle" = @{ message = "Expand/Collapse images (Ctrl+Shift+Z)"; description = "Title for expand/collapse images button" }
  "byExtension" = @{ message = "By Jira Optimizer"; description = "Extension attribution text" }
  "linkedTicketsTitle" = @{ message = "Linked Tickets"; description = "Title for linked tickets tooltip" }
  "noLinkedTickets" = @{ message = "No linked tickets."; description = "Message when no linked tickets found" }
  "errorTitle" = @{ message = "Error"; description = "Error title" }
  "assigneeTitle" = @{ message = "Assignee: $assignee$"; description = "Assignee tooltip" }
  "issueTypeTitle" = @{ message = "$type$ ($relationship$)"; description = "Issue type tooltip" }
  "issueAriaLabel" = @{ message = "$key$ $status$"; description = "Issue aria label" }
  "loadingLinkedTickets" = @{ message = "Loading linked tickets..."; description = "Loading message for linked tickets tooltip" }
}
$map["en_US"] = $map["en"]

# pt_BR
$map["pt_BR"] = @{
  "extName" = @{ message = "Jira Optimizer"; description = "Nome da extensão" }
  "extDesc" = @{ message = "Jira. Adiciona botões para Recolher Painel Direito, Expandir Modal de Criação, Expandir Imagens e Visualizar Tickets Vinculados."; description = "Descrição da extensão" }
  "settingsTitle" = @{ message = "Jira Optimizer - Configurações"; description = "Título principal do popup de configurações" }
  "reloadRequired" = @{ message = "Recarregamento necessário!"; description = "Aviso quando é necessário recarregar" }
  "globalSettings" = @{ message = "Configurações Globais"; description = "Seção de configurações globais" }
  "enableFeatures" = @{ message = "Habilitar Funcionalidades"; description = "Rótulo do toggle para habilitar todas as funcionalidades" }
  "features" = @{ message = "Funcionalidades"; description = "Seção de funcionalidades" }
  "collapseRightPanel" = @{ message = "Recolher Painel Direito"; description = "Funcionalidade para recolher o painel direito" }
  "expandCreateModal" = @{ message = "Expandir Modal de Criação"; description = "Funcionalidade para expandir o modal de criação" }
  "viewLinkedTickets" = @{ message = "Visualizar Tickets Vinculados"; description = "Funcionalidade para visualizar tickets vinculados" }
  "expandImages" = @{ message = "Expandir Imagens"; description = "Funcionalidade para expandir imagens" }
  "collapseRightPaneTitle" = @{ message = "Recolher painel direito ]"; description = "Título do botão para recolher o painel direito (atalho ])" }
  "openRightPaneTitle" = @{ message = "Abrir painel direito ]"; description = "Título quando o painel direito está recolhido (atalho ])" }
  "collapseModalTitle" = @{ message = "Recolher modal ]"; description = "Título do botão para recolher o modal (atalho ])" }
  "expandModalTitle" = @{ message = "Expandir modal ]"; description = "Título quando o modal está recolhido (atalho ])" }
  "expandImagesTitle" = @{ message = "Expandir/Recolher imagens (Ctrl+Shift+Z)"; description = "Título do botão para expandir/recolher imagens com atalho (Ctrl+Shift+Z)" }
  "byExtension" = @{ message = "Por Jira Optimizer"; description = "Texto de atribuição da extensão" }
  "linkedTicketsTitle" = @{ message = "Tickets Vinculados"; description = "Título do tooltip de tickets vinculados" }
  "noLinkedTickets" = @{ message = "Nenhum ticket vinculado."; description = "Mensagem quando não há tickets vinculados" }
  "errorTitle" = @{ message = "Erro"; description = "Título de erro" }
  "assigneeTitle" = @{ message = "Responsável: $assignee$"; description = "Tooltip do responsável" }
  "issueTypeTitle" = @{ message = "$type$ ($relationship$)"; description = "Tooltip do tipo de issue" }
  "issueAriaLabel" = @{ message = "$key$ $status$"; description = "Rótulo ARIA da issue" }
  "loadingLinkedTickets" = @{ message = "Carregando tickets vinculados..."; description = "Mensagem de carregamento para o tooltip de tickets vinculados" }
}

# Exemplo adicional para es
$map["es"] = @{
  "extName" = @{ message = "Optimizador Jira"; description = "Nombre de la extensión" }
  "extDesc" = @{ message = "Jira. Añade botones para Colapsar el Panel Derecho, Expandir el Modal de Creación, Ampliar Imágenes y Ver Tickets Vinculados."; description = "Descripción de la extensión" }
  "settingsTitle" = @{ message = "Optimizador Jira - Configuración"; description = "Título principal del popup de configuración" }
  "reloadRequired" = @{ message = "¡Recarga requerida!"; description = "Mensaje de advertencia cuando es necesario recargar" }
  "globalSettings" = @{ message = "Configuración Global"; description = "Sección de configuraciones globales" }
  "enableFeatures" = @{ message = "Habilitar Funciones"; description = "Etiqueta del interruptor para habilitar todas las funciones" }
  "features" = @{ message = "Funciones"; description = "Sección de funciones" }
  "collapseRightPanel" = @{ message = "Colapsar Panel Derecho"; description = "Función para colapsar el panel derecho" }
  "expandCreateModal" = @{ message = "Expandir Modal de Creación"; description = "Función para expandir el modal de creación" }
  "viewLinkedTickets" = @{ message = "Ver Tickets Vinculados"; description = "Función para ver tickets vinculados" }
  "expandImages" = @{ message = "Ampliar Imágenes"; description = "Función para ampliar imágenes" }
  "collapseRightPaneTitle" = @{ message = "Colapsar panel derecho ]"; description = "Título del botón para colapsar el panel derecho (atalho ])" }
  "openRightPaneTitle" = @{ message = "Abrir panel derecho ]"; description = "Título cuando el panel derecho está colapsado (atalho ])" }
  "collapseModalTitle" = @{ message = "Colapsar modal ]"; description = "Título del botón para colapsar el modal (atalho ])" }
  "expandModalTitle" = @{ message = "Expandir modal ]"; description = "Título cuando el modal está colapsado (atalho ])" }
  "expandImagesTitle" = @{ message = "Ampliar/Colapsar imágenes (Ctrl+Shift+Z)"; description = "Título para ampliar/colapsar imágenes con atalho (Ctrl+Shift+Z)" }
  "byExtension" = @{ message = "Por Optimizador Jira"; description = "Texto de atribución de la extensión" }
  "linkedTicketsTitle" = @{ message = "Tickets Vinculados"; description = "Título del tooltip de tickets vinculados" }
  "noLinkedTickets" = @{ message = "Sin tickets vinculados."; description = "Mensaje cuando no se encuentran tickets vinculados" }
  "errorTitle" = @{ message = "Error"; description = "Título de error" }
  "assigneeTitle" = @{ message = "Responsable: $assignee$"; description = "Tooltip del responsable" }
  "issueTypeTitle" = @{ message = "$type$ ($relationship$)"; description = "Tooltip del tipo de issue" }
  "issueAriaLabel" = @{ message = "$key$ $status$"; description = "Etiqueta ARIA de la issue" }
  "loadingLinkedTickets" = @{ message = "Cargando tickets vinculados..."; description = "Mensaje de carga para el tooltip de tickets vinculados" }
}

# Fallback: use en for unspecified locales

Write-Host "Script criado. Agora vou executar para aplicar as alterações (com confirmação)."

# Gather dirs
$dirs = Get-ChildItem -Path $root -Directory
$toWrite = @()

foreach ($d in $dirs) {
  $loc = $d.Name
  $file = Join-Path $d.FullName "messages.json"
  if (-not (Test-Path $file)) { continue }
  try {
    $jsonText = Get-Content -Path $file -Raw -ErrorAction Stop
    $json = $jsonText | ConvertFrom-Json -ErrorAction Stop
  } catch {
    Write-Warning "Erro ao ler JSON: $file — pulando."
    continue
  }

  $localMap = if ($map.ContainsKey($loc)) { $map[$loc] } else { $map["en"] }
  $changed = $false

  foreach ($key in $localMap.PSObject.Properties.Name) {
    $val = $localMap.$key
    if (-not $json.PSObject.Properties.Match($key)) {
      $json | Add-Member -MemberType NoteProperty -Name $key -Value @{ message = $val.message; description = $val.description } -Force
      $changed = $true
    } else {
      if ($json.$key.message -ne $val.message) { $json.$key.message = $val.message; $changed = $true }
      if ($json.$key.description -ne $val.description) { $json.$key.description = $val.description; $changed = $true }
    }
  }

  if ($changed) { $toWrite += @{ file = $file; json = $json; loc = $loc } ; Write-Host "Alteração pendente: $loc -> $file" } else { Write-Host "Sem alteração: $loc" }
}

if ($toWrite.Count -eq 0) { Write-Host "Nenhuma alteração necessária."; exit 0 }

Write-Host "\nResumo de arquivos a serem atualizados:"; foreach ($item in $toWrite) { Write-Host " - $($item.loc) : $($item.file)" }
$confirm = Read-Host "Confirmar gravação (Y/N)?"
if ($confirm -ne "Y" -and $confirm -ne "y") { Write-Host "Operação cancelada pelo usuário."; exit 1 }

foreach ($item in $toWrite) { $outJson = $item.json | ConvertTo-Json -Depth 10; Set-Content -Path $item.file -Value $outJson -Encoding UTF8; Write-Host "Gravado: $($item.file)" }

Write-Host "Concluído."