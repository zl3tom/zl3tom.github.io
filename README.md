# ZL3TOM Node.js Website

This package runs the ZL3TOM amateur-radio website as a small Node.js service on an Oracle Cloud Free VM. It includes a responsive photo gallery, Flag Counter, accessible QRZ Logbook viewer, full-content global site search, live international radio clocks, complete social sharing previews, SEO metadata and 18 beginner-friendly guides. The Contact page includes a secure form protected by Cloudflare Turnstile; messages are delivered to `thomas@zl3tom.com` through Fastmail SMTP.

The Node server listens only on `127.0.0.1:3000`. Your existing Apache server handles public traffic for `zl3tom.com` and forwards it to Node. This keeps the existing Cloudlog site at `log.zl3tom.com` separate.

## 1. Upload the ZIP from Windows

You can use WinSCP, or run this in Windows PowerShell from the folder containing the ZIP:

```powershell
scp .\ZL3TOM-Node-Oracle-VM.zip ubuntu@152.67.121.60:/home/ubuntu/
```

If your Oracle VM uses a different public IP address, replace `152.67.121.60`.

## 2. Install Node.js 24 LTS and PM2

Connect to the VM and run:

```bash
sudo apt update
sudo apt install -y curl unzip
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
node --version
npm --version
```

## 3. Unpack and test the website

```bash
cd /home/ubuntu
unzip ZL3TOM-Node-Oracle-VM.zip
cd ZL3TOM-Node-Oracle-VM
npm run check
npm start
```

Open a second SSH window and test it:

```bash
curl http://127.0.0.1:3000/healthz
```

The response should be:

```json
{"status":"ok","site":"ZL3TOM"}
```

Press `Ctrl+C` in the first window after the test.

## 4. Keep Node running with PM2

```bash
cd /home/ubuntu/ZL3TOM-Node-Oracle-VM
pm2 start ecosystem.config.cjs
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

If PM2 prints another command, copy and run that command, then run:

```bash
pm2 save
pm2 status
```

Do not open port `3000` in Oracle Cloud or UFW. Node is intentionally private behind Apache.

## 5. Add the Apache website

This VM already uses Apache for Cloudlog, so do not install Nginx.

```bash
sudo a2enmod proxy proxy_http headers ssl rewrite
sudo cp /home/ubuntu/ZL3TOM-Node-Oracle-VM/deploy/apache-zl3tom.conf /etc/apache2/sites-available/zl3tom.conf
sudo a2ensite zl3tom.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

Test Apache locally:

```bash
curl -I -H 'Host: zl3tom.com' http://127.0.0.1/
```

You should receive an HTTP response from the ZL3TOM site. The separate `log.zl3tom.com` Apache virtual host remains unchanged.

## 6. Change the Cloudflare DNS records

The four current `zl3tom.com` A records point to GitHub Pages. Remove these four records:

- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

Add this record if the Node website is going on the same VM as `log.zl3tom.com`:

| Type | Name | Target | Proxy initially |
| --- | --- | --- | --- |
| A | `@` | `152.67.121.60` | DNS only |
| CNAME | `www` | `zl3tom.com` | DNS only |

Use your actual Oracle public IP if it is not `152.67.121.60`.

Leave these existing records alone:

- `log.zl3tom.com`
- All MX email records
- Google site-verification TXT record
- SPF TXT record

## 7. Check ports 80 and 443

If `log.zl3tom.com` already loads publicly, these ports are probably open. Otherwise, add Oracle Cloud ingress rules for TCP ports `80` and `443` from `0.0.0.0/0`.

If UFW is enabled:

```bash
sudo ufw status
sudo ufw allow 'Apache Full'
```

## 8. Add free HTTPS

Keep the Cloudflare `@` and `www` records set to **DNS only** while obtaining the certificate:

```bash
sudo apt install -y certbot python3-certbot-apache
sudo certbot --apache -d zl3tom.com -d www.zl3tom.com --redirect
```

After Certbot succeeds:

1. Change the Cloudflare `@` and `www` records to **Proxied** (orange cloud).
2. In Cloudflare, open **SSL/TLS → Overview**.
3. Select **Full (strict)**.

Test the public website:

```bash
curl -I https://zl3tom.com
```

## 9. Connect the secure contact form

The form is already built into the website. It stays disabled until the private Fastmail and Cloudflare settings below are added on the VM.

### Create a Fastmail app password

1. Sign in to Fastmail.
2. Open **Settings → Privacy & Security → Connected apps & API tokens**.
3. Create an app password named `ZL3TOM website` with mail access.
4. Copy it once. Use this app password below, not your normal Fastmail password.

### Create a Cloudflare Turnstile widget

1. In Cloudflare, open **Turnstile** and choose **Add widget**.
2. Name it `ZL3TOM contact form` and select **Managed** mode.
3. Add both hostnames: `zl3tom.com` and `www.zl3tom.com`.
4. Copy the site key and secret key.

### Add the private settings on the VM

```bash
cd /home/ubuntu/zl3tom-site
cp -n .env.example .env
nano .env
```

The Fastmail sign-in address is `thomas@tdbnz.email`, while messages are sent to and shown as coming from the public `thomas@zl3tom.com` address. Fill in the private values and confirm these addresses:

```dotenv
SMTP_USER=thomas@tdbnz.email
SMTP_PASS=your-fastmail-app-password
CONTACT_TO=thomas@zl3tom.com
CONTACT_FROM=thomas@zl3tom.com
TURNSTILE_SITE_KEY=your-turnstile-site-key
TURNSTILE_SECRET=your-turnstile-secret-key
```

Save in nano with `Ctrl+O`, press `Enter`, then exit with `Ctrl+X`. Lock down the file, install the dependency, and restart the site:

```bash
chmod 600 .env
npm install --omit=dev
npm run check
pm2 restart zl3tom
pm2 save
curl http://127.0.0.1:3000/api/contact-config
```

The final command should show `"enabled":true`. The site key is public by design; the secret and Fastmail app password must never be committed to GitHub. The `.gitignore` file already excludes `.env`.

## Useful management commands

```bash
pm2 status
pm2 logs zl3tom
pm2 restart zl3tom
sudo systemctl status apache2 --no-pager
sudo apache2ctl configtest
```

## Updating the website later

After committing and pushing website changes to GitHub, update the live VM with:

```bash
cd /home/ubuntu/zl3tom-site
git pull --ff-only
npm install --omit=dev
npm run check
pm2 restart zl3tom
pm2 save
curl http://127.0.0.1:3000/healthz
```

The private `.env` file remains on the VM and is not replaced by `git pull`.

If you edit the guide generator or station-page generator, rebuild those pages before checking and restarting:

```bash
npm run build
npm run check
```
