import JetPaths from 'jet-paths';

const PermissionsPaths = {
  _: '/api',
  Permissions: {
    _: '/permissions',
    List: '/all',           // GET  /api/permissions/all
    Get: '/:id',            // GET  /api/permissions/:id
    Create: '/',            // POST /api/permissions/
    Update: '/:id',         // PUT  /api/permissions/:id
    Delete: '/:id',         // DELETE /api/permissions/:id
  },
  Roles: {
    _: '/roles',
    List: '/all',
    Get: '/:id',
    Create: '/',
    AssignPermissions: '/:id/permissions',  // POST /api/roles/:id/permissions
  },
} as const;

export const JetPermissionsPaths = JetPaths(PermissionsPaths);
export default PermissionsPaths;