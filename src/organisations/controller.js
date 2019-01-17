module.exports = class Controller {
  constructor(service) {
    this.service = service;
  }

  find(request, h) {
    const { limit, skip, ...filters } = request.query;
    return this.service.find(filters, { limit, skip });
  }

  findById(request, h) {
    const { _id } = request.params;
    return this.service.findById(_id);
  }

  create(request, h) {
    const { payload } = request;
    return this.service.create(payload);
  }

  update(request, h) {
    const { _id } = request.params;
    const { payload } = request;
    return this.service.update(_id, { $set: payload });
  }

  remove(request, h) {
    const { _id } = request.params;
    return this.service.remove(_id);
  }

  handleRelation(request, h) {
    const { _id, relation, relId } = request.params;

    if (request.method === 'put') {
      return this.service.addRelation(_id, relation, relId);
    }
    if (request.method === 'delete') {
      return this.service.removeRelation(_id, relation, relId);
    }
  }
};
