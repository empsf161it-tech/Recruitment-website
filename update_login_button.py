import os
import re

directory = r"d:\project 3\Recruitment"

pattern = re.compile(
    r'<a href="login\.html" class="drawer-link">\s*<svg[^>]*>.*?</svg>\s*Login\s*</a>',
    re.DOTALL
)

replacement = '''<div style="padding: var(--space-4);">
        <a href="login.html" class="btn btn-primary" style="width: 100%; justify-content: center; gap: var(--space-2);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          Login
        </a>
      </div>'''

count = 0
for filename in os.listdir(directory):
    if filename.endswith(".html"):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = pattern.sub(replacement, content)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            count += 1
            print(f"Updated {filename}")

print(f"Total files updated: {count}")
