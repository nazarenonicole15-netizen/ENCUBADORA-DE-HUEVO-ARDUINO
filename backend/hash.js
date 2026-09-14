const bcrypt = require('bcrypt');

const passwordToHash = process.argv[2] || 'admin123';

async function generateHash() {
  try {
    const hash = await bcrypt.hash(passwordToHash, 10);
    console.log(`Password: ${passwordToHash}`);
    console.log(`Hash: ${hash}`);
    
    // Si necesitas actualizar directamente en la base de datos desde aquí:
    const db = require('./db');
    await db.execute('UPDATE users SET password = ? WHERE email = ?', [hash, 'admin@admin.com']);
    console.log('¡Contraseña del administrador (admin@admin.com) actualizada exitosamente en la base de datos!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

generateHash();
