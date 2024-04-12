const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY 

const verifyTokenAndRole = (requiredRole = null) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            console.log("No token provided.");
            return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
        }

        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) {
                console.log("Invalid or expired token.");
                return res.status(403).json({ message: 'Token no válido o expirado.' });
            }

            if (requiredRole && user.role !== requiredRole) {
                console.log("User role is not sufficient.");
                return res.status(403).json({ message: 'No tienes permiso para realizar esta acción.' });
            }

            console.log("User verified successfully.");
            req.user = user;
            next();
        });
    };
};


module.exports = verifyTokenAndRole;
