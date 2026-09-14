const bcrypt = require('bcrypt');
const db = require('./db');

async function resetAdmin() {
  try {
    const password = 'admin123';
    // Generar un hash nuevo y fresco
    const hash = await bcrypt.hash(password, 10);
    
    console.log('Generando nuevo hash para admin123...');
    console.log('Nuevo hash:', hash);
    
    // Intentar actualizar la contraseña del admin
    const [result] = await db.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hash, 'admin@admin.com']
    );
    
    if (result.affectedRows > 0) {
      console.log('¡Éxito! Contraseña de admin@admin.com reseteada correctamente en la base de datos a: admin123');
    } else {
      console.log('No se encontró el usuario admin@admin.com para actualizar. Verificando si existen usuarios...');
      const [rows] = await db.execute('SELECT * FROM users');
      console.log('Usuarios actuales en BD:', rows.map(u => ({ email: u.email, id: u.id, role: u.role })));
      
      if (rows.length === 0 || !rows.find(u => u.email === 'admin@admin.com')) {
        console.log('Insertando usuario admin por defecto...');
        await db.execute(
          'INSERT INTO users (nombre, email, password, role) VALUES (?, ?, ?, ?)',
          ['Administrador', 'admin@admin.com', hash, 'ADMIN']
        );
        console.log('¡Éxito! Usuario admin@admin.com creado con contraseña: admin123');
      }
    }
  } catch (error) {
    console.error('Ocurrió un error al resetear la contraseña:', error);
  } finally {
    process.exit(0);
  }
}

resetAdmin();
