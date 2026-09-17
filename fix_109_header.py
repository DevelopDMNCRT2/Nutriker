import re

with open('herramienta-nutricion/src/components/Header.jsx', 'r') as f:
    c = f.read()

# Fix the function signature
c = re.sub(r'<<<<<<< HEAD\n=======\nexport default function Header[^\n]+\n>>>>>>> origin/main\n', '', c)
c = c.replace('  currentUser,\n', '  currentUser,\n  isAdmin,\n')

# Fix the getRoleBadge
c = re.sub(r'<<<<<<< HEAD\n=======\n    if \(isAdmin\).*?\n>>>>>>> origin/main\n', "    if (isAdmin) return { label: 'Administrador', color: '#7C3AED', bg: '#F5F3FF' };\n", c)

# For the switchers, we want both. The structure is complex.
# We will just remove the conflict markers and let both render.
# Wait, the second conflict block splits the `div` style. 
# It's better to just extract HEAD's switcher and MAIN's switcher.

# Let's just remove the markers and fix the syntax manually if needed.
c = c.replace('<<<<<<< HEAD\n', '')
c = c.replace('=======\n', '')
c = c.replace('>>>>>>> origin/main\n', '')

with open('herramienta-nutricion/src/components/Header.jsx', 'w') as f:
    f.write(c)

