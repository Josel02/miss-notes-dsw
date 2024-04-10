const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY 

const verifyTokenAndRole = (requiredRole = null) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
        }

        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Token no válido o expirado.' });
            }

            // Si se especificó un rol requerido, verificar que el usuario tenga ese rol
            if (requiredRole && user.role !== requiredRole) {
                return res.status(403).json({ message: 'No tienes permiso para realizar esta acción.' });
            }

            // Si todo está correcto, agregar el usuario al request para su uso posterior
            req.user = user;
            next();
        });
    };
};

module.exports = verifyTokenAndRole;
