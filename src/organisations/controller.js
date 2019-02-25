module.exports = class Controller {
  constructor(service) {
    this.service = service;
  }

  search(request, h) {
    const { name } = request.query;
    return this.service.search(name);
  }

  async find(request, h) {
    const {
      limit = 10,
      skip = 0,
      sort = 'name',
      order = 'ascend',
      ...filters
    } = request.query;

    const data = await this.service.find(filters, {
      limit,
      skip,
      sort,
      order,
    });

    const count = await this.service.count(filters);
    return { data, count };
  }

  async findById(request, h) {
    const { _id } = request.params;
    const { accept } = request.headers;

    let res;
    if (accept === 'application/ld+json') {
      res = await this.service.findByIdAsJSONLD(_id);
    } else {
      res = await this.service.findById(_id);
    }

    if (!res) return h.notFound();
    return res;
  }

  create(request, h) {
    const { payload } = request;
    return this.service.create(payload);
  }

  async update(request, h) {
    const { _id } = request.params;
    const { payload } = request;
    const res = await this.service.update(_id, payload);

    if (!res) return h.notFound();
    return res;
  }

  async remove(request, h) {
    const { _id } = request.params;
    const res = await this.service.remove(_id);

    if (!res) return h.notFound();
    return res;
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
