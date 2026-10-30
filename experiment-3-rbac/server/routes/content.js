const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// Mock content database
let mockArticles = [
  {
    id: 1,
    title: 'Modern Architecture in Microservices',
    summary: 'Best practices for scalable decoupling and independent deployments.',
    author: 'Eleanor Admin',
    lastModified: '2026-08-10',
    accessLevel: 'Public'
  },
  {
    id: 2,
    title: 'Zero Trust Security & Token Rotation Strategies',
    summary: 'How short-lived access tokens combined with secure refresh tokens mitigate replay attacks.',
    author: 'Ethan Editor',
    lastModified: '2026-08-11',
    accessLevel: 'Internal'
  },
  {
    id: 3,
    title: 'Optimizing React Rendering Cycles',
    summary: 'A deep dive into memoization, Context splitting, and DOM diffing heuristics.',
    author: 'Victor Viewer',
    lastModified: '2026-08-12',
    accessLevel: 'Internal'
  }
];

/**
 * GET /api/content
 * Accessible by: ALL authenticated users (Admin, Editor, Viewer)
 */
router.get('/content', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: `Content retrieved successfully by ${req.user.name} (${req.user.role})`,
    user: req.user,
    data: mockArticles
  });
});

/**
 * POST /api/content/edit
 * Accessible by: Admin, Editor only
 */
router.post('/content/edit', verifyToken, authorizeRoles('Admin', 'Editor'), (req, res) => {
  const { id, title, summary } = req.body;
  const item = mockArticles.find(a => a.id === Number(id));

  if (!item) {
    return res.status(404).json({ success: false, message: 'Article not found.' });
  }

  if (title) item.title = title;
  if (summary) item.summary = summary;
  item.lastModified = new Date().toISOString().split('T')[0];

  res.json({
    success: true,
    message: `Article #${id} updated successfully by ${req.user.name} (${req.user.role}).`,
    article: item
  });
});

/**
 * DELETE /api/content/delete/:id
 * Accessible by: Admin ONLY
 */
router.delete('/content/delete/:id', verifyToken, authorizeRoles('Admin'), (req, res) => {
  const id = Number(req.params.id);
  const exists = mockArticles.some(a => a.id === id);

  if (!exists) {
    return res.status(404).json({ success: false, message: `Article #${id} not found.` });
  }

  mockArticles = mockArticles.filter(a => a.id !== id);

  res.json({
    success: true,
    message: `Article #${id} permanently deleted by Admin ${req.user.name}.`,
    remainingArticles: mockArticles
  });
});

/**
 * GET /api/admin/metrics
 * Accessible by: Admin ONLY
 */
router.get('/admin/metrics', verifyToken, authorizeRoles('Admin'), (req, res) => {
  res.json({
    success: true,
    metrics: {
      totalUsers: 3,
      activeSessions: 1,
      serverUptime: '99.98%',
      securityAlerts: 0,
      tokenRotationsCount: 42,
      systemHealth: 'Optimal'
    },
    message: 'System audit telemetry retrieved successfully.'
  });
});

/**
 * GET /api/editor/drafts
 * Accessible by: Admin, Editor ONLY
 */
router.get('/editor/drafts', verifyToken, authorizeRoles('Admin', 'Editor'), (req, res) => {
  res.json({
    success: true,
    drafts: [
      { id: 101, title: 'Draft: RBAC Best Practices with React Router v6', status: 'In Review' },
      { id: 102, title: 'Draft: Axios Interceptor Retry Queuing Patterns', status: 'Draft' }
    ],
    message: 'Editor drafts retrieved successfully.'
  });
});

module.exports = router;
