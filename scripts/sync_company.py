"""
sync_company.py - Synchronizes single-source-of-truth company data from
data/company.json across all HTML files, JSON-LD schemas, footers, and text manifests.
"""

import json
import os
import re
import glob

def sync():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    config_path = os.path.join(root_dir, 'data', 'company.json')

    with open(config_path, 'r', encoding='utf-8') as f:
        cfg = json.load(f)

    addr = cfg['address']
    contact = cfg['contact']
    founder = cfg['founder']
    social = cfg['social']

    print(f"Syncing company data from {config_path}...")
    print(f"Address: {addr['full']}")
    print(f"Phone: {contact['phone']}")
    print(f"Email: {contact['email']}")

    html_files = glob.glob(os.path.join(root_dir, '*.html'))
    for hf in html_files:
        with open(hf, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 1. Update Footer address
        content = re.sub(
            r'<address>.*?</address>',
            f"<address>{addr['short']}</address>",
            content
        )

        # 2. Update Footer phone
        content = re.sub(
            r'<li class="footer-contact-item">\s*<a href="tel:\+91\d+" class="footer-link">.*?</a>\s*</li>',
            f'<li class="footer-contact-item"><a href="tel:{contact["phoneRaw"]}" class="footer-link">{contact["phone"]}</a></li>',
            content
        )

        # 3. Update Footer email
        content = re.sub(
            r'<a href="mailto:[^"]+" class="footer-link">.*?</a>',
            f'<a href="mailto:{contact["email"]}" class="footer-link">{contact["email"]}</a>',
            content
        )

        # 4. Update JSON-LD PostalAddress
        content = re.sub(
            r'("streetAddress":\s*")[^"]*(")',
            rf'\g<1>{addr["street"]}\g<2>',
            content
        )
        content = re.sub(
            r'("postalCode":\s*")[^"]*(")',
            rf'\g<1>{addr["postalCode"]}\g<2>',
            content
        )
        content = re.sub(
            r'("telephone":\s*")[^"]*(")',
            rf'\g<1>{contact["phoneTel"]}\g<2>',
            content
        )
        content = re.sub(
            r'("email":\s*")[^"]*(")',
            rf'\g<1>{contact["email"]}\g<2>',
            content
        )

        # 5. Update Contact page office location address
        if os.path.basename(hf) == 'contact.html':
            content = re.sub(
                r'<address class="info-value">.*?</address>',
                f'<address class="info-value">{addr["street"]}<br>{addr["locality"]}, {addr["region"]} {addr["postalCode"]}</address>',
                content,
                flags=re.DOTALL
            )

        # 6. Update Privacy & Terms contact address
        if os.path.basename(hf) in ['privacy.html', 'terms.html']:
            content = re.sub(
                r'Attention: Nithyananthan Nagarajan, Founder and Managing Director<br>\s*[^<]+<br>',
                f'Attention: Nithyananthan Nagarajan, Founder and Managing Director<br>\n          {addr["full"]}<br>',
                content
            )

        with open(hf, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ Synced {os.path.basename(hf)}")

    # Sync llms.txt & llms-full.txt
    for lf_name in ['llms.txt', 'llms-full.txt']:
        lf_path = os.path.join(root_dir, lf_name)
        if os.path.exists(lf_path):
            with open(lf_path, 'r', encoding='utf-8') as f:
                txt = f.read()
            txt = re.sub(r'- Location:.*', f"- Location: {addr['full']}", txt)
            txt = re.sub(r'(- Phone:|\* Phone:|- Direct Phone:).*', rf"\g<1> {contact['phone']}", txt)
            txt = re.sub(r'(- Email:|\* Email:|- Official Email:).*', rf"\g<1> {contact['email']}", txt)
            with open(lf_path, 'w', encoding='utf-8') as f:
                f.write(txt)
            print(f"  ✓ Synced {lf_name}")

    print("Synchronization complete!")

if __name__ == '__main__':
    sync()
