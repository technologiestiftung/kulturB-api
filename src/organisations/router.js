module.exports = (controller, validation) => [
  {
    method: 'GET',
    path: '/',
    handler: controller.find,
    config: {
      auth: false,
    },
  }, {
    method: 'GET',
    path: '/{_id}',
    handler: controller.findById,
    config: {
      validate: validation.findById,
      auth: false,
      plugins: {
        policies: ['json-ld'],
      },
    },
  }, {
    method: 'POST',
    path: '/',
    handler: controller.create,
    config: {
      validate: validation.create,
      auth: 'jwt',
      plugins: {
        hapiAuthorization: { role: 'ADMIN' },
      },
    },
  }, {
    method: 'PUT',
    path: '/{_id}',
    handler: controller.update,
    config: {
      validate: validation.update,
      auth: 'jwt',
      plugins: {
        hapiAuthorization: { role: 'USER' },
        policies: ['isOwnOrganisation'],
      },
    },
  }, {
    method: 'DELETE',
    path: '/{_id}',
    handler: controller.remove,
    config: {
      validate: validation.remove,
      auth: 'jwt',
      plugins: {
        hapiAuthorization: { role: 'ADMIN' },
      },
    },
  }, {
    method: ['PUT', 'DELETE'],
    path: '/{_id}/{relation}/{relId}',
    handler: controller.handleRelation,
    config: {
      validate: validation.relation,
      auth: 'jwt',
      plugins: {
        hapiAuthorization: { role: 'USER' },
      },
    },
  },
];
