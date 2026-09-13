# Astros 2 Web
<!-- GERENCIADOR-SERVIDORES:INICIO -->
## Execução local

Interface web do Astros 2.

Porta principal reservada: `3031`. As portas são administradas centralmente para permitir vários projetos abertos ao mesmo tempo.

```powershell
# Iniciar
powershell -ExecutionPolicy Bypass -File "C:\Projetos\GERENCIADOR-SERVIDORES\servidores.ps1" iniciar "astros-2-web"

# Consultar o estado
powershell -ExecutionPolicy Bypass -File "C:\Projetos\GERENCIADOR-SERVIDORES\servidores.ps1" status

# Encerrar
powershell -ExecutionPolicy Bypass -File "C:\Projetos\GERENCIADOR-SERVIDORES\servidores.ps1" parar "astros-2-web"
```

Os registros de execução ficam em `C:\Projetos\GERENCIADOR-SERVIDORES\logs`. O gerenciador não copia arquivos `.env`; como os logs reproduzem a saída do próprio aplicativo, revise-os antes de compartilhar.
<!-- GERENCIADOR-SERVIDORES:FIM -->
