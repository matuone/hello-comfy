# Guía de Deploy a Servidor Donweb

## Requisitos
- Acceso SSH a `root@200.58.98.98`
- Contraseña SSH: (guardada localmente)
- Repositorio en GitHub público: `https://github.com/matuone/hello-comfy.git`
- Token GitHub (si repo es privado): Guardado en `.env.local` (NO incluir secreos en archivos)

## Ubicaciones del Repositorio en Servidor
- **Producción**: `/var/www/hello-comfy`
- **Desarrollo**: `/root/hello-comfy`

## Paso 1: Commit y Push Local (Windows/PC)
```bash
cd /c/Users/matia/OneDrive/Desktop/hello-comfy
git status
git add .
git commit -m "Tu mensaje"
git push origin master
```

## Paso 2: Pull en Servidor (Automático)
Ejecutar el script PowerShell:
```bash
cd /c/Users/matia/OneDrive/Desktop/hello-comfy
pwsh -File ./pull-server.ps1
```

O con bash manualmente:
```bash
bash << 'EOF'
ssh root@200.58.98.98 << SSHEOF
  cd /var/www/hello-comfy
  git pull origin master
  echo "✓ /var/www actualizado"
  
  cd /root/hello-comfy  
  git stash
  git pull origin master
  echo "✓ /root actualizado"
SSHEOF
EOF
```

## Paso 3: Compilar Frontend en Servidor (IMPORTANTE)
El servidor usa `/dist` compilado con Vite, no los archivos source. **Siempre hacer build después del pull**:

```bash
ssh root@200.58.98.98 "cd /var/www/hello-comfy && npm run build && echo '✓ Build completado'"
```

O incluido en el mismo comando:
```bash
bash << 'EOF'
ssh root@200.58.98.98 << SSHEOF
  cd /var/www/hello-comfy
  git pull origin master
  npm run build
  echo "✓ Build y actualización completada"
SSHEOF
EOF
```

## Paso 4: Verificar Actualización
```bash
ssh root@200.58.98.98 "cd /var/www/hello-comfy && git log --oneline -1"
```

## Notas
- Si el repo es **privado**, usar token en URL: `https://usuario:TOKEN@github.com/...`
- Si hay **cambios locales** en `/root/hello-comfy`, se usan `git stash` antes del pull
- El servidor tiene dos clones: uno en `/var/www` (producción) y otro en `/root` (desarrollo)

## Troubleshooting
- **Error de permisos**: Verificar que la rama es `master` o `main` correctamente
- **Cambios locales**: Usar `git stash` para guardarlos antes del pull
- **Conexión SSH**: Probar `ssh root@200.58.98.98` manualmente
