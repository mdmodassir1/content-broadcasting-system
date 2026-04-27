require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
const contentRoutes = require('./src/routes/contentRoutes');
const approvalRoutes = require('./src/routes/approvalRoutes');
const publicRoutes = require('./src/routes/publicRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/approval', approvalRoutes);
app.use('/api/public', publicRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'Content Broadcasting System API',
        status: 'running',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login'
            },
            content: {
                upload: 'POST /api/content/upload (teacher, multipart)',
                myContent: 'GET /api/content/my-content (teacher)'
            },
            approval: {
                pending: 'GET /api/approval/pending (principal)',
                approve: 'PUT /api/approval/:id/approve (principal)',
                reject: 'PUT /api/approval/:id/reject (principal)'
            },
            public: {
                live: 'GET /api/public/live/:teacherId'
            }
        }
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});